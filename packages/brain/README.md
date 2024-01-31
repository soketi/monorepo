# @soketi/brain

[![Version](https://img.shields.io/npm/v/@soketi/brain)](https://www.npmjs.com/package/@soketi/brain)
[![Total Downloads](https://img.shields.io/npm/dt/@soketi/brain)](https://www.npmjs.com/package/@soketi/brain)
[![License](https://img.shields.io/npm/l/@soketi/brain)](https://www.npmjs.com/package/@soketi/brain)
[![License](https://img.shields.io/npm/collaborators/@soketi/brain)](https://www.npmjs.com/package/@soketi/brain)

`@soketi/brain` is an abstraction package that handles the caching of data in memory.

## Usage

```ts
import { LocalBrain } from '@soketi/brain';

const brain = new LocalBrain();

await brain.set('key', 'value');
await brain.get('key');
```

### Brains

We are planning to support multiple types of brains.

- [x] `LocalBrain` - stores data in memory, in the same process; it's not shared between processes
- [ ] `RedisBrain` - stores data in Redis
- [ ] `MemcachedBrain` - stores data in Memcached
- [ ] `MongoBrain` - stores data in MongoDB
- [ ] `SqlBrain` - stores data in a SQL database, using Knex

### Custom Brains

You can create your own brain by implementing the `Brain` interface:

```ts
import { Brain } from '@soketi/brain';

class MyBrain implements Brain {
  // ...
}

const brain = new MyBrain();
```

## Development

This library was generated with [Nx](https://nx.dev).

### Building

Run `nx build brain` to build the library.

### Running unit tests

Run `nx test brain` to execute the unit tests via [Vitest](https://vitest.dev/).
