/**
 * Methods for creating commonly-used layers and frames within the Figma document.
 *
 * @module figma-layer
 */

import colors from './colors';

const ARROW_SIZE = 200;

const arrowSpecs = {
  right: {
    width: ARROW_SIZE,
    height: 0,
    start: { x: 0, y: 0 },
    end: { x: ARROW_SIZE, y: 0 }
  },
  left: {
    width: ARROW_SIZE,
    height: 0,
    end: { x: 0, y: 0 },
    start: { x: ARROW_SIZE, y: 0 }
  },
  up: {
    width: 0,
    height: ARROW_SIZE,
    end: { x: 0, y: 0 },
    start: { x: 0, y: ARROW_SIZE }
  },
  down: {
    width: 0,
    height: ARROW_SIZE,
    end: { x: 0, y: ARROW_SIZE },
    start: { x: 0, y: 0 }
  },
  upRight: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    end: { x: ARROW_SIZE, y: 0 },
    start: { x: 0, y: ARROW_SIZE }
  },
  upLeft: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    end: { x: 0, y: 0 },
    start: { x: ARROW_SIZE, y: ARROW_SIZE }
  },
  downRight: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    end: { x: ARROW_SIZE, y: ARROW_SIZE },
    start: { x: 0, y: 0 }
  },
  downLeft: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    end: { x: 0, y: ARROW_SIZE },
    start: { x: ARROW_SIZE, y: 0 }
  },
  example: {
    width: 40,
    height: 0,
    start: { x: 0, y: 0 },
    end: { x: 40, y: 0 }
  }
};

/**
 * Create an arrow in Figma (VectorNode)
 *
 *
 * @param {Object} arrow - Arrow properties
 * @param {string} arrow.name - name of new Arrow
 * @param {number} arrow.x - x of new Arrow placement
 * @param {number} arrow.y - y of new Arrow placement
 * @param {number} arrow.height - height of new Arrow
 * @param {number} arrow.width - height of new Arrow
 * @param {number} arrow.stroke - stroke of new Arrow
 * @param {string} arrow.strokeColor - stroke color of new Arrow
 *
 * @return {object} VectorNode
 */
export async function createArrow(props) {
  // details, dimensions, and placement
  const { arrowType = 'right', name, x = 50, y = 50 } = props;
  const { width, height, start, end } = arrowSpecs[arrowType];

  // stroke and color
  const { stroke = 4, strokeColor = colors.purple } = props;

  // https://www.figma.com/plugin-docs/api/properties/figma-createvector
  const arrow = figma.createVector();
  arrow.name = name;
  arrow.x = x;
  arrow.y = y;
  arrow.strokeWeight = stroke;
  arrow.strokes = [{ type: 'SOLID', color: strokeColor }];
  arrow.resize(width, height); // w, h

  // https://www.figma.com/plugin-docs/api/VectorNetwork
  const vectorNetwork = {
    vertices: [
      {
        ...start,
        strokeCap: 'NONE',
        strokeJoin: 'MITER',
        cornerRadius: 0,
        handleMirroring: 'NONE'
      },
      {
        ...end,
        strokeCap: 'ARROW_LINES',
        strokeJoin: 'MITER',
        cornerRadius: 0,
        handleMirroring: 'NONE'
      }
    ],

    segments: [
      {
        start: 0,
        end: 1,
        tangentStart: {
          x: 0,
          y: 0
        },
        tangentEnd: {
          x: 0,
          y: 0
        }
      }
    ],

    regions: []
  };

  // https://www.figma.com/plugin-docs/api/VectorNode/#setvectornetworkasync
  await arrow.setVectorNetworkAsync(vectorNetwork, 'source');

  return arrow;
}

/**
 * Create a circle (RectangleNode)
 *
 * @param {Object} circle - Circle properties
 * @param {string} circle.name - name of new Circle
 * @param {number} circle.x - x of new Circle placement
 * @param {number} circle.y - y of new Circle placement
 * @param {number} circle.size - size of new Circle
 * @param {string} circle.fillColor - fill (bg) color of new Circle
 * @param {number} circle.stroke - stroke of new Circle
 * @param {string} circle.strokeColor - stroke color of new Circle
 *
 * @return {object} RectangleNode
 */
export function createCircle(props) {
  // details, dimensions, and placement
  const { name, x = 0, y = 0, size = 32, stroke = 2 } = props;

  // fills
  const { fillColor = colors.pink, opacity = 1 } = props;

  // strokes
  const { strokeColor = colors.white } = props;

  const radius = Math.floor(size / 2);

  const circle = figma.createRectangle();
  circle.name = name;
  circle.x = x;
  circle.y = y;
  circle.cornerRadius = radius;
  circle.fills = [{ type: 'SOLID', color: fillColor, opacity }];
  circle.strokes = [{ type: 'SOLID', color: strokeColor }];
  circle.strokeWeight = stroke;
  circle.resizeWithoutConstraints(size, size); // w, h

  return circle;
}

/**
 * Create a Frame node in Figma
 *
 * @param {Object} frame - Frame node properties
 * @param {string} frame.name - name of new Frame node
 * @param {number} frame.x - x of new Frame node placement
 * @param {number} frame.y - y of new Frame node placement
 * @param {number} frame.height - height of new Frame node
 * @param {number} frame.width - width of new Frame node
 * @param {string} frame.fillColor - fill (bg) color of new Rectangle node. Defaults to pink.
 *
 * @return {object} FrameNode
 */
export function createFrame(props) {
  // details, dimensions, and placement
  const { name, x = 0, y = 0, height, width } = props;

  // fills and strokes
  const { fillColor = colors.pink } = props;

  const frame = figma.createFrame();
  frame.clipsContent = false;
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.fills = [{ type: 'SOLID', color: fillColor, opacity: 1 }];
  frame.resizeWithoutConstraints(width, height);

  return frame;
}

/**
 * Create a line in Figma (LineNode)
 *
 * @param {Object} line - Line properties
 * @param {string} line.name - name of new Line
 * @param {number} line.x - x of new Line placement
 * @param {number} line.y - y of new Line placement
 * @param {number} line.height - height of new Line
 * @param {number} line.width - height of new Line
 * @param {string} line.fillColor - fill (bg) color of new Line
 *
 * @return {object} LineNode
 */
export function createLine(props) {
  // details, dimensions, and placement
  const { name, x = 0, y = 0, height = 1, width = 100 } = props;

  // fills
  const { fillColor = colors.black } = props;

  const line = figma.createRectangle();
  line.name = name;
  line.x = x;
  line.y = y;
  line.fills = [{ type: 'SOLID', color: fillColor }];
  line.resizeWithoutConstraints(width, height); // w, h

  return line;
}

/**
 * Create a rectangle in Figma (Rectangle Node)
 *
 * @param {Object} rectangle - Rectangle node properties
 * @param {string} rectangle.name - name of new Rectangle node
 * @param {number} rectangle.x - x of new Rectangle node placement
 * @param {number} rectangle.y - y of new Rectangle node placement
 * @param {number} rectangle.height - height of new Rectangle node
 * @param {number} rectangle.width - width of new Rectangle node
 * @param {string} rectangle.fillColor - fill (bg) color of new Rectangle node
 * @param {float} rectangle.opacity - opacity of new Rectangle node
 * @param {number} rectangle.radius - radius of new Rectangle node
 * @param {array} rectangle.radiusMixed - array of overrides for radius of new Rectangle node
 * @param {boolean} rectangle.dashed - dashed stroke of new Rectangle node
 * @param {number} rectangle.stroke - stroke of new Rectangle node
 * @param {string} rectangle.strokeColor - stroke color of new Rectangle node
 *
 * @return {object} RectangleNode
 */
export function createRectangle(props) {
  // details, dimensions, and placement
  const { name, x = 0, y = 0, height, width } = props;

  // strokes
  const { dashed = false, stroke = 3, strokeColor = colors.pink } = props;

  // radius
  const { radius = 8, radiusMixed = [] } = props;

  // fills
  const { fillColor = colors.pink, opacity = 0.1 } = props;

  const rectangle = figma.createRectangle();
  rectangle.name = name;
  rectangle.x = x;
  rectangle.y = y;

  // https://www.figma.com/plugin-docs/api/RectangleNode/#cornerradius
  rectangle.cornerRadius = radius;

  // ability to adjust radius for:
  // top left, top right, bottom left, and bottom right
  // https://www.figma.com/plugin-docs/api/properties/figma-mixed/
  if (radiusMixed.length > 0) {
    const acceptedValues = [
      'topLeftRadius',
      'topRightRadius',
      'bottomRightRadius',
      'bottomLeftRadius'
    ];

    for (let i = 0; i < radiusMixed.length; i += 1) {
      const override = radiusMixed[i];
      const [key] = Object.keys(override);
      // make sure it's an accepted value
      if (acceptedValues.includes(key)) {
        rectangle[key] = override[key];
      }
    }
  }

  rectangle.strokes = [{ type: 'SOLID', color: strokeColor }];
  rectangle.strokeWeight = stroke;

  // dashed lines
  if (dashed) {
    // dashed lines
    // https://www.figma.com/plugin-docs/api/RectangleNode/#dashpattern
    rectangle.dashPattern = [5, 5];
  }

  rectangle.fills = [{ type: 'SOLID', color: fillColor, opacity }];
  rectangle.resizeWithoutConstraints(width, height);

  return rectangle;
}

/**
 * Create a transparent Frame node in Figma
 *
 * @param {Object} frame - Frame node properties
 * @param {string} frame.name - name of new Frame node
 * @param {number} frame.x - x of new Frame node placement
 * @param {number} frame.y - y of new Frame node placement
 * @param {number} frame.height - height of new Frame node
 * @param {number} frame.width - width of new Frame node
 *
 * @return {object} FrameNode
 */
export function createTransparentFrame({ name, x = 0, y = 0, height, width }) {
  const frame = figma.createFrame();
  frame.clipsContent = false;
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.fills = [{ type: 'SOLID', color: colors.white, opacity: 0 }];
  frame.resizeWithoutConstraints(width, height);
  frame.expanded = false;

  return frame;
}

export default {
  arrowSize: ARROW_SIZE,
  createArrow,
  createCircle,
  createFrame,
  createLine,
  createRectangle,
  createTransparentFrame
};
