import { App } from '../app';
import { StaticAppsManager } from './static-apps-manager';

describe('static apps', () => {
  it('getById should work', async () => {
    const apps = new StaticAppsManager([
      await App.load(
        {
          id: 'id1',
          key: 'key1',
          secret: 'secret1',
        },
        {},
      ),
    ]);

    const app = await apps.getById('id1');
    const inexistentApp = await apps.getById('id2');

    expect(app).toBeDefined();
    expect(inexistentApp).toBeNull();

    expect(app?.id).toBe('id1');
    expect(app?.key).toBe('key1');
  });

  it('getByKey should work', async () => {
    const apps = new StaticAppsManager([
      await App.load(
        {
          id: 'id1',
          key: 'key1',
          secret: 'secret1',
        },
        {},
      ),
    ]);

    const app = await apps.getByKey('key1');
    const inexistentApp = await apps.getByKey('key2');

    expect(app).toBeDefined();
    expect(inexistentApp).toBeNull();

    expect(app?.id).toBe('id1');
    expect(app?.key).toBe('key1');
  });

  it('initializeApp should work', async () => {
    const app = await App.load(
      {
        id: 'id1',
        key: 'key1',
        secret: 'secret1',
      },
      {},
    );

    const apps = new StaticAppsManager([app]);

    const appFromInit = await apps.initializeApp(app.toObject());

    expect(appFromInit).toBeDefined();
    expect(appFromInit?.id).toBe('id1');
    expect(appFromInit?.key).toBe('key1');
  });
});
