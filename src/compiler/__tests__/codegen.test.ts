import generateBytecode from '../codegen';
import { Program } from '../ast';

describe('bytecode generator', () => {
  it('should traverse the given AST and produce WASM byte', () => {
    const ast: Program = {
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
            params: [{ type: 'identifier', name: 'n' }],
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
    };

    expect(generateBytecode(ast)).toEqual([]);
  });
});
