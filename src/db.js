const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class Ref extends EventEmitter {
  constructor(context, path) {
    super();

    this.context = context;
    this.path = path;
  }

  set(data, merge = false) {
    this.context.set(this.path, data, merge);
    return this;
  }

  data() {
    return this.context.data(this.path);
  }

  childs() {
    return this.context.data(this.path, true);
  }

  delete() {
    this.context.deleteRef(this.path);
    return this;
  }
}

module.exports = new (class db extends EventEmitter {
  constructor() {
    super();

    this.dbPath = null;
    this.dbData = {};
  }

  load(dbPath = path.resolve('db.json')) {
    this.dbPath = dbPath;

    try {
      if (fs.existsSync(dbPath)) {
        this.dbData = JSON.parse(fs.readFileSync(dbPath));
      }
    } catch (err) {
      console.error(err.message);
      console.info(
        'the database has not been found and will therefore be created at',
        dbPath
      );
    }
    this.emit('onload', this.dbData);

    //==================================================
    //save before app is close
    //==================================================
    process.on('exit', () => this.handleExit());
    //catches ctrl+c event
    process.on('SIGINT', () => this.handleExit());
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', () => this.handleExit());
    process.on('SIGUSR2', () => this.handleExit());
    process.on('SIGTERM', () => this.handleExit());
    //catches uncaught exceptions
    process.on('uncaughtException', () => this.handleExit());
  }

  handleExit() {
    this.save();
    process.exit();
  }

  save() {
    if (this.dbPath) {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.dbData, null, 2));
    }
  }

  slugify(s) {
    return s.toString().replace(/\//g, '-');
  }

  data(path, childs) {
    if (!this.dbData) {
      return;
    }
    let pathTab = path.split('/').filter((e) => e);
    let res = this.dbData[pathTab[0]];

    if (!res) {
      return {};
    }

    for (let i = 1; i < pathTab.length; i++) {
      if (res.childs && res.childs[pathTab[i]]) {
        res = res.childs[pathTab[i]];
      } else {
        res = {};
        break;
      }
    }
    return !childs
      ? res.data
      : res.childs
      ? Object.keys(res.childs).map((key) => new Ref(this, `${path}/${key}`))
      : [];
  }

  set(path, data, merge) {
    let pathTab = path.split('/').filter((e) => e);

    if (pathTab.length) {
      if (!this.dbData[pathTab[0]])
        this.dbData[pathTab[0]] = {data: {}, childs: {}};
      let res = this.dbData[pathTab[0]];

      for (let i = 1; i < pathTab.length; i++) {
        if (!res.childs[pathTab[i]])
          res.childs[pathTab[i]] = {data: {}, childs: {}};
        res = res.childs[pathTab[i]];
      }

      res.data = {
        ...(merge ? res.data : {}),
        ...data,
      };
      this.emit('set', {path, data, merge});
    }
  }

  ref(path) {
    if ((path.match(/\//g) || []).length > 20) {
      console.error(
        'FireLight Error: you are trying to get a ref with a path that exceeds the limit of 20 / childs'
      );
      process.exit(1);
    }
    return new Ref(this, path);
  }

  deleteRef(path) {
    let pathTab = path.split('/').filter((e) => e);

    if (pathTab.length === 1) {
      delete this.dbData[pathTab[0]];
    } else if (pathTab.length > 1) {
      let res = this.dbData[pathTab[0]];

      for (let i = 1; i < pathTab.length; i++) {
        if (i === pathTab.length - 1) {
          delete res.childs[pathTab[i]];
          break;
        }

        if (res.childs && res.childs[pathTab[i]]) {
          res = res.childs[pathTab[i]];
        } else {
          break;
        }
      }
    }
    this.emit('deleteRef', path);
  }
})();
