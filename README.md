# Welcome to FireLight !

FireLight is a very simple and light database that allows you to share an object with several processes.
It is more a shared object than a real database DO NOT use it to process massive or sensitive data!

## Get Started

### Install

`yarn add @dev-your-ops/firelight`

or

`npm i @dev-your-ops/firelight`

### Usage

By default, the database file is created at the root of the project with the name "db.json".

    const db = require('@dev-your-ops/firelight')
    db.load()

> you can give a path as an option to store the db wherever you want :
>
> `db.load('/tmp/db.json')`

#### _get a ref_

`const user = db.ref('/users/1')`

> it will take the user if it exists or will create the space for it

#### _set data_

`user.set({firstname: 'john'});`

> if you pass true as the second argument, the new data and the old data will be merged together:
>
> `user.set({lastname: 'doe'}, true); // user.data() = {firstname: 'john', lastname: 'doe'}`

#### _get ref data_

You can access the data by using the association function.

`const userData = user.data()`

#### _get ref childs_

You have access to all the children of a ref.

`const userChilds = db.ref('/users').childs()`

#### _Example_

    const db = require('@dev-your-ops/firelight')
    db.load()

    // subsribe to change
    db.on('onload', (e) => console.log('onload:', e));
    db.on('set', (e) => console.log('set:', e));
    db.on('delete', (e) => console.log('delete:', e));

    // create a user
    const user = db.ref('/users/1')

    // set user data
    user.set({ name: 'test' })

    // update user data
    user.set({ tab: [1, 2, 3] }, true)

    console.log(user.data())
    // => { name: 'test', tab: [1, 2, 3] }

    // Advence
    console.log(db.ref("/users/2").set({name: 'user 2'}).data())
    console.log(db.ref("/users").childs()[1].data())

    // delete the user
    db.deleteRef(user.path)

# ! important

if you are using nodemon or any other hot reload method, then you will need to ignore the db.json file.
for example, for nodemon, add a file named "nodemon.json" with:

    // nodemon.json
    {
    	"ignore": ["db.json"]
    }

## Parameters

the **db** object:

| Property              | Type       | What is it ?                                                              |
| --------------------- | ---------- | ------------------------------------------------------------------------- |
| ref(**_path_**)       | `Function` | Get or create a new space to the db associeted with the gived **_path_**. |
| deleteRef(**_path_**) | `Function` | Delete the space on the db at the gived **_path_**.                       |
| load()                | `Function` | Read the file from the dbPath location an load it into dbData             |
| save()                | `Function` | Write the stringified data in the json db file.                           |
| dbData                | `Object`   | Is an object with containe the bd json file parsed.                       |
| dbPath                | `String`   | The file path to save the data from thedatabasedata.                      |

the **ref** object:

| Property                     | Type       | Return        | What is it ?                                                                              |
| ---------------------------- | ---------- | ------------- | ----------------------------------------------------------------------------------------- |
| set(**_data_**, **_merge_**) | `Function` | the ref       | Set **_data_** of ref space (if **_merge_** is true the new and old data will be merged). |
| delete()                     | `Function` | the ref       | Delete the current ref                                                                    |
| data()                       | `Function` | the ref data  | Get the ref data.                                                                         |
| childs()                     | `Function` | [Ref, Ref...] | Get all ref childs as an array of ref.                                                    |
| path                         | `Object`   | the ref path  | The current ref path.                                                                     |
| context                      | `Object`   | the db Object | The parent db object.                                                                     |

## Events

you can subsribe to db event to know whats happened with the data and share it between other process

    // fire only at first instansiation
    firelight.on( 'onload', (data) => console.log('data:', data));  // => data

    firelight.on( 'set',    (e)    => console.log('set:', e));      // => {path, data, merge}
    firelight.on( 'delete', (e)    => console.log('delete:', e));   // => path

you can then recreate the db object on another process

    import firelight from "@dev-your-ops/firelight"

    // on load
    firelight.dbData = data

    // on set
    firelight.set({path, data, merge})

    // on delete
    firelight.deleteRef(path)
