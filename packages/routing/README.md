# @soketi/routing

[![Version](https://img.shields.io/npm/v/@soketi/routing)](https://www.npmjs.com/package/@soketi/routing)
[![Total Downloads](https://img.shields.io/npm/dt/@soketi/routing)](https://www.npmjs.com/package/@soketi/routing)
[![License](https://img.shields.io/npm/l/@soketi/routing)](https://www.npmjs.com/package/@soketi/routing)
[![License](https://img.shields.io/npm/collaborators/@soketi/routing)](https://www.npmjs.com/package/@soketi/routing)

`@soketi/routing` is a package that contains the routing logic for the soketipfs server, as well as the logic for handling custom events in the network.

## Usage

### Generic Router

The `GenericRouter` class is used to handle custom events in the network. It's a generic implementation that can be used to handle any type of events.

```ts
import { GenericRouter } from '@soketi/routing';

const router = new GenericRouter();

router.registerHandler('some-event', async (data) => {
  console.log(data);
});

router.handle('some-event', 'Hello world!');
```

The `registerHandler` and `handle` accept any number of arguments, which are passed to the handler.

```ts
router.registerHandler('add', async (a, b) => {
  return a + b;
});

const result = await router.handle('add', 1, 2);
```

### Websockets Router

The `WebsocketsRouter` class is used to handle custom events in the network, but it's specifically designed to work with the WebSockets server by adding some specific events.

```ts
import { Connection } from '@soketi/connections';
import { WebsocketsRouter } from '@soketi/routing';

const router = new WebsocketsRouter();

// 1. New connection
router.onNewConnection(async (conn: Connection) => {
  // ...
});

await router.handleNewConnection(conn);

// 2. Connection closed
router.onConnectionClosed(async (conn: Connection) => {
  // ...
});

await router.handleConnectionClosed(conn);

// 3. Message handling
router.onMessage(async (conn: Connection, message: any) => {
  // ...
});

await router.handleMessage(conn, 'hello');

// 4. Error handling
router.onError(async (conn: Connection, error: any) => {
  // ...
});

await router.handleError(conn, 'hello');

// 5. Custom handlers
// Built on top of the GenericRouter, it can handle custom events.
router.registerHandler('some-event', async (data) => {
  console.log(data);
});

router.handle('some-event', 'Hello world!');
```

## Development

This library was generated with [Nx](https://nx.dev).

### Building

Run `nx build routing` to build the library.

### Running unit tests

Run `nx test routing` to execute the unit tests via [Vitest](https://vitest.dev/).

---
