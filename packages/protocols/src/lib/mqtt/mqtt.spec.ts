import { mqtt } from './mqtt';

describe('mqtt', () => {
  it('should work', () => {
    expect(mqtt()).toEqual('mqtt');
  });
});
