/* eslint-disable @typescript-eslint/no-unused-vars */
import { Brain } from '@soketi/brain';
import { Connection, ConnectionsPool } from '@soketi/connections';
import { Gossiper } from '@soketi/gossiper';
import { Router, RouterType } from 'itty-router';
import { Runner } from './runners/runner';
import { Protocol } from './protocols/protocol';
import { JsonStringifiable } from '@soketi/utils';

export interface ServerOptions<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
  BrainT extends Brain = Brain,
  GossiperT extends Gossiper = Gossiper,
> {
  connections: ConnectionsPool<MessageT, ConnectionT>;
  brain: BrainT;
  gossiper: GossiperT;
  runner?: Runner;
  httpRouter?: RouterType;
  wsRouter?: RouterType;
  protocol?: Protocol;
  server?: {
    host: string;
    port: number;
  };
}

export interface IWebSocketServerHandler<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
  ErrorT = unknown,
> {
  onNewConnection?(conn: ConnectionT): Promise<void>;
  onConnectionClose?(conn: ConnectionT): Promise<void>;
  onMessage?(conn: ConnectionT, message: MessageT): Promise<void>;
  onError?(conn: ConnectionT, error: ErrorT): Promise<void>;
  onPing?(conn: ConnectionT, message: MessageT): Promise<void>;
  onPong?(conn: ConnectionT, message: MessageT): Promise<void>;
  createNewConnection?(conn: Connection): Promise<Connection | ConnectionT>;
}

export interface IServer<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
  BrainT extends Brain = Brain,
  GossiperT extends Gossiper = Gossiper,
> {
  readonly connections: ConnectionsPool<MessageT, ConnectionT>;
  readonly brain: BrainT;
  readonly gossiper: GossiperT;
  readonly httpRouter: RouterType;
  readonly wsRouter: RouterType;

  protocol: Protocol;
  runner: Runner;
}

export class Server<
  MessageT extends JsonStringifiable = JsonStringifiable,
  ConnectionT extends Connection = Connection,
  BrainT extends Brain = Brain,
  GossiperT extends Gossiper = Gossiper,
  StopOptions = unknown | undefined,
> implements IWebSocketServerHandler<MessageT, ConnectionT>
{
  public readonly connections: ConnectionsPool<MessageT, ConnectionT>;
  public readonly brain: BrainT;
  public readonly gossiper: GossiperT;

  public httpRouter: RouterType = Router();
  public wsRouter: RouterType = Router();
  public protocol?: Protocol;
  public runner?: Runner;

  constructor(
    public readonly options: ServerOptions<
      MessageT,
      ConnectionT,
      BrainT,
      GossiperT
    >,
  ) {
    this.connections = options.connections;
    this.brain = options.brain;
    this.gossiper = options.gossiper;
    this.httpRouter = options.httpRouter || Router();
    this.wsRouter = options.wsRouter || Router();
    this.runner = options.runner || undefined;
    this.protocol = options.protocol || undefined;
  }

  async start(signalHandler?: () => Promise<void>): Promise<void> {
    this.registerSignals(signalHandler);

    await this.brain.startup();
    await this.gossiper.startup();

    await this.protocol?.startup();
    await this.runner?.startup();

    this.httpRouter.all('*', async () => {
      return new Response('Not found.', { status: 404 });
    });
  }

  async stop(options?: StopOptions): Promise<void> {
    // TODO: Let other nodes know we are draining...
    console.log('Draining connections...');
    await this.drainConnections();

    console.log('Cleaning up...');
    await this.cleanup();

    console.log('Closing server...');
    await this.closeServer();

    console.log('Done.');
  }

  async closeServer(): Promise<void> {
    // After connections got drained and cleaned up, we handled the server shutdown.
  }

  async onRequest(request: Request): Promise<Response> {
    return this.httpRouter.handle(request);
  }

  async onNewConnection(conn: ConnectionT): Promise<void> {
    await this.protocol?.onNewConnection(conn);
  }

  async onConnectionClose(conn: ConnectionT): Promise<void> {
    await this.protocol?.onConnectionClose(conn);
  }

  async onMessage(conn: ConnectionT, message: MessageT): Promise<void> {
    await this.protocol?.onMessage(conn, message);
  }

  async onError(conn: ConnectionT, error: unknown): Promise<void> {
    await this.protocol?.onError(conn, error);
  }

  async onPing(conn: ConnectionT, message: MessageT): Promise<void> {
    await this.protocol?.onPing(conn, message);
  }

  async onPong(conn: ConnectionT, message: MessageT): Promise<void> {
    await this.protocol?.onPong(conn, message);
  }

  async onUpgrade(request: Request): Promise<Response> {
    return new Response();
  }

  async createNewConnection(
    conn: Connection,
  ): Promise<Connection | ConnectionT> {
    return this.protocol?.createNewConnection(conn) || conn;
  }

  async drainConnections(): Promise<void> {
    await this.connections.drainConnections(100e3, 'Server closed.');
  }

  async cleanup(): Promise<void> {
    await this.runner?.cleanup();
    await this.protocol?.cleanup();

    await this.gossiper.cleanup();
    await this.brain.cleanup();
  }

  async setProtocol(protocol: Protocol) {
    this.protocol = protocol;
  }

  async setRunner(runner: Runner) {
    this.runner = runner;
  }

  registerSignals(handler?: () => Promise<void>) {
    process.on('SIGINT', async () => {
      if (handler) {
        return await handler();
      }

      await this.stop();
    });

    process.on('SIGTERM', async () => {
      if (handler) {
        return await handler();
      }

      await this.stop();
    });

    process.on('uncaughtException', async (error) => {
      console.error(`Uncaught exception: ${error}`);

      if (handler) {
        return await handler();
      }

      await this.stop();
    });
  }
}
