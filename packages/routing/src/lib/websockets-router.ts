/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericRouter, Handler } from './generic-router';
import { Connection } from '@soketi/connections';

export class WebsocketsRouter<
  C extends Connection = Connection,
> extends GenericRouter {
  ON_NEW_CONNECTION = 'onNewConnection';
  ON_CONNECTION_CLOSED = 'onConnectionClosed';
  ON_MESSAGE = 'onMessage';
  ON_ERROR = 'onError';

  onNewConnection(
    handler: Handler<[C, ...any[]]>,
  ): void {
    this.registerHandler(this.ON_NEW_CONNECTION, handler);
  }

  onConnectionClosed(
    handler: Handler<[C, number|undefined, any, ...any[]]>,
  ): void {
    this.registerHandler(this.ON_CONNECTION_CLOSED, handler);
  }

  onMessage(
    handler: Handler<[C, any, ...any[]]>,
  ): void {
    this.registerHandler(this.ON_MESSAGE, handler);
  }

  onError(
    handler: Handler<[C, any, ...any[]]>,
  ): void {
    this.registerHandler(this.ON_ERROR, handler);
  }

  async handleNewConnection(connection: C, ...args: any[]): Promise<void> {
    await this.handle(this.ON_NEW_CONNECTION, connection, ...args);
  }

  async handleConnectionClosed(
    connection: C,
    code?: number,
    message?: any,
    ...args: any[]
  ): Promise<void> {
    await this.handle(this.ON_CONNECTION_CLOSED, connection, code, message, ...args);
  }

  async handleMessage(
    connection: C,
    message: any,
    ...args: any[]
  ): Promise<void> {
    await this.handle(this.ON_MESSAGE, connection, message, ...args);
  }

  async handleError(
    connection: C,
    error: any,
    ...args: any[]
  ): Promise<void> {
    await this.handle(this.ON_ERROR, connection, error, ...args);
  }
}
