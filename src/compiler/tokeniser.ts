type TokenType =
  | 'paren'
  | 'operator'
  | 'keyword'
  | 'identifier'
  | 'number'
  | 'unknown';

type KnownTokenTypes = Exclude<TokenType, 'unknown'>;

export interface Token {
  type: TokenType;
  value: string;
}

const tokenTypes = new Map<RegExp, TokenType>([
  [/[\(\)]/, 'paren'],
  [/\*/, 'operator'],
  [/\d/, 'number'],
  [/define|lambda/, 'keyword'],
  [/[a-z_]+/, 'identifier'],
]);

const getTokenType = (value: string) => {
  for (let [constraint, type] of tokenTypes) {
    if (value.match(constraint)) {
      return type;
    }
  }

  return 'unknown';
};

const createToken = (type: KnownTokenTypes, value: string): Token => ({
  type,
  value,
});

const isAlpha = (char: string) => /[a-z]/.test(char);

const accumulateAlpha = (initialChar: string, iterator: Iterator<string, string>) => {
  let acc = initialChar;
  let result = iterator.next();

  while (isAlpha(result.value)) {
    acc += result.value;
    result = iterator.next();
  }

  /* We want to append the
   * terminus so we can include
   * it in our tokens list! */
  return [acc, result.value];
};

const appendValuesAsTokens = (tokens: Token[], values: string[]) => {
  for (let value of values) {
    const type = getTokenType(value);

    if (type !== 'unknown') {
      tokens.push(createToken(type, value))
    }
  }
}

const tokenise = (source: string) => {
  const tokens: Token[] = [];
  const iterator = source[Symbol.iterator]();
  let result = iterator.next();

  while (!result.done) {
    const values = isAlpha(result.value)
      ? accumulateAlpha(result.value, iterator)
      : [result.value];

    appendValuesAsTokens(tokens, values);

    result = iterator.next();
  }

  return tokens;
};

export default tokenise;
