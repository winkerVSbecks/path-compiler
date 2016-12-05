import R from 'ramda';
import { TOKENS, OPERATIONS } from './constants';
import { throwError } from './errors';

export function parser(tokens) {
  const body = [];

  while (tokens.length > 0) {
    let currentToken = tokens.shift();

    if (currentToken.type === TOKENS.WORD) {
      body.push(
        operations[currentToken.value](tokens)
      );
    }
  }

  return { type: 'Canvas', body };
}

const createArgument = R.compose(
  R.assoc('value', R.__, {}),
  R.prop('value'),
);

const createArguments = R.compose(
  R.map(createArgument),
);

const operator = R.useWith(
  R.assoc('arguments'),
  [createArguments, R.objOf('type')],
);

function pluckTokens(count, tokens) {
  return tokens => tokens.slice(0, count);
}

function withValidTokens(type, count) {
  const argType = getArgFor(type);
  return R.ifElse(
    R.all(
      R.propEq('type', argType),
    ),
    R.identity,
    () =>  {
      throwError(
        `<span class="mr1 b">Syntax Error:</span> ${ type } command must be followed by ${ count } ${ argType }${ count > 1 ? 'S' : '' }`
      );
    },
  );
}

function getArgFor(type) {
  return R.ifElse(
    R.any(R.equals(type)),
      R.always(TOKENS.COLOR),
      R.always(TOKENS.NUMBER),
  )([OPERATIONS.stroke, OPERATIONS.fill]);
}

function operatorWithArgCount(type, count) {
  return R.compose(
    operator(R.__, type),
    withValidTokens(type, count),
    pluckTokens(count),
  );
}

const operations = {
  [OPERATIONS.canvas]:     operatorWithArgCount(OPERATIONS.canvas, 2),
  [OPERATIONS.size]:       operatorWithArgCount(OPERATIONS.size, 1),
  [OPERATIONS.stroke]:     operatorWithArgCount(OPERATIONS.stroke, 1),
  [OPERATIONS.fill]:       operatorWithArgCount(OPERATIONS.fill, 1),
  [OPERATIONS.line]:       operatorWithArgCount(OPERATIONS.line, 2),
  [OPERATIONS.move]:       operatorWithArgCount(OPERATIONS.move, 2),
  [OPERATIONS.horizontal]: operatorWithArgCount(OPERATIONS.horizontal, 1),
  [OPERATIONS.vertical]:   operatorWithArgCount(OPERATIONS.vertical, 1),
  [OPERATIONS.curve]:      operatorWithArgCount(OPERATIONS.curve, 6),
  [OPERATIONS.close]:      operatorWithArgCount(OPERATIONS.close, 0),
};
