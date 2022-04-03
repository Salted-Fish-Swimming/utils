const { Channel } = require('../../src/channel.js');
const { timeout } = require('../../src/utils.js');

const ch = Channel();

const player = async (name, ch) => {
  while (true) {
    let table = await ch.get();
    if (Math.random() < 0.9) {
      await timeout(500);
      console.log(`${name}: table -> gone`);
      await ch.put(table);
    } else {
      ch.close({ name });
    }
  }
}

const judge = async (ch) => {
  await ch.put({ isTable: true });
  const res = await ch.onClose();
  console.log(`${res.name} babble`);
}

player("player-1", ch).catch(ch.handler);
player("player-2", ch).catch(ch.handler);

judge(ch);