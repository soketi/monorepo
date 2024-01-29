import { DefaultPayload, Gossiper } from './gossiper';

class MockedGossiper extends Gossiper {
  announcements: Parameters<Gossiper['announce']>[] = [];

  constructor() {
    super();
  }

  override announce(
    namespace: string,
    event: string,
    payload: DefaultPayload<string, Record<string, unknown>>,
  ): Promise<void> {
    this.announcements.push([namespace, event, payload]);
    return Promise.resolve();
  }
}

describe('gossiper', () => {
  it('should announce', async () => {
    const gossiper = new MockedGossiper();

    const passedArgs: Parameters<Gossiper['announce']> = [
      'radio:10ghz',
      'new-message',
      {
        planet: 'earth',
        sender: 'space-center:jfk',
        command: 'Play Despacito',
      },
    ];

    await gossiper.announce(...passedArgs);
    expect(gossiper.announcements).toHaveLength(1);

    const [namespace, event, payload] = gossiper.announcements[0];

    expect(namespace).toBe(passedArgs[0]);
    expect(event).toBe(passedArgs[1]);
    expect(payload).toEqual(passedArgs[2]);
  });

  it('subscribeToNamespace works', () =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise<void>(async (done) => {
      const gossiper = new MockedGossiper();

      await gossiper.subscribeToNamespace(
        'radio:10ghz',
        async ({ event, payload }) => {
          expect(event).toBe('new-message');
          expect(payload).toEqual({
            planet: 'earth',
            sender: 'space-center:jfk',
            command: 'Play Despacito',
          });
          done();
        },
      );

      const passedArgs: Parameters<Gossiper['announce']> = [
        'radio:10ghz',
        'new-message',
        {
          planet: 'earth',
          sender: 'space-center:jfk',
          command: 'Play Despacito',
        },
      ];

      await gossiper.announce(...passedArgs);
      expect(gossiper.announcements).toHaveLength(1);

      await gossiper.handleAnnouncement(passedArgs[0], {
        event: passedArgs[1],
        payload: passedArgs[2],
      });
    }));
});
