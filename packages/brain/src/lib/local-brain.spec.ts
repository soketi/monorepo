import { LocalBrain } from './local-brain';

describe('brain', () => {
  it('works', async () => {
    const brain = new LocalBrain<string>();

    await brain.set('foo', 'bar');
    expect(await brain.has('foo')).toBe(true);
    expect(await brain.get('foo')).toEqual('bar');

    await brain.set('foo', 'baz');
    expect(await brain.has('foo')).toEqual(true);
    expect(await brain.get('foo')).toEqual('baz');

    await brain.delete('foo');
    expect(await brain.has('foo')).toEqual(false);
    expect(await brain.get('foo')).toEqual(undefined);
  });

  it('works with ttl', async () => {
    const brain = new LocalBrain<string>();

    await brain.set('foo', 'bar', 5);
    expect(await brain.has('foo')).toBe(true);
    expect(await brain.get('foo')).toEqual('bar');

    await new Promise((resolve) => setTimeout(resolve, 6_000));
    expect(await brain.has('foo')).toEqual(false);
    expect(await brain.get('foo')).toEqual(undefined);
  }, 10_000);
});
