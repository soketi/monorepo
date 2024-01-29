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
  code: number | undefined;
  reason: string | undefined;
  id: string;
  namespace: string;
}[] = [];

const newConnection = async (id: string, namespace = 'radio:5ghz') => {
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
  beforeEach(() => {
    messages.length = 0;
    closes.length = 0;
  });

  it('works', async () => {
    const pool = new ConnectionsPool();
    const conn1 = await newConnection('probe:voyager-1');
    const conn2 = await newConnection('earth:jfk-space-center');
    const conn3 = await newConnection('planet:neptune', 'radio:40ghz');

    expect(pool).toBeTruthy();

    await pool.newConnection(conn1);
    await pool.newConnection(conn2);
    await pool.newConnection(conn3);

    await pool.broadcastJsonMessage('radio:5ghz', {
      type: 'hello',
      data: 'world',
    });

    expect(messages).toEqual([
      {
        message: JSON.stringify({ type: 'hello', data: 'world' }),
        id: 'probe:voyager-1',
        namespace: 'radio:5ghz',
      },
      {
        message: JSON.stringify({ type: 'hello', data: 'world' }),
        id: 'earth:jfk-space-center',
        namespace: 'radio:5ghz',
      },
    ]);

    await pool.broadcastJsonMessage('radio:40ghz', {
      type: 'hello',
      data: 'world',
    });

    expect(messages).toEqual([
      {
        message: JSON.stringify({ type: 'hello', data: 'world' }),
        id: 'probe:voyager-1',
        namespace: 'radio:5ghz',
      },
      {
        message: JSON.stringify({ type: 'hello', data: 'world' }),
        id: 'earth:jfk-space-center',
        namespace: 'radio:5ghz',
      },
      {
        message: JSON.stringify({ type: 'hello', data: 'world' }),
        id: 'planet:neptune',
        namespace: 'radio:40ghz',
      },
    ]);

    await pool.closeAll('radio:5ghz', 1000, 'bye');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(closes).toEqual([
      {
        code: 1000,
        reason: 'bye',
        id: 'probe:voyager-1',
        namespace: 'radio:5ghz',
      },
      {
        code: 1000,
        reason: 'bye',
        id: 'earth:jfk-space-center',
        namespace: 'radio:5ghz',
      },
    ]);

    await pool.closeAll('radio:40ghz', 1000, 'bye');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(closes).toEqual([
      {
        code: 1000,
        reason: 'bye',
        id: 'probe:voyager-1',
        namespace: 'radio:5ghz',
      },
      {
        code: 1000,
        reason: 'bye',
        id: 'earth:jfk-space-center',
        namespace: 'radio:5ghz',
      },
      {
        code: 1000,
        reason: 'bye',
        id: 'planet:neptune',
        namespace: 'radio:40ghz',
      },
    ]);
  });
});
