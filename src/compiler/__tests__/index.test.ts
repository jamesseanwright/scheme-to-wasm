'use strict';

import compile from '../';

/* These tests effectively serve as
 * end-to-end tests for the compiler */

describe('compiler', () => {
  it('should compile a simple program into executable WASM binary', () => {
    const program = `
      (define square
        (lambda (n)
          (* n n)
        )
      )
    `;

    const expectedBinary = [
      0x0, 0x61, 0x73, 0x6d, 0x1, 0x0, 0x0, 0x0
    ];

    expect(compile(program)).toEqual(expectedBinary);
  });
});
