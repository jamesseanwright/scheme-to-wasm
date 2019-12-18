import buildAST from '../ast';
import { Token } from '../tokeniser';

describe('abstract syntax tree', () => {
  it('should process a list of tokens into an AST', () => {
    const tokens: Token[] = [
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'identifier', value: 'square' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'lambda' },
      { type: 'paren', value: '(' },
      { type: 'identifier', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '*' },
      { type: 'identifier', value: 'n' },
      { type: 'identifier', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
    ];

    expect(buildAST(tokens)).toEqual({
      type: 'program',
      body: [
        {
          type: 'definition',
          identifier: {
            type: 'identifier',
            name: 'square',
          },
          value: {
            type: 'function',
            params: [
              { type: 'identifier', name: 'n' },
            ],
            body: [
              {
                type: 'binaryExpression',
                operator: '*',
                left: { type: 'identifier', name: 'n' },
                right: { type: 'identifier', name: 'n' },
              },
            ],
          },
        },
      ],
    });
  });

  it.skip('should support multiple top-level expressions', () => {
    const tokens: Token[] = [
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'identifier', value: 'square' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'lambda' },
      { type: 'paren', value: '(' },
      { type: 'identifier', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '*' },
      { type: 'identifier', value: 'n' },
      { type: 'identifier', value: 'n' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'identifier', value: 'square' },
      { type: 'number', value: '5' },
      { type: 'paren', value: ')' },
    ];

    expect(buildAST(tokens)).toEqual({
      type: 'program',
      body: [
        {
          type: 'definition',
          identifier: {
            type: 'identifier',
            name: 'square',
          },
          value: {
            type: 'function',
            params: [
              { type: 'identifier', name: 'n' },
            ],
            body: [
              {
                type: 'binaryExpression',
                operator: '*',
                left: { type: 'identifier', name: 'n' },
                right: { type: 'identifier', name: 'n' },
              },
            ],
          },
        },
        {
          type: 'callExpression',
          callee: {
            type: 'identifier',
            name: 'square',
          },
          args: [
            {
              type: 'literal',
              value: '5',
            },
          ],
        },
      ],
    });
  });
});
