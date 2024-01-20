import { GenericRouter } from './generic-router';

describe('routing', () => {
  it('works', async () => {
    const router = new GenericRouter();

    router.registerHandler('foo', async () => {
      return 'foo';
    });

    router.registerHandler('bar', async () => {
      return 'bar';
    });

    expect(await router.handle('foo')).toEqual('foo');
    expect(await router.handle('bar')).toEqual('bar');
    expect(await router.handle('baz')).toEqual(undefined);
  });

  it('works with arguments', async () => {
    const router = new GenericRouter();

    router.registerHandler('foo', async (a: number, b: number) => {
      return a + b;
    });

    router.registerHandler('bar', async (a: number, b: number) => {
      return a - b;
    });

    expect(await router.handle('foo', 1, 2)).toEqual(3);
    expect(await router.handle('bar', 1, 2)).toEqual(-1);
    expect(await router.handle('baz', 1, 2)).toEqual(undefined);
  });

  it('works with async handlers', async () => {
    const router = new GenericRouter();

    router.registerHandler('foo', async () => {
      return 'foo';
    });

    router.registerHandler('bar', async () => {
      return 'bar';
    });

    expect(await router.handle('foo')).toEqual('foo');
    expect(await router.handle('bar')).toEqual('bar');
    expect(await router.handle('baz')).toEqual(undefined);
  });

  it('works with async handlers with arguments', async () => {
    const router = new GenericRouter();

    router.registerHandler('foo', async (a: number, b: number) => {
      return a + b;
    });

    router.registerHandler('bar', async (a: number, b: number) => {
      return a - b;
    });

    expect(await router.handle('foo', 1, 2)).toEqual(3);
    expect(await router.handle('bar', 1, 2)).toEqual(-1);
    expect(await router.handle('baz', 1, 2)).toEqual(undefined);
  });
});
