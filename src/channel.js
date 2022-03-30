const { factory } = require('./utils.js');

class ChannelError extends Error {

  constructor (msg) {
    super(msg);
    this.name = 'ChannelError';
  }

}

const channel = factory(class {
  constructor () {
    this.waiting = [];
    this.pending = [];
    this.onClosed = [];
    this.closed = false;
  }

  get () {
    if (this.closed) {
      throw new ChannelError("channel on closed");
    }
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
    if (this.closed) {
      throw new ChannelError("channel on closed")
    }
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
    if (this.closed) {
      throw new ChannelError("channel on closed")
    }
    const ch = this;
    return (async function* () {
      try {
        while (true) {
          yield await ch.get();
        }
      } catch (_) {
        return;
      }
    })();
  }

  close (msg) {
    this.closed = true;
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
    return new Promise((res, rej) => {
      this.onClosed.push({ res, rej });
    });
  }
});

module.exports = { channel };