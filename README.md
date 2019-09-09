# Parse Mutex
A Network Distributed Lock Mechanism for Parse

## How to use it?

### Install the library

```sh
$ echo @PopSugar:registry=https://npm.pkg.github.com/ >> .npmrc
$ npm install @PopSugar/parsemutex --save
```

### Create a file for mutex

```js
const ParseMutex = require('@PopSugar/parsemutex').default;

const mutex = new ParseMutex(databaseURI, 'sparkle');

module.exports = mutex;
```

### Use mutex

```js
const mutex = require('FILE YOU CREATED');

mutex.lock('name of lock', () => {
  // do anything.
});
```
