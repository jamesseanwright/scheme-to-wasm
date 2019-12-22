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

  it('should support multiple body expressions', () => {
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

  it('should support multiple expressions in lambdas', () => {
    // (define operate
    //   (lambda (x y)
    //     (define mutiplied (* x y))
    //     (define divided (/ x y))
    //     (+ mutiplied divided)
    //   )
    // )

    // (operate 2 3)

    const tokens: Token[] = [
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'identifier', value: 'operate' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'lambda' },
      { type: 'paren', value: '(' },
      { type: 'identifier', value: 'x' },
      { type: 'identifier', value: 'y' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'identifier', value: 'mutiplied' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '*' },
      { type: 'identifier', value: 'x' },
      { type: 'identifier', value: 'y' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'keyword', value: 'define' },
      { type: 'identifier', value: 'divided' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '/' },
      { type: 'identifier', value: 'x' },
      { type: 'identifier', value: 'y' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'operator', value: '+' },
      { type: 'identifier', value: 'mutiplied' },
      { type: 'identifier', value: 'divided' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: '(' },
      { type: 'identifier', value: 'operate' },
      { type: 'number', value: '2' },
      { type: 'number', value: '3' },
      { type: 'paren', value: ')' },
    ];

    expect(buildAST(tokens)).toEqual({
      type: 'program',
      body: [
        {
          type: 'definition',
          identifier: {
            type: 'identifier',
            name: 'operate'
          },
          value: {
            type: 'function',
            params: [
              {
                type: 'identifier',
                name: 'x'
              },
              {
                type: 'identifier',
                name: 'y'
              }
            ],
            body: [
              {
                type: 'definition',
                identifier: {
                  type: 'identifier',
                  name: 'mutiplied'
                },
                value: {
                  type: 'binaryExpression',
                  operator: '*',
                  left: {
                    type: 'identifier',
                    name: 'x'
                  },
                  right: {
                    type: 'identifier',
                    name: 'y'
                  }
                }
              },
              {
                type: 'definition',
                identifier: {
                  type: 'identifier',
                  name: 'divided'
                },
                value: {
                  type: 'binaryExpression',
                  operator: '/',
                  left: {
                    type: 'identifier',
                    name: 'x'
                  },
                  right: {
                    type: 'identifier',
                    name: 'y'
                  }
                }
              },
              {
                type: 'binaryExpression',
                operator: '+',
                left: {
                  type: 'identifier',
                  name: 'multiplied'
                },
                right: {
                  type: 'identifier',
                  name: 'divided'
                }
              },
              {
                type: 'identifier',
                name: 'operate'
              },
              {
                type: 'literal',
                value: '2'
              },
              {
                type: 'literal',
                value: '3'
              }
            ]
          }
        }
      ]
    });
  });
});
