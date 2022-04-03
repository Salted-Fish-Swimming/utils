const { recur } = require('../../src/utils.js');
const { range, direct } = require('../../src/iterator.js');

const boardSize = 8;

const board = direct(range(boardSize),range(boardSize));

const solve = (iter, args) => {
  for (const { value: pos, current } of iter) {
    solve(current.tail(), args);
  }
};

solve(board, []);