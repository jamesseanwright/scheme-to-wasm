type TokenType =
  | 'paren'
  | 'operator'
  | 'number'
  | 'unknown';

interface Token {
  type: TokenType;
  value: string;
}

const tokenTypes = new Map<RegExp, TokenType>([
  [/[\(\)]/, 'paren'],
  [/\*/, 'operator'],
  [/\d/, 'number'],
]);

const getTokenType = (value: string) => {
  for (let [constraint, type] of tokenTypes) {
    if (value.match(constraint)) {
      return type;
    }
  }

  return 'unknown';
};

const createToken = (value: string): Token => ({
  type: getTokenType(value),
  value,
});

const tokenise = (source: string) =>
  [...source]
    .map(char => createToken(char))
    .filter(({ type }) => type !== 'unknown');

export default tokenise;
