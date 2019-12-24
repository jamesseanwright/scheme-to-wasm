'use strict';

import { compile } from '../';

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
      0x0,
      0x61,
      0x73,
      0x6d,
      0x1,
      0x0,
      0x0,
      0x0, // Magic number and WASM version
      0x1,
      0x1,
      0x1, // Type section, payload length of one (TODO), one entry
      -0x20,
      0x2,
      -0x1,
      -0x1,
      0x1,
      -0x1, // Function, two params, both i32, one return value of i32
      0x3,
      0x1,
      0x0, // Function declarations section, one index, first item in the type section
      0xa,
      0x1, // Code section, one function
      0x1,
      0x0, // Body size of one byte (TODO), no local variables,
      0x6c,
      0x20,
      0x0,
      0x20,
      0x0, // i32.mult, first parameter * first parameter
      0xb, // Body end byte
    ];

    expect(compile(program)).toEqual(expectedBinary);
  });
});
