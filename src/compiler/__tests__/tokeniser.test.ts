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
});
