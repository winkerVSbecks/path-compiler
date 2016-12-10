import R from 'ramda';
import { fromJS } from 'immutable';
import { OPERATIONS } from './constants';

const operations = {
  [OPERATIONS.canvas]:      setViewBox,
  [OPERATIONS.stroke]:      setAttr('stroke'),
  [OPERATIONS.size]:        setAttr('stroke-width'),
  [OPERATIONS.fill]:        setAttr('fill'),
  [OPERATIONS.line]:        makeLine,
  [OPERATIONS.move]:        makeMove,
  [OPERATIONS.horizontal]:  makeHorizontal,
  [OPERATIONS.vertical]:    makeVertical,
  [OPERATIONS.curve]:       makeCurve,
  [OPERATIONS.close]:       makeClose,
};

function isOperator(type) {
  return R.compose(
    R.equals(type),
    R.prop('type'),
  );
}

function makeSvg(w, h) {
  return ({
    type: 'svg',
    attrs: [{
      type: 'viewBox',
      value: `0 0 400 400`,
    }, {
      type: 'width',
      value: '100%',
    }, {
      type: 'height',
      value: '100%',
    }, {
      type: 'class',
      value: 'shadow-1',
    }],
    path: {
      type: 'path',
      attrs: [{
        type: 'stroke-width',
        value: 1,
      }, {
        type: 'stroke-linejoin',
        value: 'round',
      }, {
        type: 'stroke-linecap',
        value: 'round',
      }, {
        type: 'stroke',
        value: '#333',
      }, {
        type: 'fill',
        value: 'none',
      }],
      d: [],
    },
  });
}

function setViewBox(svg, w, h) {
  const idx = svg.get('attrs')
    .findIndex(attr => {
      return attr.get('type') === 'viewBox';
    });

  return svg.mergeIn(['attrs', idx], {
    value: `0 0 ${w} ${h}`,
  });
}

function setAttr(type) {
  return (svg, value) => {
    const idx = svg.getIn(['path', 'attrs'])
      .findIndex(attr => {
        return attr.get('type') === type;
      });

    return svg.mergeIn(['path', 'attrs', idx], {
      value: value,
    });
  };
}

function makeLine(svg, x, y) {
  return addToPath(svg, `L ${x} ${y}`);
}

function makeMove(svg, x, y) {
  return addToPath(svg, `M ${x} ${y}`);
}

function makeHorizontal(svg, x) {
  return addToPath(svg, `H ${x}`);
}

function makeVertical(svg, y) {
  return addToPath(svg, `V ${y}`);
}

function makeCurve() {
}

function makeClose(svg) {
  return addToPath(svg, `Z`);
}

function addToPath(svg, command) {
  return svg.updateIn(['path', 'd'], (d) => {
    return d.push(command);
  });
}

function svgReducer(svgAst, operation) {
  const args = R.map(R.prop('value'), operation.arguments);
  return svgAst = operations[operation.type](svgAst, ...args);
}

/**
 * Transformer AST → SVG_AST
 */
export const transformer = R.compose(
  x => x.toJS(),
  R.reduce(
    svgReducer,
    fromJS( makeSvg() )
  ),
  R.prop('body'),
);
