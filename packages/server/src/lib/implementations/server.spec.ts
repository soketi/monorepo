import { prebuiltHeliaServer } from './helia-server';

let prebuiltServer: Awaited<ReturnType<typeof prebuiltHeliaServer>>|undefined;

afterEach(async () => {
  if (prebuiltServer) {
    await prebuiltServer.server.stop();
    await prebuiltServer.helia.stop();
    await new Promise(resolve => setTimeout(resolve, 5_000));
    expect(prebuiltServer.helia.libp2p.status).toBe('stopped');
  }

  prebuiltServer = undefined;
}, 10_000);

describe('server', () => {
  it('should work', async () => {
    prebuiltServer = await prebuiltHeliaServer();

    await prebuiltServer.helia.start();
    expect(prebuiltServer.helia.libp2p.status).toBe('started');
  }, 15_000);
});
