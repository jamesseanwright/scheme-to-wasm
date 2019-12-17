import buildAST from '../ast';
import { Token } from '../tokeniser';

describe('abstract syntax tree', () => {
  it('should process a list of tokens into an AST', () => {
    const tokens: Token[] = [
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'name', value: 'square' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'lambda' },
      { type: 'paren', value: '(' },
      { type: 'name', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '*' },
      { type: 'name', value: 'n' },
      { type: 'name', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
    ];

    expect(buildAST(tokens)).toEqual({
      type: 'program',
      body: [
        {
          type: 'definition',
          name: 'square',
          value: {
            type: 'function',
            params: [
              { type: 'param', name: 'n' }
            ],
            body: [
              {
                type: 'binaryExpression',
                operator: '*',
                left: 'n',
                right: 'n',
              },
            ],
          },
        },
      ],
    });
  });
});
