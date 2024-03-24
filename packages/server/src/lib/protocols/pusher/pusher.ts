/* eslint-disable @typescript-eslint/no-unused-vars */
import { JsonStringifiable } from '@soketi/utils';
import { Protocol } from '../protocol';
import { IRequest, RouterType } from 'itty-router';
import { PusherConnection } from '@soketi/pusher-channels';
import { Connection } from '@soketi/connections';
import { generateSocketId } from '@soketi/utils';

export class PusherProtocol extends Protocol<
  JsonStringifiable,
  PusherConnection
> {
  override async registerHttpRoutes(router: RouterType): Promise<RouterType> {
    router.get<IRequest>('/apps/:appId', (request) => {
      const { appId } = request.params;

      return Response.json({
        appId,
        connections: [...this.instance.connections.namespace(appId).keys()],
      });
    });

    return router;
  }

  override async registerWebsocketsRoutes(
    router: RouterType,
  ): Promise<RouterType> {
    // router.get('/app/:appKey', async (request) => {
    //   return { ...request.params };
    // });

    return router;
  }

  override async onNewConnection(conn: PusherConnection): Promise<void> {
    //
  }

  override async onConnectionClose(conn: PusherConnection): Promise<void> {
    //
  }

  override async onMessage(
    conn: PusherConnection,
    message: JsonStringifiable,
  ): Promise<void> {
    //
  }

  override async onError(
    conn: PusherConnection,
    error: unknown,
  ): Promise<void> {
    //
  }

  override async onPing(
    conn: PusherConnection,
    message: JsonStringifiable,
  ): Promise<void> {
    //
  }

  override async onPong(
    conn: PusherConnection,
    message: JsonStringifiable,
  ): Promise<void> {
    //
  }

  override async createNewConnection(
    conn: Connection,
  ): Promise<PusherConnection> {
    return new PusherConnection(
      conn.id,
      conn.namespace,
      conn.connection,
      conn.handlers,
    );
  }

  override async generateId(): Promise<PusherConnection['id']> {
    return generateSocketId();
  }
}
