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
line 300 120.84
cubic 120 140 100 60 100 110
reflect 100 60 100 110
reflect 100 60 100 110
quad 50 100 100 250
chain 100 250
chain 100 250
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
  // clearError,
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
