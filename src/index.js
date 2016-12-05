// Commands:
// 	M x y / m dx dy
// 	L x y / l dx dy
//  H x (or h dx)
// 	V y (or v dy)
// 	Z (or z)
//  C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy) [Bezier Curve]
//  	S x2 y2, x y (or s dx2 dy2, dx dy)  If the S command doesn't follow another S or C command, then it is assumed that both control points for the curve are the same. An example of this syntax is shown below, and in the figure to the left the specified control points are shown in red, and the inferred control point in blue.
//  Q x1 y1, x y (or q dx1 dy1, dx dy) [quadratic curve]pa
// 		T x y (or t dx dy)  stringing together multiple quadratic Beziers
// 	A rx ry x-axis-rotation large-arc-flag sweep-flag x y
// 		a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy

import R from 'ramda';
import { lexer } from './lexer';
import { parser } from './parser';
import { transformer } from './transformer';
import { generator } from './generator';
import { clearError } from './errors';

const codePlaceholder = `canvas 400 300
size 2
stroke #ff41b4
move 103 250
horizontal 244
line 200 80.84
close`;

const canvas = document.querySelector('#js-canvas');
const code = document.querySelector('#js-code');
const compileButton = document.querySelector('#js-compile');
let svgNode;

function render(svg) {
  if (svgNode) {
    canvas.replaceChild(svg, svgNode);
  }

  canvas.appendChild(svg);
  svgNode = svg;
}

const execute = R.compose(
  clearError,
  render,
  generator,
  R.tap(console.log),
  transformer,
  R.tap(console.log),
  parser,
  R.tap(console.table),
  lexer,
);

document.querySelector('#js-code').innerText = codePlaceholder;
execute(codePlaceholder);

compileButton.addEventListener('click', () => {
  console.clear();
  execute(code.value);
}, false);
