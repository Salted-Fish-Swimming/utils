const { pipe, compose, factory } = require('./utils.js');

const genIter = (gen) => Iter({
  [Symbol.iterator]: gen
});

const Iter = factory(class {
  constructor (iterable) {
    this.iterator = iterable[Symbol.iterator]();
  }

  head () {
    if (this.iterator) {
      const { value, done } = this.iterator.next();
      if (done) {} else {
        this.value = { value };
        this.follow = Iter(this.iterator);
      }
      this.iterator = undefined;
    }
    return this.value;
  }

  tail () {
    if (this.iterator) {
      this.head();
    };
    return this.follow;
  }

  [Symbol.iterator] () {
    let current = this;
    return {
      next () {
        const term = current.head();
        if (term) {
          current = current.tail();
          return { value: term.value, done: false };
        } else {
          return { value: undefined,  done: true};
        }
      }
    }
  }

  iter () {
    let current = this;
    return genIter(function* () {
      while (true) {
        const term = current.head();
        if (term) {
          yield { value: term.value, current }
          current = current.tail();
        } else {
          break;
        }
      }
    });
  }

  map (transform) {
    return map(transform, this);
  }

  filter (predicate) {
    return filter(predicate, this);
  }

  flatten (layer = 1) {
    return flatten(layer, this);
  }
});

const map = (transform, iter) => genIter(function* () {
  while (true) {
    const term = iter.head();
    if (term) {
      yield transform(term.value);
      iter = iter.tail();
    } else {
      break;
    }
  };
});

const filter = (predicate, iter) => genIter(function* () {
  while (true) {
    const term = iter.head();
    if (term) {
      const { value } = term;
      if (predicate(value)) {
        yield value;
      }
      iter = iter.tail();
    } else {
      break;
    }
  }
});

const flatten = (layer = 1, iter) => genIter(function* () {
  for (const value of iter) {
    if (value[Symbol.iterator]) {
      if (layer > 0) {
        yield* flatten(value, layer - 1);
      } else {
        yield value;
      }
    } else {
      yield value;
    }
  };
});

const exist = v => v !== null && v !== undefined;

const range = (start, end, skip) => genIter(function* () {
  if (exist(start)) {
    if (exist(end)) {} else {
      end = start, start = 0;
    }
    if (exist(skip)) {} else {
      skip = 1;
    }
  } else {
    return;
  }

  let num = start;
  while (num < end) {
    yield num
    num += skip;
  }
});

const direct = (iter, ...iters) => genIter(function* () {
  if (iter) {
    for (const value of iter) {
      if (iters.length > 0) {
        yield* direct(...iters)
          .map(product => [ value, ...product ]);
      } else {
        yield [ value ];
      }
    }
  }
});

const zip = (...iterables) => genIter(function* () {
  const values = Array(iterables.length);
  const iters = iterables.map(itable => itable[Symbol.iterator]());
  while (true) {
    for (const index in iters) {
      const { value, done } = iters[index].next();
      if (done) {
        return;
      }
      values[index] = value;
    }
    yield values;
  }
});

const concat = (...iters) => genIter(function* () {
  for (const iter of iters) {
    yield* iter;
  }
});

module.exports = {
  Iter, range, direct, zip, concat
}