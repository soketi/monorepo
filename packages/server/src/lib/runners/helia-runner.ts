import { startPrebuiltServer } from '../implementations/helia-server';

;(async () => {
  // Just use the prebuilt server for now.
  const { helia } = await startPrebuiltServer();

  // Start the server.
  helia.start();
})();
