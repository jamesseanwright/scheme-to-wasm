import { createTree, findBottomUp } from '../tree';

describe('tree', () => {
  describe('append', () => {
    it('should add the provided argument as an immediate child of the tree', () => {
      const tree = createTree<number>();

      [5, 7, 4, 3].forEach(x => tree.append(x));

      expect(tree.children()).toEqual([5, 7, 4, 3]);
    });
  });

  describe('branch', () => {
    it('should create a new tree that`s a child of the current tree', () => {
      const tree = createTree<number>();
      const childTree = tree.branch();

      tree.append(5);

      expect(tree.children()).toEqual([childTree, 5]);
      expect(childTree.parent()).toEqual(tree);
    });
  });
});

describe('findBottomUp', () => {
  const tree = createTree<number>();
  const firstLevel = tree.branch();
  const secondLevel = firstLevel.branch();
  const thirdLevel = secondLevel.branch();

  [1, 2, 3].forEach(x => tree.append(x));
  [4, 5, 6].forEach(x => firstLevel.append(x));
  [7, 8, 9].forEach(x => secondLevel.append(x));
  [10, 11, 12].forEach(x => thirdLevel.append(x));

  it('should perform a bottom-up search for a given predicate and child tree', () => {
    const result = findBottomUp(thirdLevel, x => x === 1);

    expect(result).toBe(1);
  });

  it('should return undefined if the predicate never returns true', () => {
    const result = findBottomUp(thirdLevel, x => x === 13);

    expect(result).toBeUndefined();
  });

  it('should not provide the predicate with any children that are trees', () => {
    const predicate = jest.fn();

    findBottomUp(tree, predicate);

    expect(predicate).toHaveBeenCalledTimes(3);

    [1, 2, 3].forEach((n, i, arr) => {
      expect(predicate).toHaveBeenCalledWith(n, i, arr);
    });
  });
});
