import { CommandModule } from 'yargs';
import { MicroWebsocketsRunner, Server } from '@soketi/server';
import { createHeliaServer } from '@soketi/p2p';
import { ConnectionsPool } from '@soketi/connections';
import { IpfsGossiper } from '@soketi/gossiper';
import { LocalBrain } from '@soketi/brain';
import { AvailableProtocols, PusherProtocol } from '@soketi/server';
import { Router } from 'itty-router';

export interface StartOptions {
  enableProtocol: AvailableProtocols;
  serverHost: string;
  serverPort: number;
  wsRunner: 'uws';
  p2pRunner: 'helia';
  p2pSwarmKey: string;
  p2pMaxConnectionsPerPeer: number;
  p2pListenAddress: string[];
}

export type StartCommandModule = CommandModule<unknown, StartOptions>;

export const command: StartCommandModule['command'] = 'start';

export const describe: StartCommandModule['describe'] =
  'Start the server in IPFS mode.';

export const builder: CommandModule['builder'] = (cli) =>
  cli.options({
    'server-host': {
      describe: 'The host to bind the server to.',
      default: '0.0.0.0',
      group: 'Server',
    },
    'server-port': {
      describe: 'The port to bind the server to.',
      default: 7001,
      group: 'Server',
    },
    'ws-runner': {
      hidden: true,
      describe:
        'The runner to use for the Server. Currently, only uws is supported.',
      default: 'uws',
      choices: ['uws'],
      group: 'Server',
    },
    'p2p-runner': {
      hidden: true,
      describe:
        'The runner to use for the server. Currently, only helia is supported.',
      default: 'helia',
      choices: ['helia'],
      group: 'Peer-to-Peer',
    },
    'p2p-swarm-key': {
      alias: 'swarmk',
      describe: 'The swarm key to use for the server.',
      group: 'Peer-to-Peer',
    },
    'p2p-max-connections-per-peer': {
      default: 200,
      describe: 'The maximum number of connections per peer.',
      group: 'Peer-to-Peer',
    },
    'p2p-listen-address': {
      describe: 'The address to listen on for the server.',
      default: ['/ip4/0.0.0.0/tcp/0', '/ip4/0.0.0.0/tcp/0/ws'],
      group: 'Peer-to-Peer',
    },
    'enable-protocol': {
      describe: 'The protocol to enable for the server.',
      default: 'pusher',
      choices: ['pusher', 'ably', 'mqtt'],
      group: 'Server',
    },
  });

export const handler: StartCommandModule['handler'] = async ({
  enableProtocol,
  serverHost,
  serverPort,
  p2pSwarmKey,
  p2pMaxConnectionsPerPeer,
  p2pListenAddress,
  wsRunner,
}) => {
  const helia = await createHeliaServer({
    swarmKey: p2pSwarmKey,
    maxConnectionsPerPeer: p2pMaxConnectionsPerPeer,
    listen: p2pListenAddress,
  });

  const connections = new ConnectionsPool();
  const brain = new LocalBrain();
  const gossiper = new IpfsGossiper(helia);
  const httpRouter = Router();

  const server = new Server({
    connections,
    brain,
    gossiper,
    server: {
      host: serverHost,
      port: serverPort,
    },
    httpRouter,
  });

  if (wsRunner === 'uws') {
    await server.setRunner(new MicroWebsocketsRunner(server));
  }

  if (enableProtocol === 'pusher') {
    await server.setProtocol(new PusherProtocol(server));
  }

  helia.libp2p.addEventListener('start', async () => {
    // After libp2p starts, we need to start the server.
    // The inner handler stops helia in case of error.
    await server.start(async () => helia.stop());
  });

  helia.libp2p.addEventListener('stop', async () => {
    // Before stopping libp2p, we need to stop the server.
    await server.stop();
    await helia.stop();
  });

  await helia.start();
};

export default {
  command,
  describe,
  builder,
  handler,
};
