import { IRequest, RouterType } from 'itty-router';
import {
  App,
  us_listen_socket,
  us_listen_socket_close,
  type TemplatedApp,
  HttpResponse,
  HttpRequest,
} from 'uWebSockets.js';
import { Runner } from './runner';
import { ab2str } from '@soketi/utils';
import { Connection } from '@soketi/connections';

export class MicroWebsocketsRunner extends Runner {
  server!: TemplatedApp;
  socket?: us_listen_socket;

  override async registerHttpRoutes(router: RouterType): Promise<RouterType> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.get<IRequest>('/stats', (request) => {
      return Response.json({
        connections: [...this.instance.connections.connections.keys()],
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    router.get<IRequest>('/peers', async (request) => {
      return Response.json(await this.instance.gossiper.peers());
    });

    return router;
  }

  override async startup() {
    await super.startup();

    // TODO: SSL?
    this.server = App();

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
      this.server.ws<{ id: string; namespace: string }>(
        '/namespace/:namespace',
        {
          upgrade: (res, req, context) => {
            res.upgrade(
              {
                ip: ab2str(res.getRemoteAddressAsText()),
                ip2: ab2str(res.getProxiedRemoteAddressAsText()),
                namespace: req.getParameter(0),
                id: this.instance.protocol?.generateId(),
              },
              req.getHeader('sec-websocket-key'),
              req.getHeader('sec-websocket-protocol'),
              req.getHeader('sec-websocket-extensions'),
              context,
            );
          },
          sendPingsAutomatically: true,
          idleTimeout: 120,
          maxPayloadLength: 16 * 1024 * 1024, // TODO: Configurable?
          open: async (ws) => {
            const { id, namespace } = ws.getUserData();

            const connectionStub = new Connection(id, namespace, ws, {
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

            const connection = await this.instance.createNewConnection(
              connectionStub,
            );

            if (!this.instance.connections.hasNamespace(namespace)) {
              // Subscribe to this namespace.
              await this.instance.gossiper.subscribeToNamespace(
                namespace,
                async (data) => {
                  // In case a message was broadcasted by a connection on this namespace,
                  // we will be notified. This way, we can broadcast the message to our local connections too.
                  // We are 100% sure that the message was not sent from one of our connections, because
                  // the self-broadcast is disabled.
                  if (data.event === 'message:incoming') {
                    const msg = ab2str(data.payload?.message as ArrayBuffer);

                    this.instance.connections.broadcastJsonMessage(
                      namespace,
                      JSON.parse(msg),
                    );
                  }
                },
              );
            }

            await this.instance.connections.newConnection(connection);
            await this.instance.gossiper.announceNewConnection(namespace, id);
          },
          message: async (ws, message, isBinary) => {
            const { id, namespace } = ws.getUserData();
            const msg = ab2str(message);

            this.instance.connections.broadcastMessage(namespace, msg, [id]);
            this.instance.gossiper.announceNewMessage(namespace, id, msg);

            console.log(
              `[${id}] ${isBinary ? 'Binary' : 'Text'} message: ${msg}`,
            );
          },
          ping: async (ws, message) => {
            const { id, namespace } = ws.getUserData();

            const connection = await this.instance.connections.getConnection(
              namespace,
              id,
            );

            if (!connection) {
              return;
            }

            await connection.updateTimeout();
            console.log(`[${id}] Ping: ${ab2str(message)}`);
          },
          pong: async (ws, message) => {
            const { id, namespace } = ws.getUserData();

            const connection = await this.instance.connections.getConnection(
              namespace,
              id,
            );

            if (!connection) {
              return;
            }

            await connection.updateTimeout();
            console.log(`[${id}] Pong: ${ab2str(message)}`);
          },
          close: async (ws, code, message) => {
            const { id, namespace } = ws.getUserData();
            const connection = await this.instance.connections.getConnection(
              namespace,
              id,
            );

            if (!connection) {
              return;
            }

            await this.instance.connections.removeConnection(
              connection,
              async () => {
                await this.instance.gossiper.unsubscribeFromNamespace(
                  namespace,
                );
              },
            );

            console.warn(`[${id}] Closed: ${ab2str(message)} (${code})`);
          },
          dropped: () => {
            //
          },
        },
      );

      this.server.any('/*', async (res: HttpResponse, req: HttpRequest) => {
        res.onAborted(() => {
          console.error('Aborted');
        });

        const headers: Record<string, string> = {};
        req.forEach((k, v) => {
          headers[k] = v;
        });

        const query = req.getQuery();
        const path = req.getUrl();
        const method = req.getMethod();
        const queryString = query ? `?${query}` : '';

        const request = new Request(
          new URL(`http://soketi${path}${queryString}`),
          {
            method,
            headers,
            body: await (async () => {
              if (method === 'get') {
                return undefined;
              }

              try {
                const { rawJson } = await this.readJson(res);
                return rawJson;
              } catch (e) {
                return '';
              }
            })(),
          },
        );

        const response: Response = await this.instance.httpRouter.handle(
          request,
        );

        res.cork(async () => {
          try {
            response.headers.forEach((value, key) => {
              res.writeHeader(key, value);
            });

            res.writeStatus(response.status.toString());
            res.writeHeader(
              'Content-Type',
              response.headers.get('Content-Type') ?? '',
            );

            res.writeStatus('200 OK');
            res.end(await response.text());
          } catch (e) {
            console.error(e);
            res.writeStatus('500 Internal Server Error');
            res.end('Internal Server Error');
          }
        });
      });

      const { host = '0.0.0.0', port = 7001 } =
        this.instance.options.server ?? {};

      this.server.listen(host, port, (socket) => {
        this.socket = socket;
        console.log(`Listening on port ${port}...`);
        resolve();
      });
    });
  }

  override async cleanup() {
    if (!this.socket) {
      return;
    }

    us_listen_socket_close(this.socket);
  }

  protected async readJson(res: HttpResponse): Promise<{
    rawJson: string;
    json: Record<string, unknown>;
  }> {
    return new Promise((resolve, reject) => {
      let buffer: Buffer;

      /* Register data cb */
      res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);

        if (isLast) {
          let json;
          let rawJson;

          if (buffer) {
            try {
              json = JSON.parse(
                Buffer.concat([buffer, chunk]) as unknown as string,
              );
            } catch (e) {
              /* res.close calls onAborted */
              reject();
              res.close();
              return;
            }

            rawJson = buffer.toString();
            resolve({ rawJson, json });
          } else {
            try {
              json = JSON.parse(chunk as unknown as string);
            } catch (e) {
              /* res.close calls onAborted */
              reject();
              res.close();
              return;
            }

            rawJson = chunk.toString();
            resolve({ rawJson, json });
          }
        } else {
          if (buffer) {
            buffer = Buffer.concat([buffer, chunk]);
          } else {
            buffer = Buffer.concat([chunk]);
          }
        }
      });

      /* Register error cb */
      res.onAborted(() => {
        reject();
      });
    });
  }
}
