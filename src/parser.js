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

function checkArgCount(type, count) {
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

function argCountValidation(type, count) {
  return R.compose(
    operator(R.__, type),
    checkArgCount(type, count),
    pluckTokens(count),
  );
}

function lastOpValidation(type) {
  return R.ifElse(
    R.isEmpty,
    R.identity,
    () =>  {
      throwError(
        `<span class="mr1 b">Syntax Error:</span> ${ type } must be the last command`
      );
    },
  );
}

function opWithValidation(type, { args, prev, last }) {
  return R.compose(
    argCountValidation(type, args),
    R.when(
      R.always(R.equals(last, true)), lastOpValidation(type),
    ),
  );
}

const operations = {
  [OPERATIONS.canvas]:     opWithValidation(OPERATIONS.canvas, { args: 2 }),
  [OPERATIONS.size]:       opWithValidation(OPERATIONS.size, { args: 1 }),
  [OPERATIONS.stroke]:     opWithValidation(OPERATIONS.stroke, { args: 1 }),
  [OPERATIONS.fill]:       opWithValidation(OPERATIONS.fill, { args: 1 }),
  [OPERATIONS.line]:       opWithValidation(OPERATIONS.line, { args: 2 }),
  [OPERATIONS.move]:       opWithValidation(OPERATIONS.move, { args: 2 }),
  [OPERATIONS.horizontal]: opWithValidation(OPERATIONS.horizontal, { args: 1 }),
  [OPERATIONS.vertical]:   opWithValidation(OPERATIONS.vertical, { args: 1 }),
  [OPERATIONS.curve]:      opWithValidation(OPERATIONS.curve, { args: 6 }),
  [OPERATIONS.close]:      opWithValidation(OPERATIONS.close,
                                            { args: 0, last: true }),
};
