import { generateKey } from '@libp2p/pnet';

export const generateSwarmKey = () => {
  const swarmKey = new Uint8Array(95);
  generateKey(swarmKey);
  return Buffer.from(swarmKey).toString('utf8');
};
