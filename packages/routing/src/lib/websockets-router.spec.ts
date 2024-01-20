/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, ConnectionsPool, NativeWebsocket } from '@soketi/connections';
import { WebsocketsRouter } from './websockets-router';

const messages: {
  message: any;
  id: string;
  namespace: string;
}[] = [];

const closes: {
  code: number|undefined;
  reason: string|undefined;
  id: string;
  namespace: string;
}[] = [];

beforeEach(() => {
  messages.length = 0;
  closes.length = 0;
});

const newConnection = async (id: string, namespace = 'default') => {
  const nativeConn = {
    send: vitest.fn(),
    close: vitest.fn(),
  } as NativeWebsocket;

  return new Connection(id, namespace, nativeConn, {
    close: async (code, reason) => {
      closes.push({ code, reason, id, namespace });
    },
    send: async (message) => {
      messages.push({ message, id, namespace });
    },
  });
};

describe('websockets router', () => {
  it('works', async () => {
    const router = new WebsocketsRouter();

    router.registerHandler('foo', async () => {
      return 'foo';
    });

    router.registerHandler('bar', async () => {
      return 'bar';
    });

    expect(await router.handle('foo')).toEqual('foo');
    expect(await router.handle('bar')).toEqual('bar');
    expect(await router.handle('baz')).toEqual(undefined);
  });

  it('works with connect/disconnect', async () => {
    const router = new WebsocketsRouter();
    const connections = new ConnectionsPool();

    router.onNewConnection(async (conn: Connection) => {
      await connections.newConnection(conn);
    });

    router.onConnectionClosed(async (conn: Connection) => {
      await connections.removeConnection(conn);
    });

    const conn = await newConnection('1');

    await router.handleNewConnection(conn);
    expect(connections.connections.size).toEqual(1);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);
  });

  it('works with messages', async () => {
    const router = new WebsocketsRouter();
    const connections = new ConnectionsPool();

    router.onNewConnection(async (conn: Connection) => {
      await connections.newConnection(conn);
    });

    router.onConnectionClosed(async (conn: Connection) => {
      await connections.removeConnection(conn);
    });

    router.onMessage(async (conn: Connection, message: any) => {
      await conn.send(message);
    });

    const conn = await newConnection('1');

    await router.handleNewConnection(conn);
    expect(connections.connections.size).toEqual(1);

    await router.handleMessage(conn, 'hello');
    expect(messages).toEqual([{ message: 'hello', id: '1', namespace: 'default' }]);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);
  });

  it('works with errors', async () => {
    const router = new WebsocketsRouter();
    const connections = new ConnectionsPool();

    router.onNewConnection(async (conn: Connection) => {
      await connections.newConnection(conn);
    });

    router.onConnectionClosed(async (conn: Connection) => {
      await connections.removeConnection(conn);
    });

    router.onError(async (conn: Connection, error: any) => {
      await conn.send(error);
    });

    const conn = await newConnection('1');

    await router.handleNewConnection(conn);
    expect(connections.connections.size).toEqual(1);

    await router.handleError(conn, 'hello');
    expect(messages).toEqual([{ message: 'hello', id: '1', namespace: 'default' }]);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);

    await router.handleConnectionClosed(conn);
    expect(connections.connections.size).toEqual(0);
  });
});
