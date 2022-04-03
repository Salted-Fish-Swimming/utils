const { factory } = require('./utils.js');

const ErrorTypeKey = Symbol('error.type');

class ChannelError extends Error {

  constructor (msg) {
    super(msg);
    this.name = 'ChannelError';
    this[ErrorTypeKey] = 'ChannelError';
  }

}

const Throw = () => {
  throw new ChannelError("channel closed");
}

const Channel = factory(class {
  constructor () {
    this.waiting = [];
    this.pending = [];
    this.onClosed = [];
    this.closed = false;
  }

  get () {
    return new Promise((res, rej) => {
      if (this.pending.length > 0) {
        const pend = this.pending.shift();
        res(pend.res());
      } else {
        this.waiting.push({ res, rej });
      }
    });
  }

  put (value) {
    return new Promise((res, rej) => {
      if (this.waiting.length > 0) {
        const wait = this.waiting.shift();
        wait.res(value);
        res();
      } else {
        this.pending.push({
          res () {
            res();
            return value;
          },
          rej
        });
      }
    });
  }

  [Symbol.asyncIterator] () {
    const ch = this;
    return (async function* () {
      try {
        while (true) {
          yield await ch.get();
        }
      } catch (error) {
        return ch.handler(error);
      }
    })();
  }

  _throw_ () {
    throw new ChannelError("channel on closed")
  }

  empty () {
    if (this.closed) {
      return false;
    }
    if (this.pending.length > 0) {
      return false
    }
    if (this.waiting.length > 0) {
      return false;
    }
    return false;
  }

  onEmpty () {
    return new Promise((res, rej) => {
      res();
    });
  }

  close (msg) {
    // this.closed = true;

    this.put = this._throw_;
    this.get = this._throw_;
    this[Symbol.asyncIterator] = async function* () { return };

    for (const pend of this.pending) {
      pend.rej(new ChannelError("channel on closed"));
    }
    for (const wait of this.waiting) {
      wait.rej(new ChannelError("channel on closed"));
    }
    for (const close of this.onClosed) {
      close.res(msg);
    }
  }

  onClose () {
    if (this.closed) {} else {
      this.close
    }
    return new Promise((res, rej) => {
      this.onClosed.push({ res, rej });
    });
  }

  handler (error) {
    return Channel.handler(error);
  }
});

Channel.handler = (error) => {
  if (error instanceof ChannelError) {
    if (error[ErrorTypeKey] === 'ChannelError') {
      return error;
    }
  }
  throw error;
}

module.exports = { Channel };