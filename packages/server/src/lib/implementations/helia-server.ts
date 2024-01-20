import { IpfsGossiper } from '@soketi/gossiper';
import { ConnectionsPool } from '@soketi/connections';
import { LocalBrain } from '@soketi/brain';
import { createHeliaServer } from '@soketi/p2p';

import { MicroWebsocketServer } from './micro-websockets-server';

export const startPrebuiltServer = async () => {
  const helia = await createHeliaServer();

  const connections = new ConnectionsPool();
  const brain = new LocalBrain();
  const gossiper = new IpfsGossiper(helia);

  const server = new MicroWebsocketServer(
    brain,
    gossiper,
    connections,
  );

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

  return {
    server,
    helia,
    gossiper,
    brain,
    connections,
  };
};
