import { Connection, ConnectionsPool } from '@soketi/connections';
import { Brain } from '@soketi/brain';
import { Gossiper } from '@soketi/gossiper';
import { ab2str } from '@soketi/utils';

import { Server } from './server';
import { randomUUID } from 'crypto';

import {
  App,
  us_listen_socket,
  us_listen_socket_close,
  type TemplatedApp
} from 'uWebSockets.js';

export interface WebSocketData<CID extends string = string> {
  id: CID;
  ip?: string;
  ip2?: string;
  namespace: string;
}

export class MicroWebsocketServer<
  CID extends string = string,
  CPool extends ConnectionsPool = ConnectionsPool,
  B extends Brain = Brain,
  G extends Gossiper = Gossiper,
> extends Server<CPool, B, G> {
  server!: TemplatedApp;
  socket?: us_listen_socket;

  constructor(
    public override readonly brain: B,
    public override readonly gossiper: G,
    public override readonly connections: CPool,
  ) {
    super(brain, gossiper, connections);

    this.server = App();
  }

  override async start(signalHandler?: () => Promise<void>): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async resolve => {
      this.server.ws<WebSocketData<CID>>('/:namespace', {
        sendPingsAutomatically: true,
        idleTimeout: 120,
        close: async (ws, code, message) => {
          const { id, namespace } = ws.getUserData();
          const connection = await this.connections.getConnection(namespace, id);

          if (!connection) {
            return;
          }

          await this.connections.removeConnection(connection, async () => {
            await this.gossiper.unsubscribeFromNamespace(namespace);
          });

          console.warn(`[${id}] Closed: ${ab2str(message)} (${code})`);
        },
        open: async (ws) => {
          const { id, namespace } = ws.getUserData();

          const connection = new Connection(id, namespace, ws, {
            close: async (code, reason) => {
              try {
                ws.end(code, reason);
              } catch (e) {
                //
              }
            },
            send: async (message) => {
              ws.send(JSON.stringify(message), false, true);
            },
          });

          if (!this.connections.hasNamespace(namespace)) {
            // Subscribe to this namespace.
            await this.gossiper.subscribeToNamespace(namespace, async (data) => {
              // In case a message was broadcasted by a connection on this namespace,
              // we will be notified. This way, we can broadcast the message to our local connections too.
              // We are 100% sure that the message was not sent from one of our connections, because
              // the self-broadcast is disabled.
              if (data.event === 'message:incoming') {
                this.connections.broadcastJsonMessage(
                  namespace,
                  JSON.parse(data.payload?.message as string),
                );
              }
            });
          }

          await this.connections.newConnection(connection);
          await this.gossiper.announceNewConnection(namespace, id);

          console.log(`New connection: ${id}`);
        },
        message: async (ws, message, isBinary) => {
          const { id, namespace } = ws.getUserData();
          const msg = ab2str(message);

          this.connections.broadcastMessage(namespace, msg, [id]);
          this.gossiper.announceNewMessage(namespace, id, msg);

          console.log(`[${id}] ${isBinary ? 'Binary' : 'Text'} message: ${msg}`);
        },
        // TODO: Implement?
        // subscription: (ws, topic, newCount, oldCount) => {
        // },
        ping: async (ws, message) => {
          const { id, namespace } = ws.getUserData();
          const connection = await this.connections.getConnection(namespace, id);

          if (!connection) {
            return;
          }

          await connection.updateTimeout();
          console.log(`[${id}] Ping: ${ab2str(message)}`);
        },
        pong: async (ws, message) => {
          const { id, namespace } = ws.getUserData();
          const connection = await this.connections.getConnection(namespace, id);

          if (!connection) {
            return;
          }

          await connection.updateTimeout();
          console.log(`[${id}] Pong: ${ab2str(message)}`);
        },
        upgrade: (res, req, context) => {
          res.upgrade<WebSocketData>(
            {
              ip: ab2str(res.getRemoteAddressAsText()),
              ip2: ab2str(res.getProxiedRemoteAddressAsText()),
              id: String(randomUUID()),
              namespace: req.getParameter(0),
            },
            req.getHeader('sec-websocket-key'),
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context,
          );
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.server.get('/p2p', async (res, req) => {
        res.writeHeader('Content-Type', 'application/json');
        res.writeStatus('200 OK');
        res.end(JSON.stringify(await this.gossiper.peers()));
      });

      await super.start(signalHandler);

      this.server.listen(Number(process.env['PORT'] || 7001), (socket) => {
        this.socket = socket;
        console.log('Listening on port 6001...');
        resolve();
      });
    });
  }

  override async closeServer(): Promise<void> {
    if (!this.socket) {
      return;
    }

    us_listen_socket_close(this.socket);
  }
}
