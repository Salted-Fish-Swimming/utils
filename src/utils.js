const pipe = (fn, ...fns) => (...args) => fns.length > 0 ? pipe(...fns)(fn(...args)) : fn(...args);

const compose = (fn, ...fns) => (...args) => fns.length > 0 ? fn(compose(...fns)(...args)) : fn(...args);

const factory = (builder) => (...args) => new builder(...args);

class ControlError extends Error {
  constructor (type) {
    super("This is a control flow exception, and you handled the exception incorrectly");
    this.name = "NestError";
    this.type = type
  }
}

const nest = (iter, next, callback) => {
  for (const value of iter) {
    callback();
  }
};

const timeout = (time) => (new Promise(res => setTimeout(res, time))) 

module.exports = {
  pipe, compose, factory,
  timeout,
  ControlError, nest,
};
