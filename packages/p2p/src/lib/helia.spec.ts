import { createHeliaServer } from './helia';

describe('helia', () => {
  it('is defined', async () => {
    const helia = await createHeliaServer();
    expect(helia).toBeDefined();
  });
});
