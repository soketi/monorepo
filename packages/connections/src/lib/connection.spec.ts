import { Connection } from './connection';
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

describe('connection', () => {
  it('works', async () => {
    const conn = await newConnection('probe:voyager-1');

    expect(conn).toBeTruthy();

    await conn.sendThenClose('hello', 1000, 'bye');

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(messages).toEqual([{ message: 'hello', id: 'probe:voyager-1', namespace: 'radio:5ghz' }]);
    expect(closes).toEqual([{ code: 1000, reason: 'bye', id: 'probe:voyager-1', namespace: 'radio:5ghz' }]);
  });
});
