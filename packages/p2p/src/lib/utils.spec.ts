import { generateSwarmKey } from './utils';

describe('utils', () => {
  it('generates swarm key', async () => {
    const swarmKey = generateSwarmKey();

    /**
     * The swarm key is a multi-line string with the following format:
     * /key/swarm/psk/1.0.0/
     * /base16/
     * b22123e777a6bc9fa3193cd713672022e2aeb5c6464298ffdf00f4ac496b58f5
     */
    const [def, base, key] = swarmKey.split('\n');
    expect(def).toContain('/key/swarm/psk');
    expect(base).toContain('/base16/');
    expect(key).toHaveLength(64);
  });
});
