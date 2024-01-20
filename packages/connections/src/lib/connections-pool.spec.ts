import { Connection } from './connection';
import { ConnectionsPool } from './connections-pool';
import { NativeWebsocket } from './native-websockets';

const messages: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe('connections pool', () => {
  it('works', async () => {
    const pool = new ConnectionsPool();
    const conn1 = await newConnection('1');
    const conn2 = await newConnection('2');
    const conn3 = await newConnection('3', 'other');

    expect(pool).toBeTruthy();

    await pool.newConnection(conn1);
    await pool.newConnection(conn2);
    await pool.newConnection(conn3);

    await pool.broadcastJsonMessage('default', {
      type: 'hello',
      data: 'world',
    });

    expect(messages).toEqual([
      { message: JSON.stringify({ type: 'hello', data: 'world' }), id: '1', namespace: 'default' },
      { message: JSON.stringify({ type: 'hello', data: 'world' }), id: '2', namespace: 'default' },
    ]);

    await pool.broadcastJsonMessage('other', {
      type: 'hello',
      data: 'world',
    });

    expect(messages).toEqual([
      { message: JSON.stringify({ type: 'hello', data: 'world' }), id: '1', namespace: 'default' },
      { message: JSON.stringify({ type: 'hello', data: 'world' }), id: '2', namespace: 'default' },
      { message: JSON.stringify({ type: 'hello', data: 'world' }), id: '3', namespace: 'other' },
    ]);

    await pool.closeAll('default', 1000, 'bye');
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(closes).toEqual([
      { code: 1000, reason: 'bye', id: '1', namespace: 'default' },
      { code: 1000, reason: 'bye', id: '2', namespace: 'default' },
    ]);

    await pool.closeAll('other', 1000, 'bye');
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(closes).toEqual([
      { code: 1000, reason: 'bye', id: '1', namespace: 'default' },
      { code: 1000, reason: 'bye', id: '2', namespace: 'default' },
      { code: 1000, reason: 'bye', id: '3', namespace: 'other' },
    ]);
  });
});
