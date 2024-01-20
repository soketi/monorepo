# @soketi/connections

`@soketi/connections` is an abstraction package that handles the connections over the WebSockets server.

## Usage

### Connections

`Connection` classes are the main way to interact with the WebSockets server. They are used to send and receive messages.

When a new connection is established, the `Connection` class has built-in functionalities of a wrapper to handle the underlying WebSocket connection, while offering a simple scaffolding to implement custom logic.

The second parameter is the namespace. It's used to group connections together. For example, you can have a namespace for authenticated users, and another one for guests.

```ts
import { Connection } from '@soketi/connections';

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
  // The connection is established.
  // Each connection requires a unique ID, which is used for identification.
  // ⚠️ This ID has to be unique in the namespace.
  const connection = new Connection('1', 'default', ws);

  // Listen for messages.
  connection.on('message', (message) => {
    console.log(message);
  });

  // Send a message.
  connection.send('Hello world!');
});
```

### Connections Pool

The `ConnectionsPool` class is used to manage the connections. It's used to send messages to all connections, or to a specific connection. Here, the `namespace` parameter is playing a big role.

```ts
import { Connection, ConnectionsPool } from '@soketi/connections';

const ws = new WebSocket('ws://localhost:8080');
const pool = new ConnectionsPool();

ws.addEventListener('open', () => {
  const connection = new Connection('1', 'default', ws);

  // Add the connection to the pool.
  pool.newConnection(connection);

  // Send a message to all connections in the "default" namespace.
  pool.broadcastMessage('default', 'Hello world!');

  // Send a message to connection with ID "1" in the "default" namespace.
  pool.send('default', '1', 'Hello world!');
});
```

#### Removing connections

To remove a connection from the pool, you can use the `removeConnection` method:

```ts
pool.removeConnection(connection);
```

Optionally, you can pass a callback to be executed if the removed connection was the last one in the namespace:

```ts
pool.removeConnection(connection, () => {
  console.log('No more connections in the namespace.');
});
```

#### Close all connections

To close all connections in a namespace, you can use the `closeAll` method:

```ts
pool.closeAll('default', 1000, 'Closing the connection.'); // code and reason are optional
```

#### Draining the pool

While `closeAll` is forcefully closing all connections, the `drainConnections` method is closing all connections in smaller batches, with a delay between each batch, so that the server is not overloaded and there are no spikes in the reconnection rate in other nodes.

```ts
pool.drainConnections(
  // each second, allow a maximum of 10 connections to be closed
  10,

  // reason is optional
  'Closed by the server.',

  // the code is optional
  1000,
);
```

## Development

This library was generated with [Nx](https://nx.dev).

### Building

Run `nx build connections` to build the library.

### Running unit tests

Run `nx test connections` to execute the unit tests via [Vitest](https://vitest.dev/).
****
