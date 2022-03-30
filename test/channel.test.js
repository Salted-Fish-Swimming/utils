const { channel } = require('../src/channel.js');
const { range } = require('../src/iterator.js');
const { timeout } = require('../src/utils.js');

test("生成管道", () => {
  const ch = channel();
});

test.skip("for-each", async () => {
  const ch = channel();
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
