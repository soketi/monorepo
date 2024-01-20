import { ab2str, chunkArray, waitGracefullyFor } from './utils';

describe('utils', () => {
  it('provides ab2str and works', () => {
    const string = 'This is a test string';
    const buffer = new TextEncoder().encode(string);

    expect(ab2str(buffer)).toEqual(string);
  });

  // eslint-disable-next-line no-async-promise-executor
  it('provides chunkArray and works', async () => new Promise<void>(async done => {
    const array = [1, 2, 3, 4, 5, 6, 7];
    let sequences = 0;

    await chunkArray(array, 3, async (chunks) => {
      if (JSON.stringify(chunks) === JSON.stringify([1, 2, 3])) {
        sequences++;
      }

      if (JSON.stringify(chunks) === JSON.stringify([4, 5, 6])) {
        sequences++;
      }

      if (JSON.stringify(chunks) === JSON.stringify([7])) {
        sequences++;
      }
    });

    expect(sequences).toEqual(3);
    done();
  }));

  it('provides waitGracefullyFor and works', () => new Promise<boolean>((done, fail) => {
    const promise = new Promise<boolean>(resolve => setTimeout(resolve, 500));
    waitGracefullyFor(() => promise, 50).then(() => {
      fail('Promise should not resolve');
    }).catch(() => {
      done(false);
    });
  }));
});
