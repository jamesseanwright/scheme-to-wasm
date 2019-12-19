import { createTree, unwrapTree } from '../tree';

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
