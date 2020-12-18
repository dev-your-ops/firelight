const expect = require('expect.js');
const db = require('../src/db.js');
const db2 = require('../src/db.js');

describe('play with data ref', () => {
  const ref2 = db.ref('/test2');

  it('should add some test data', () => {
    ref2.set({test: 'test'});

    expect(ref2.data()).to.eql({test: 'test'});
  });

  it('should delete some test data', () => {
    ref2.delete();

    expect(ref2.data()).to.eql({});
    expect(db.dbData).to.eql({});
  });

  const ref = db.ref('/test/1');

  it('should add some test child data', () => {
    ref.set({test: 'test'});

    expect(ref.data()).to.eql({test: 'test'});
  });

  it('should add some child and get a childs list', () => {
    db.ref('/test/2').set({test: 'test'});

    const childs = db.ref('/test').childs();

    expect(childs.length).to.eql(2);
    expect(childs[0].data()).to.eql({test: 'test'});
    expect(childs[1].path).to.eql('/test/2');

    db.ref('/test/2').delete();
  });

  it('should update the test child data', () => {
    ref.set({test: 'test updated'}, true);

    expect(ref.data()).to.eql({test: 'test updated'});
  });

  it('the other db instance should be the same as the first one', () => {
    expect(db.dbData).to.eql(db2.dbData);
  });

  it('should delete some child data', () => {
    db.deleteRef('/test/1');

    expect(db.dbData).to.eql({
      test: {
        childs: {},
        data: {},
      },
    });
  });

  it('should delete parent data', () => {
    db.deleteRef('/test');

    expect(db.dbData).to.eql({});
  });
});
