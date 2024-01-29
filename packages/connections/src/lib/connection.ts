import { JsonStringifiable } from '@soketi/utils';
import { NativeConnectionHandlers, NativeWebsocket } from './native-websockets';
import { RemoteConnection } from './remote-connection';

export class Connection<
  ID extends IConnection['id'] = IConnection['id'],
  Message = JsonStringifiable,
  NativeConnection = NativeWebsocket,
> implements IConnection<ID, Message, NativeConnection>
{
  closed = false;
  timeout!: NodeJS.Timeout;

  constructor(
    public id: ID,
    public namespace: string,
    public connection: NativeConnection,
    public handlers: NativeConnectionHandlers<Message>,
  ) {
    //
  }

  async clearTimeout(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  async updateTimeout(): Promise<void> {
    this.clearTimeout();
    this.timeout = setTimeout(() => this.close(), 120_000);
  }

  async send<M = Message>(message: M): Promise<void> {
    await this.handlers.send<M>(message);
    this.updateTimeout();
  }

  async sendJson<M>(message: M): Promise<void> {
    try {
      // We actually just "try" to make it JSON.
      // If it fails, we just send the message as-is.
      const m = JSON.stringify(message);
      this.send<M>(m as M);
    } catch (e) {
      this.send<M>(message);
    }
  }

  async sendError<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    await this.send<M>(message);
    this.close(code, reason);
  }

  async close(code?: number, reason?: string): Promise<void> {
    this.closed = true;

    this.clearTimeout();

    setTimeout(async () => {
      await this.handlers.close(code, reason);
    }, 100);
  }

  async sendThenClose<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    await this.send<M>(message);
    this.close(code, reason);
  }

  async sendJsonThenClose<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    await this.sendJson<M>(message);
    this.close(code, reason);
  }

  async sendErrorThenClose<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    await this.sendError<M>(message, code, reason);
    this.close(code, reason);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toRemote(remoteInstanceId?: ID): RemoteConnection<ID> {
    return {
      id: this.id,
      namespace: this.namespace,
    };
  }
}

export interface IConnection<
  ID = string,
  Message = unknown,
  NativeConnection = NativeWebsocket,
> {
  id: ID;
  namespace: string;
  connection: NativeConnection;
  closed: boolean;
  handlers: NativeConnectionHandlers<Message>;
  send<M>(message: M): Promise<void>;
  sendJson<M>(message: M): Promise<void>;
  sendError<M>(message: M, code?: number, reason?: string): Promise<void>;
  close(code?: number, reason?: string): Promise<void>;
  sendThenClose<M>(message: M, code?: number, reason?: string): Promise<void>;
  sendJsonThenClose<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void>;
  sendErrorThenClose<M>(
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void>;
  toRemote(remoteInstanceId?: ID): RemoteConnection<ID>;
  clearTimeout(): Promise<void>;
  updateTimeout(): Promise<void>;
}
