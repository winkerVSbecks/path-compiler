import R from 'ramda';

/**
 * Generator SVG_AST → DOM
 */
export const generator = R.converge(
  makeCanavas,
  [makeSvg, makePath],
);


const svgNS = 'http://www.w3.org/2000/svg';

function makeSvg(def) {
  const svg = document.createElementNS(svgNS, 'svg');

  R.forEach(({ type, value }) => {
    svg.setAttributeNS(null, type, value);
  })(def.attrs);

  return svg;
}

function makePath(def) {
  const path = document.createElementNS(svgNS, 'path');

  R.forEach(({ type, value }) => {
    path.setAttributeNS(null, type, value);
  })(def.path.attrs);

  path.setAttributeNS(null, 'd', makeD(def.path.d));
  return path;
}

function makeD(def) {
  return def.join(' ');
}

function makeCanavas(svg, path) {
  svg.appendChild(path);
  return svg;
}
