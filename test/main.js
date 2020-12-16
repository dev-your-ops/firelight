const expect = require('expect.js');
const db = require('../src/db.js');
const db2 = require('../src/db.js');

db.load();

describe('play with data ref', function () {
  const ref2 = db.ref('/test2');

  it('should add some test data', function () {
    ref2.set({test: 'test'});

    expect(ref2.data()).to.eql({test: 'test'});
  });

  it('should delete some test data', function () {
    ref2.delete();

    expect(ref2.data()).to.eql({});
    expect(db.dbData).to.eql({});
  });

  const ref = db.ref('/test/1');

  it('should add some test child data', function () {
    ref.set({test: 'test'});

    expect(ref.data()).to.eql({test: 'test'});
  });

  it('should update the test child data', function () {
    ref.set({test: 'test updated'}, true);

    expect(ref.data()).to.eql({test: 'test updated'});
  });

  it('the other db instance should be the same as the first one', function () {
    expect(db.dbData).to.eql(db2.dbData);
  });

  it('should delete some child data', function () {
    db.deleteRef('/test/1');

    expect(db.dbData).to.eql({
      test: {
        childs: {},
        data: {},
      },
    });
  });

  it('should delete parent data', function () {
    db.deleteRef('/test');

    expect(db.dbData).to.eql({});
  });
});
