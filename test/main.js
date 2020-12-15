const expect = require('expect.js');
const db = require('../src/db.js');
const db2 = require('../src/db.js');

db.load();

describe('play with data ref', function () {
  const ref = db.ref('/test');

  it('should add some test data', function () {
    ref.set({test: 'test'});
    expect(ref.data()).to.eql({test: 'test'});
  });

  it('should update the test data', function () {
    ref.set({test: 'test updated'}, true);

    expect(ref.data()).to.eql({test: 'test updated'});
  });

  it('the other db instance should be the same as the first one', function () {
    expect(db.data).to.eql(db2.data);
  });

  it('should update the test data', function () {
    db.deleteRef(ref.path);

    expect(db.data).to.eql({});
  });
});
