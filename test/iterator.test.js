const { Iter, range, direct, zip, concat } = require('../src/iterator.js');

test("Iter head-tail", () => {
  const list = [1, 2, 3, 4, 5];
  const iter = Iter(list);

  expect(iter.head()).toEqual({ value: 1 });

  const tail1 = iter.tail();
  expect(tail1.head()).toEqual({ value: 2 });

  const tail4 = tail1.tail().tail().tail();
  expect(tail4.head()).toEqual({ value: 5 });

  const tail5 = tail4.tail();
  expect(tail5.head()).toBe(undefined);
  expect(tail5.tail()).toBe(undefined);
});

test("Iter Iteration", () => {
  const list = [1, 2, 3, 4, 5];
  const iter = Iter(list);

  let index = 0;
  for (const value of iter) {
    expect(value).toBe(list[index]);
    index ++;
  }

  // 生成跳过第一个元素的迭代器
  const iter1 = iter.tail();
  index = 1;
  for (const value of iter1) {
    expect(value).toBe(list[index]);
    index ++;
  }

  // 可重复迭代
  index = 0;
  for (const value of iter) {
    expect(value).toBe(list[index]);
    index ++;
  }

  let index1 = 0;
  for (const { value: value1, current } of iter.iter()) {
    let index2 = index1;
    for (const value2 of current) {
      expect(value2).toBe(list[index2]);
      index2 ++;
    }
    expect(value1).toBe(list[index1]);
    index1 ++;
  }

  index1 = 0;
  for (const { value: value1, current: current1 } of iter.iter()) {
    let index2 = index1;
    for (const { value: value2, current } of current1.iter()) {
      let index3 = index2;
      for (const value3 of current) {
        expect(value3).toBe(list[index3]);
        index3 ++;
      }
      expect(value2).toBe(list[index2]);
      index2 ++;
    }
    expect(value1).toBe(list[index1]);
    index1 ++;
  }
});

test("range", () => {
  const iter = range(5);
  let i = 0;
  for (const value of iter) {

  }
});

// test("direct", () => {
//   ;
// });
