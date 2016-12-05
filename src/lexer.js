import R from 'ramda';
import { TOKENS, OPERATIONS } from './constants';
import { throwError } from './errors';

/**
 * Value type checks
 */
const isNewLine = R.test(/[\n\r]/g);
const isNumber = R.complement(isNaN);
const isColor = R.and(
  R.compose(
    R.anyPass([R.equals(3), R.equals(6)]),
    R.length,
    R.tail,
  ),
  R.test(/(^#[0-9A-Fa-f]+)|none|transparent/g)
);

/**
 * Token Generators
 */
const generateNewLineToken = R.always({ type: TOKENS.NEWLINE });
const generateColorToken = R.assoc('value', R.__, { type: TOKENS.COLOR });
const generateNumberToken = R.compose(
  R.assoc('value', R.__, { type: TOKENS.NUMBER }),
  Number,
);
const generateWordToken = R.compose(
  R.assoc('value', R.__, { type: TOKENS.WORD }),
  R.prop(R.__, OPERATIONS),
  R.ifElse(
    R.has(R.__, OPERATIONS),
    R.identity,
    (token) =>  { throwError(`<b>${ token }</b> is not a valid command`); },
  ),
  R.toLower,
);

/**
 * Generate the appropriate token based on type
 */
const tokenize = R.cond([
  [isNewLine,   generateNewLineToken],
  [isColor,     generateColorToken],
  [isNumber,    generateNumberToken],
  [R.T,         generateWordToken],
]);

/**
 * Lexical Analysis (tokenization)
 */
export const lexer = R.compose(
  R.ifElse(
    R.isEmpty,
    () =>  { throwError(`No Tokens Found. Try 'canvas 100 100'`); },
    R.identity,
  ),
  R.map(tokenize),
  R.filter(R.complement(R.isEmpty)),
  R.split(/\s+/),
);
