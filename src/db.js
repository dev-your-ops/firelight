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
    const newData = {
      ...(merge ? this.context.data[this.path] : {}),
      ...data,
    };

    this.context.data[this.path] = newData;
    this.context.save();
    this.emit('set', {path: this.path, data: newData});
  }

  data() {
    return this.context.data[this.path];
  }
}

module.exports = (dbPath = path.resolve('db.json')) =>
  new (class db extends EventEmitter {
    constructor() {
      super();
      try {
        this.data = JSON.parse(fs.readFileSync(dbPath));
      } catch (e) {
        console.error(e.message);
        console.info(
          'the database has not been found and will therefore be created at',
          dbPath
        );
        this.data = {};
        this.save();
      }
    }

    save() {
      fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2));
    }

    ref(path) {
      return new Ref(this, path).on('set', (e) => this.emit('set', e));
    }

    deleteRef(path) {
      delete this.data[path];
      this.emit('delete', path);
      this.save();
    }
  })();
