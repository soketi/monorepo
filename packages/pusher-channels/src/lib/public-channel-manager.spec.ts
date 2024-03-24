import { App, StaticAppsManager } from '@soketi/pusher-apps';
import { PublicChannelManager } from './';
import { PusherConnectionsPool } from './pusher-connections-pool';
import { PusherConnection } from './pusher-connection';
import { NativeWebsocket } from '@soketi/connections';

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

  return new PusherConnection(id, namespace, nativeConn, {
    close: async (code, reason) => {
      closes.push({ code, reason, id, namespace });
    },
    send: async (message) => {
      messages.push({ message, id, namespace });
    },
  });
};

describe('public channel manager', async () => {
  it('should join', async () => {
    const app = await App.load(
      {
        id: 'id1',
        key: 'key1',
        secret: 'secret1',
      },
      {},
    );

    const apps = new StaticAppsManager([app]);
    const connections = new PusherConnectionsPool(apps);
    const manager = new PublicChannelManager(connections, app);

    const connection = await newConnection('probe:voyager-1', app.id);
    await connections.newConnection(connection);

    const { conn, success, authError, channelConnections } = await manager.join(
      connection,
      '5ghz',
      {
        event: 'pusher:subscribe',
        data: { channel: '5ghz' },
      },
    );

    expect(success).toBe(true);
    expect(authError).toBeUndefined();
    expect(channelConnections).toBeUndefined();

    expect(conn.namespace).toBe(app.id);
  });
});
