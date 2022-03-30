const { nest } = require('../src/utils.js');

describe("nest", () => {
  it.skip("first", () => {
    nest([1,2,3,4,5], x => x, (a, b, ...args) => {
      ;
    });
  })
});
