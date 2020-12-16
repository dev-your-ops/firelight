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
    return this.context.set(this.path, data, merge);
  }

  data(childs = false) {
    return this.context.data(this.path, childs);
  }

  delete() {
    return this.context.deleteRef(this.path);
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
    this.save();
  }

  save() {
    if (this.dbPath) {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.dbData, null, 2));
    }
  }

  data(path, childs) {
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
    return childs ? res : res.data;
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
      this.save();
    }
  }

  ref(path) {
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
    this.emit('delete', path);
    this.save();
  }
})();

module.set = function (db, path, data, merge = false) {
  let pathTab = path.split('/').filter((e) => e);

  if (pathTab.length) {
    if (!db[pathTab[0]]) db[pathTab[0]] = {data: {}, childs: {}};

    let res = db[pathTab[0]];

    for (let i = 1; i < pathTab.length; i++) {
      if (!res.childs[pathTab[i]])
        res.childs[pathTab[i]] = {data: {}, childs: {}};
      res = res.childs[pathTab[i]];
    }

    res.data = {
      ...(merge ? res.data : {}),
      ...data,
    };
  }

  return db;
};

module.delete = function (db, path) {
  let pathTab = path.split('/').filter((e) => e);

  if (pathTab.length === 1) {
    delete db[pathTab[0]];
  } else if (pathTab.length > 1) {
    let res = db[pathTab[0]];

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

  return db;
};
