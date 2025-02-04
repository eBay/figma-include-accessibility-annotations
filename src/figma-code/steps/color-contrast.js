import { contrast } from '@/constants';

// https://github.com/romannurik/Figma-Contrast
export const scan = async (msg) => {
  const { page } = msg;

  const frameNode = await figma.getNodeByIdAsync(page.id);
  const duplicate = frameNode.clone();
  const nodeIdMap = contrast.mapNodeIds(frameNode, duplicate);

  const EXPORT_SETTINGS = {
    format: 'PNG',
    contentsOnly: false,
    constraint: {
      type: 'SCALE',
      value: 1
    }
  };

  const imageWithTextLayers = await duplicate.exportAsync(EXPORT_SETTINGS);

  const textNodes = [];

  contrast.walk(
    duplicate,
    (node, { opacity }) => {
      let newOpacity = opacity;
      if ('opacity' in node && node.opacity) {
        newOpacity *= node.opacity;
      }

      if (node.type === 'TEXT' && !!node.visible) {
        // node = node as TextNode;
        textNodes.push({
          textNode: node,
          effectiveOpacity: newOpacity * node.opacity
        });
      }

      if (!('visible' in node) || !node.visible) {
        return 'skipchildren';
      }

      return { opacity: newOpacity };
    },
    { opacity: 1 }
  );

  const imageWithoutTextLayers = await duplicate.exportAsync(EXPORT_SETTINGS);

  const textNodeInfos = textNodes
    .map(({ textNode, effectiveOpacity }) => {
      let textStyleSamples = [];

      const colorsForPaint = (paint) => {
        switch (paint.type) {
          case 'SOLID':
            return [
              {
                ...paint.color,
                a: paint.opacity === undefined ? 1 : paint.opacity
              }
            ];

          case 'GRADIENT_LINEAR':
          case 'GRADIENT_RADIAL':
          case 'GRADIENT_ANGULAR':
          case 'GRADIENT_DIAMOND':
            return paint.gradientStops.map((stop) => stop.color);

          case 'IMAGE':
          default:
            return [];
        }
      };

      const isBold = ({ style }) => !!style.match(/medium|bold|black/i);

      const { fills, fontName, fontSize } = textNode;
      const { mixed } = figma;

      if (fontName === mixed || fontSize === mixed || fills === mixed) {
        const samples = new Set();

        for (let i = textNode.characters.length - 1; i >= 0; i -= 1) {
          const colors = Array.from(textNode.getRangeFills(i, i + 1)).flatMap(
            (paint) => colorsForPaint(paint)
          );

          colors.forEach((color) => {
            samples.add(
              JSON.stringify({
                isBold: isBold(textNode.getRangeFontName(i, i + 1)),
                textSize: textNode.getRangeFontSize(i, i + 1),
                color
              })
            );
          });
        }

        textStyleSamples = [...samples].map((s) => JSON.parse(s));
      } else {
        textStyleSamples = fills
          .flatMap((paint) => colorsForPaint(paint))
          .map((color) => ({
            isBold: isBold(fontName),
            textSize: fontSize,
            color
          }));
      }

      const textNodeInfo = {
        x: textNode.absoluteTransform[0][2] - duplicate.absoluteTransform[0][2],
        y: textNode.absoluteTransform[1][2] - duplicate.absoluteTransform[1][2],
        w: textNode.width,
        h: textNode.height,
        name: textNode.name,
        value: textNode.characters,
        nodeId: nodeIdMap.get(textNode.id),
        textStyleSamples,
        effectiveOpacity
      };

      textNode.opacity = 0;

      return textNodeInfo;
    })
    .filter((x) => !!x);

  duplicate.remove();

  const result = {
    name: frameNode.name,
    imageWithTextLayers,
    imageWithoutTextLayers,
    textNodeInfos,
    pageBgColor:
      contrast.pageContainingNode(frameNode)?.backgrounds?.[0]?.color,
    nodeId: frameNode.id,
    width: frameNode.width,
    height: frameNode.height
  };

  figma.ui.postMessage({
    type: 'color-contrast-result',
    data: {
      result
    }
  });
};

export default { scan };
