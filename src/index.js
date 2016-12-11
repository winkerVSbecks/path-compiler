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
horizontal 244.84
line 320 120
cubic 340 80 260 80 280 120
reflect 220 160 240 120
reflect 220 100 200 120
quad 180 140 160 120
chain 120 120
chain 80 120
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
  render,
  generator,
  R.tap(console.log),
  transformer,
  R.tap(console.log),
  parser,
  R.tap(console.table),
  lexer,
  R.tap(clearCanvas),
  R.tap(clearError),
);

document.querySelector('#js-code').innerText = codePlaceholder;
execute(codePlaceholder);

compileButton.addEventListener('click', () => {
  console.clear();
  execute(code.value);
}, false);

function clearCanvas() {
  const svg = canvas.querySelector('svg');
  if (svg) { svg.innerHTML = ''; }
}
