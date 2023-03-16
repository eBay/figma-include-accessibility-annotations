/**
 * Functionality for color contrast accessibility checks.
 * @module contrast
 */

const walk = (node, fn, context) => {
  const passdown = fn(node, context);
  if (passdown === 'skipchildren') {
    return;
  }

  if (node.children) {
    node.children.forEach((child) => walk(child, fn, passdown));
  }
};

const rgbToCssColor = ({ r, g, b }) => `rgb(${r * 255},${g * 255},${b * 255})`;

/**
 * Blends the given colors (RGBA dicts) using the "over" paint operation.
 */
const flattenColors = (fg, bg) => {
  // https://en.wikipedia.org/wiki/Alpha_compositing
  const a = fg.a + bg.a * (1 - fg.a);

  if (a === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
    a
  };
};

const formatContrastRatio = (contrastRatio) => {
  return isNaN(contrastRatio) ? 'NA' : `${contrastRatio.toFixed(2)}:1`;
};

/**
 * Mixes the given colors (RGBA dicts) at the given amount (0 to 1).
 */
const mixColors = (c1, c2, amount) => {
  // from tinycolor
  // https://github.com/bgrins/TinyColor/blob/master/tinycolor.js#L686
  // amount = amount === 0 ? 0 : amount || 50;
  const newAmount = amount === 0 ? 0 : amount || 50;

  return {
    r: (c2.r - c1.r) * newAmount + c1.r,
    g: (c2.g - c1.g) * newAmount + c1.g,
    b: (c2.b - c1.b) * newAmount + c1.b,
    a: (c2.a - c1.a) * newAmount + c1.a
  };
};

const detailFor = (numFail, numPass, minCR, maxCR) => {
  const note =
    minCR === maxCR
      ? formatContrastRatio(minCR)
      : `${formatContrastRatio(minCR)} – ${formatContrastRatio(maxCR)}`;
  if (numFail > 0 && numPass > 0) {
    return {
      status: 'mixed',
      contrastRatio: minCR,
      note
    };
  }
  if (numFail > 0) {
    return {
      status: 'fail',
      contrastRatio: minCR,
      note
    };
  }
  if (numPass > 0) {
    return {
      status: 'pass',
      contrastRatio: minCR,
      note
    };
  }
  return { status: 'unknown', contrastRatio: 0 };
};

/**
 * Calculates the luminance of the given RGB color.
 */
const srgbLuminance = ({ r, g, b }) => {
  // from tinycolor
  // https://github.com/bgrins/TinyColor/blob/master/tinycolor.js#L75
  // http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
  let R;
  let G;
  let B;

  if (r <= 0.03928) {
    R = r / 12.92;
  } else {
    // R = Math.pow((r + 0.055) / 1.055, 2.4);
    R = ((r + 0.055) / 1.055) ** 2.4;
  }

  if (g <= 0.03928) {
    G = g / 12.92;
  } else {
    // G = Math.pow((g + 0.055) / 1.055, 2.4);
    G = ((g + 0.055) / 1.055) ** 2.4;
  }

  if (b <= 0.03928) {
    B = b / 12.92;
  } else {
    // B = Math.pow((b + 0.055) / 1.055, 2.4);
    B = ((b + 0.055) / 1.055) ** 2.4;
  }

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

const decodeToImageData = async (bytes) => {
  const url = URL.createObjectURL(new Blob([bytes]));

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.canvas.width = image.width;
  ctx.canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);

  return imageData;
};

const getImageDataPixel = (imageData, x, y, constrain = true) => {
  x = Math.round(x);
  y = Math.round(y);

  if (constrain) {
    x = Math.max(0, Math.min(x, imageData.width - 1));
    y = Math.max(0, Math.min(y, imageData.height - 1));
  }

  if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
    return null;
  }

  return {
    r: imageData.data[(y * imageData.width + x) * 4] / 255,
    g: imageData.data[(y * imageData.width + x) * 4 + 1] / 255,
    b: imageData.data[(y * imageData.width + x) * 4 + 2] / 255,
    a: imageData.data[(y * imageData.width + x) * 4 + 3] / 255
  };
};

const pageContainingNode = (node) => {
  while (node?.type !== 'PAGE') {
    node = node.parent;
  }

  return node.type === 'PAGE' ? node : null;
};

const mapNodeIds = (original, dup) => {
  const map = new Map();
  const fromIds = [];
  const toIds = [];

  // walking the original and the duplicate should
  // always return corresponding nodes in the same order
  walk(original, (node) => fromIds.push(node.id));
  walk(dup, (node) => toIds.push(node.id));

  if (fromIds.length !== toIds.length) {
    // TODO: can this ever happen?
    return map;
  }

  for (const [idx, id] of toIds.entries()) {
    map.set(id, fromIds[idx]);
  }

  return map;
};

const computeTypeContrast = (textNodeInfo, bgImageData) => {
  const { x, y, w, h, textStyleSamples, effectiveOpacity } = textNodeInfo;

  if (!textStyleSamples.length) {
    // show error
    return {
      aa: { status: 'unknown', contrastRatio: 0 },
      aaa: { status: 'unknown', contrastRatio: 0 }
    };
  }

  const samplePoints = [
    // TODO: adaptive sampling?
    [x, y],
    // as of last testing, runtime diff. sampling 4 vs. 1 points only took ~5% longer
    [x + w - 1, y],
    [x, y + h - 1],
    [x + h - 1, y + h - 1]
  ];

  const stats = {
    aaFail: 0,
    aaPass: 0,
    aaaFail: 0,
    aaaPass: 0,
    minCR: Infinity,
    maxCR: 0
  };

  textStyleSamples.map(({ textSize, isBold, color }) => {
    const pointSize = textSize / 1.333333333; // CSS px -> pt
    const isLargeText = pointSize >= 18 || (isBold && pointSize >= 14);
    const passingAAContrastForLayer = isLargeText ? 3 : 4.5;
    const passingAAAContrastForLayer = isLargeText ? 4.5 : 7;

    samplePoints.map(([x_, y_]) => {
      let bgColor = getImageDataPixel(bgImageData, x_, y_);

      if (!bgColor) {
        // likely this sample point is out of bounds
      } else {
        bgColor = flattenColors(bgColor, { r: 1, g: 1, b: 1, a: 1 }); // flatten bgColor on a white matte

        const blendedTextColor = mixColors(
          bgColor,
          color,
          color.a * effectiveOpacity
        );

        const lum1 = srgbLuminance(blendedTextColor);
        const lum2 = srgbLuminance(bgColor);
        const contrastRatio =
          (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
        stats.minCR = Math.min(stats.minCR, contrastRatio);
        stats.maxCR = Math.max(stats.maxCR, contrastRatio);

        if (contrastRatio < passingAAContrastForLayer) {
          stats.aaFail += 1;
        } else {
          stats.aaPass += 1;
        }

        if (contrastRatio < passingAAAContrastForLayer) {
          stats.aaaFail += 1;
        } else {
          stats.aaaPass += 1;
        }
      }

      return null;
    });

    return null;
  });

  return {
    aa: detailFor(stats.aaFail, stats.aaPass, stats.minCR, stats.maxCR),
    aaa: detailFor(stats.aaaFail, stats.aaaPass, stats.minCR, stats.maxCR)
  };
};

const urlForImageBytes = (ui8arr) => {
  return URL.createObjectURL(new Blob([ui8arr]));
};

export default {
  computeTypeContrast,
  decodeToImageData,
  formatContrastRatio,
  mapNodeIds,
  pageContainingNode,
  rgbToCssColor,
  urlForImageBytes,
  walk
};
