import tokenise from '../tokeniser';

describe('tokeniser', () => {
  it('should break up a string of source code into typed tokens', () => {
    const source = '(* 5 2)';

    expect(tokenise(source)).toEqual([
      { type: 'paren', value: '(' },
      { type: 'operator', value: '*' },
      { type: 'number', value: '5' },
      { type: 'number', value: '2' },
      { type: 'paren', value: ')' },
    ]);
  });

  it('should should support keywords', () => {
    const source = `
      (define square
        (lambda (n)
          (* n n)
        )
      )
    `;

    expect(tokenise(source)).toEqual([
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
    ]);
  });

  it('should should support multiple expressions at the top-level', () => {
    const source = `
      (define square
        (lambda (n)
          (* n n)
        )
      )

      (square 5)
    `;

    expect(tokenise(source)).toEqual([
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
      { type: 'paren', value: '(' },
      { type: 'name', value: 'square' },
      { type: 'number', value: '5' },
      { type: 'paren', value: ')' },
    ]);
  });
});
