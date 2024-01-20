import { prebuiltHeliaServer } from '../implementations/helia-server';

;(async () => {
  // Just use the prebuilt server for now.
  const { helia } = await prebuiltHeliaServer();

  // Start the server.
  helia.start();
})();
