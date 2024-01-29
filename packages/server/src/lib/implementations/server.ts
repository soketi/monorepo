import { Brain } from '@soketi/brain';
import { ConnectionsPool } from '@soketi/connections';
import { Gossiper } from '@soketi/gossiper';
import { GenericRouter, Handler, WebsocketsRouter } from '@soketi/routing';

export interface ServerOptions<
  ConnectionsPoolT extends ConnectionsPool = ConnectionsPool,
  BrainT extends Brain = Brain,
  GossiperT extends Gossiper = Gossiper,
  HttpHandler extends Handler = Handler,
> {
  connections: ConnectionsPoolT;
  brain: BrainT;
  gossiper: GossiperT;
  httpRouter?: GenericRouter<HttpHandler>;
}

export abstract class Server<
  ConnectionsPoolT extends ConnectionsPool = ConnectionsPool,
  BrainT extends Brain = Brain,
  GossiperT extends Gossiper = Gossiper,
  HttpHandler extends Handler = Handler,
  StopOptions = unknown | undefined,
> {
  public readonly connections: ConnectionsPoolT;
  public readonly brain: BrainT;
  public readonly gossiper: GossiperT;
  private readonly httpRouter: GenericRouter = new GenericRouter<HttpHandler>();
  private readonly wsRouter: WebsocketsRouter = new WebsocketsRouter();

  // TODO: Implement Router.
  constructor(
    options: ServerOptions<ConnectionsPoolT, BrainT, GossiperT, HttpHandler>,
  ) {
    this.connections = options.connections;
    this.brain = options.brain;
    this.gossiper = options.gossiper;
    this.httpRouter = options.httpRouter || new GenericRouter<HttpHandler>();
  }

  async start(signalHandler?: () => Promise<void>): Promise<void> {
    this.registerSignals(signalHandler);

    await this.brain.startup();
    await this.gossiper.startup();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async drainConnections(): Promise<void> {
    await this.connections.drainConnections(100e3, 'Server closed.');
  }

  async cleanup(): Promise<void> {
    await this.gossiper.cleanup();
    await this.brain.cleanup();
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
