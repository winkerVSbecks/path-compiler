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

  checkOrder(body);

  return { type: 'Canvas', body };
}

function checkReflectOrder(t) {
  return R.unless(
    R.anyPass([
      R.equals(OPERATIONS.cubic),
      R.equals(OPERATIONS.reflect),
    ]),
    throwError(
      `<span class="mr1 b">Syntax Error:</span> ${ OPERATIONS.reflect } command must follow ${ OPERATIONS.cubic } or ${ OPERATIONS.reflect }`
    ),
  )(t);
}

function checkChainOrder(t) {
  return R.unless(
    R.anyPass([
      R.equals(OPERATIONS.quad),
      R.equals(OPERATIONS.chain),
    ]),
    throwError(
      `<span class="mr1 b">Syntax Error:</span> ${ OPERATIONS.chain } command must follow by ${ OPERATIONS.quad } or ${ OPERATIONS.chain }`
    ),
  )(t);
}

function checkOrder(body) {
  return R.compose(
    R.all(R.equals(true)),
    R.addIndex(R.map)((_, idx, arr) => {
      const t = R.cond([
        [R.equals(OPERATIONS.reflect), () => checkReflectOrder(arr[idx - 1])],
        [R.equals(OPERATIONS.chain),   () => checkChainOrder(arr[idx - 1])],
        [R.T,                          R.T]
      ])(_);

      console.log(_, arr[idx - 1], t);
      return t;
    }),
    R.map(R.prop('type')),
  )(body);
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

function getArgFor(type) {
  return R.ifElse(
    R.any(R.equals(type)),
      R.always(TOKENS.COLOR),
      R.always(TOKENS.NUMBER),
  )([OPERATIONS.stroke, OPERATIONS.fill]);
}

function checkArgType(type, count) {
  const argType = getArgFor(type);
  return R.when(
    R.complement(
      R.all(
        R.propEq('type', argType),
      ),
    ),
    throwError(
      `<span class="mr1 b">Syntax Error:</span> ${ type } command must be followed by ${ count } ${ argType }${ count > 1 ? 'S' : '' }`
    ),
  );
}

function validateArgs(type, count) {
  return R.compose(
    operator(R.__, type),
    checkArgType(type, count),
    pluckTokens(count),
  );
}

function validateIsLastOperator(type) {
  return R.ifElse(
    R.isEmpty,
    R.identity,
    throwError(
      `<span class="mr1 b">Syntax Error:</span> ${ type } must be the last command`
    ),
  );
}

function opWithValidation(type, { args, prev, last }) {
  return R.compose(
    validateArgs(type, args),
    R.when(
      R.always(R.equals(last, true)), validateIsLastOperator(type),
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
  [OPERATIONS.cubic]:      opWithValidation(OPERATIONS.cubic, { args: 6 }),
  [OPERATIONS.reflect]:    opWithValidation(OPERATIONS.reflect, { args: 4 }),
  [OPERATIONS.quad]:       opWithValidation(OPERATIONS.quad, { args: 4 }),
  [OPERATIONS.chain]:      opWithValidation(OPERATIONS.chain, { args: 2 }),
  [OPERATIONS.close]:      opWithValidation(OPERATIONS.close,
                                            { args: 0, last: true }),
};
