const { Channel } = require('../../src/channel.js');
const { range } = require('../../src/iterator.js');
const { timeout } = require('../../src/utils.js');

const ch = Channel();

const worker = async (ch, name) => {
  for await (const raw of ch) {
    console.log(`${name} is process ${raw}`);
    await timeout(500);
    console.log(`${name} complete, prepare next task`);
  };
  console.log(`${name} no tasking`);
}

const source = async (ch) => {
  for (const value of range(20)) {
    await ch.put(value);
  };
  ch.close();
}

worker(ch, '-1:');
worker(ch, '-2:');
worker(ch, '-3:');
worker(ch, '-4:');

source(ch);
