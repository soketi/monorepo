/* eslint-disable @typescript-eslint/no-unused-vars */
import { RouterType } from 'itty-router';
import { IWebSocketServerHandler, Server } from '../server';
import { JsonStringifiable } from '@soketi/utils';
import { Connection } from '@soketi/connections';
import { randomUUID } from 'crypto';

export type AvailableProtocols = 'pusher' | 'ably' | 'mqtt';

export abstract class Protocol<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
  ErrorT = unknown,
> implements IWebSocketServerHandler<MessageT, ConnectionT, ErrorT>
{
  constructor(protected instance: Server) {
    //
  }

  async registerHttpRoutes(router: RouterType): Promise<RouterType> {
    return router;
  }

  async registerWebsocketsRoutes(router: RouterType): Promise<RouterType> {
    return router;
  }

  async startup() {
    await this.registerHttpRoutes(this.instance.httpRouter);
    await this.registerWebsocketsRoutes(this.instance.wsRouter);
  }

  async cleanup(): Promise<void> {
    //
  }

  async onNewConnection(conn: ConnectionT): Promise<void> {
    //
  }

  async onConnectionClose(conn: ConnectionT): Promise<void> {
    //
  }

  async onMessage(conn: ConnectionT, message: MessageT): Promise<void> {
    //
  }

  async onError(conn: ConnectionT, error: unknown): Promise<void> {
    //
  }

  async onPing(conn: ConnectionT, message: MessageT): Promise<void> {
    //
  }

  async onPong(conn: ConnectionT, message: MessageT): Promise<void> {
    //
  }

  async createNewConnection(
    conn: Connection,
  ): Promise<Connection | ConnectionT> {
    return conn;
  }

  async generateId(): Promise<ConnectionT['id']> {
    return randomUUID().toString();
  }
}
