const { Channel } = require('../src/channel.js');
const { range } = require('../src/iterator.js');
const { timeout } = require('../src/utils.js');

it("生成管道", () => {
  const ch = Channel();
});

it.skip("for-each", async () => {
  const ch = Channel();
  (async (ch) => {
    for await (const value of ch) {
      console.log({ value });
    }
  })(ch);
  (async (ch) => {
    for (const value of range(100)) {
      if (Math.random() < 0.9) {
        await ch.put(value);
        await timeout(500);
      } else {
        break;
      }
    };
    await ch.close();
  })(ch)
});
