import { JsonStringifiable, chunkArray } from '@soketi/utils';
import { Connection } from './connection';

export class ConnectionsPool<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
> implements IConnectionsPool<ConnectionT, MessageT>
{
  readonly connections = new Map<string, Map<ConnectionT['id'], ConnectionT>>();

  declare readonly connectionId: ConnectionT['id'];

  namespace(namespace: string): Map<ConnectionT['id'], ConnectionT> {
    if (!this.hasNamespace(namespace)) {
      this.connections.set(namespace, new Map<string, ConnectionT>());
    }

    return this.connections.get(namespace) as Map<string, ConnectionT>;
  }

  hasNamespace(namespace: string): boolean {
    return this.connections.has(namespace);
  }

  async newConnection(conn: ConnectionT): Promise<void> {
    this.namespace(conn.namespace).set(conn.id, conn);
  }

  async removeConnection(
    conn: ConnectionT,
    onEmptyNamespace?: () => Promise<void>,
  ): Promise<void> {
    conn.clearTimeout();
    this.namespace(conn.namespace).delete(conn.id);

    if (this.connections.get(conn.namespace)?.size === 0) {
      this.connections.delete(conn.namespace);

      if (onEmptyNamespace) {
        await onEmptyNamespace();
      }
    }
  }

  async drainConnections(
    maxPerSecond = 1000,
    message?: string,
    code?: number,
  ): Promise<void> {
    await Promise.allSettled(
      [...this.connections.keys()].map((ns) => {
        // Take all connections and drain them.
        chunkArray<ConnectionT>(
          [...(this.namespace(ns).values() || [])],
          maxPerSecond,
          async (chunks) => {
            await Promise.allSettled(
              chunks.map((conn) => conn.close(code, message)),
            );
            await new Promise((resolve) => setTimeout(resolve, 1e3));
          },
        ).then(() => {
          this.connections.delete(ns);
        });
      }),
    );
  }

  async getConnection(
    namespace: string,
    id: ConnectionT['id'],
  ): Promise<ConnectionT | undefined> {
    return this.namespace(namespace).get(id);
  }

  async close(
    namespace: string,
    id: ConnectionT['id'],
    code?: number,
    reason?: string,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.close(code, reason);
  }

  async closeAll(
    namespace: string,
    code?: number,
    reason?: string,
  ): Promise<void> {
    await Promise.allSettled(
      [...(this.namespace(namespace).values() || [])].map((conn) =>
        conn.close(code, reason),
      ),
    );
  }

  async send<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.send<M>(message);
  }

  async sendJson<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.sendJson<M>(message);
  }

  async sendError<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.sendError<M>(
      message,
      code,
      reason,
    );
  }

  async sendThenClose<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.sendThenClose<M>(
      message,
      code,
      reason,
    );
  }

  async sendJsonThenClose<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.sendJsonThenClose<M>(
      message,
      code,
      reason,
    );
  }

  async sendErrorThenClose<M>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void> {
    (await this.getConnection(namespace, id))?.sendErrorThenClose<M>(
      message,
      code,
      reason,
    );
  }

  async broadcastMessage<M>(
    namespace: string,
    message: M,
    exceptions?: ConnectionT['id'][],
  ): Promise<void> {
    if (!exceptions || exceptions.length === 0) {
      return Promise.allSettled(
        [...(this.namespace(namespace).values() || [])].map((conn) =>
          conn.send<M>(message),
        ),
      ).then(() => {
        //
      });
    }

    await Promise.allSettled(
      [...(this.namespace(namespace).values() || [])]
        .filter((conn) => !exceptions.includes(conn.id))
        .map((conn) => conn.send<M>(message)),
    );
  }

  async broadcastJsonMessage<M>(
    namespace: string,
    message: M,
    exceptions?: ConnectionT['id'][],
  ): Promise<void> {
    if (!exceptions || exceptions.length === 0) {
      return Promise.allSettled(
        [...(this.namespace(namespace).values() || [])].map((conn) =>
          conn.sendJson<M>(message),
        ),
      ).then(() => {
        //
      });
    }

    await Promise.allSettled(
      [...(this.namespace(namespace).values() || [])]
        .filter((conn) => !exceptions.includes(conn.id))
        .map((conn) => conn.sendJson<M>(message)),
    );
  }

  async broadcastError<M>(
    namespace: string,
    message: M,
    code?: number,
    reason?: string,
    exceptions?: ConnectionT['id'][],
  ): Promise<void> {
    if (!exceptions || exceptions.length === 0) {
      return Promise.allSettled(
        [...(this.namespace(namespace).values() || [])].map((conn) =>
          conn.sendError<M>(message, code, reason),
        ),
      ).then(() => {
        //
      });
    }

    await Promise.allSettled(
      [...(this.namespace(namespace).values() || [])]
        .filter((conn) => !exceptions.includes(conn.id))
        .map((conn) => conn.sendError<M>(message, code, reason)),
    );
  }
}

export interface IConnectionsPool<
  ConnectionT extends Connection = Connection,
  MessageT extends JsonStringifiable = JsonStringifiable,
> {
  readonly connections: Map<string, Map<ConnectionT['id'], ConnectionT>>;

  namespace(namespace: string): Map<string, ConnectionT>;
  hasNamespace(namespace: string): boolean;

  newConnection(conn: ConnectionT): Promise<void>;
  removeConnection(
    conn: ConnectionT,
    onEmptyNamespace?: () => Promise<void>,
  ): Promise<void>;
  drainConnections(
    timeout: number,
    message?: string,
    code?: number,
  ): Promise<void>;
  getConnection(
    namespace: string,
    id: ConnectionT['id'],
  ): Promise<ConnectionT | undefined>;

  close(
    namespace: string,
    id: ConnectionT['id'],
    code?: number,
    reason?: string,
  ): Promise<void>;
  closeAll(namespace: string, code?: number, reason?: string): Promise<void>;

  send<M = MessageT>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
  ): Promise<void>;
  sendJson<M = MessageT>(
    namespace: string,
    id: ConnectionT['id'],
    message: M,
  ): Promise<void>;
  sendError<M = MessageT>(
    namepsace: string,
    id: ConnectionT['id'],
    message: M,
    code?: number,
    reason?: string,
  ): Promise<void>;

  broadcastMessage<M = MessageT>(
    namespace: string,
    message: M,
    exceptions?: ConnectionT['id'][],
  ): Promise<void>;
  broadcastJsonMessage<M = MessageT>(
    namespace: string,
    message: M,
    exceptions?: ConnectionT['id'][],
  ): Promise<void>;
  broadcastError<M = MessageT>(
    namespace: string,
    message: M,
    code?: number,
    reason?: string,
    exceptions?: ConnectionT['id'][],
  ): Promise<void>;
}
