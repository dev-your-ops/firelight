const db = require('@dev-your-ops/firelight');

// subsribe change
db.on('set', (e) => console.log('set:', e));
db.on('delete', (e) => console.log('delete:', e));

// create a user
let user = db.ref('/user/1');

// set user data
user.set({name: 'ok'});
// set user data with merge
user.set({lastName: 'fsdf'}, true);

// delete user
db.deleteRef('/user/1');
