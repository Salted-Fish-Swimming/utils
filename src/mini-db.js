const fs = require('fs/promises');
const fss = require('fs');
const path = require('path');

const factory = (factor) => (...args) => (new factor(...args));

const cache = new Map();

const interval = {
  timeout: 8000, running: false,
  run () {
    if (interval.running) { return }
    interval.running = true;
    setTimeout(async () => {
      let changed = false;
      for (const [dbpath, db] of cache) {
        if (db.saved) {} else {
          await db.save();
          db.saved = true;
          changed = true;
        }
      }
      if (changed) {
        interval.run();
      } else {
        interval.running = true;
      }
    }, interval.timeout);
  }
}

const match = (query, target) => {
  if (typeof query === 'function') {
    return query(target);
  } else if (typeof query === 'object') {
    for (const key in query) {
      if (!match(query[key], target[key])) {
        return false;
      }
    };
    return true;
  } else if (query === target) {
    return true;
  } else {
    return false;
  }
};

const clone = (source) => {
  try {
    return JSON.parse(JSON.stringify(source));
  } catch (error) {
    throw new Error('data can not stringify')
  }
};

const findIndex = (array, startIndex, predicate) => {
  let index = startIndex
  while (index < array.length) {
    const term = array[index];
    if (predicate(term)) {
      return index;
    }
    index += 1;
  }
  return -1;
};

const methods = {
  find (query) {
    const term = this.data.find(term => match(query, term));
    return clone(term);
  },

  findAll (query) {
    return this.data.filter(term => match(query, term)).map(clone);
  },

  update (query, updateFun) {
    const index = this.data.findIndex(term => match(query, term));
    if (index >= 0) {
      const updata = updateFun(this.data[index]);
      this.data.splice(index, 1, ...updata)
    }
    this.saved = false;
    interval.run();
  },

  updateAll (query, updateFun) {
    let currentIndex = this.data.findIndex(term => match(query, term));
    while (currentIndex >= 0) {
      const updatas = updateFun(this.data[currentIndex]);
      this.data.splice(currentIndex, 1, ...updatas);
      currentIndex += updatas.length;
      currentIndex = findIndex(this.data, currentIndex, term => match(query, term));
      this.data.indexOf()
    }
    this.saved = false;
    interval.run();
  },

  push (...terms) {
    for (const term of terms) {
      this.data.push(clone(term));
    }
    this.saved = false;
    interval.run();
  },

  async save () {
    const content = JSON.stringify(this.data, null, 2);
    await fs.writeFile(this.config.path, content);
  },

  saveSync () {
    const content = JSON.stringify(this.data, null, 2);
    fss.writeFileSync(this.config.path, content);
  }
};

const DB = factory(class {
  constructor (config) {
    this.config = config;
    this.saved = true;
    cache.set(this.config.path, this);
    this.loaded = this.init();
  }

  async init () {
    const dbpath = path.parse(this.config.path);
    await fs.mkdir(dbpath.dir, { recursive: true });
    try {
      const content = await fs.readFile(this.config.path);
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        this.data = data;
      } else {
        this.data = [];
        await methods.save.call(this)
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.data = [];
        await methods.save.call(this)
      }
    }
    this.data = JSON.parse(await fs.readFile(this.config.path));
    Object.assign(this, methods);
  }

  find (...args) {
    return this.loaded.then(_ => this.find(...args));
  }

  findAll (...args) {
    return this.loaded.then(_ => this.findAll(...args));
  }

  update (...args) {
    return this.loaded.then(_ => this.update(...args));
  }

  updateAll (...args) {
    return this.loaded.then(_ => this.updateAll(...args));
  }

  push (...args) {
    return this.loaded.then(_ => this.push(...args));
  }

  save (...args) {
    return this.loaded.then(_ => this.save(...args));
  }

  saveSync (...args) {
    return this.loaded.then(_ => this.saveSync(...args));
  }
});

process.on('exit', () => {
  for (const [dbpath, db] of cache) {
    if (db.saved) {} else {
      methods.saveSync.call(db);
    }
  }
});

module.exports = DB;