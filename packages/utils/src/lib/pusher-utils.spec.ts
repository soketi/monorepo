import {
  dataToBytes,
  dataToKilobytes,
  dataToMegabytes,
  generateSocketId,
  getMD5,
  isCachingChannel,
  isClientEvent,
  isEncryptedPrivateChannel,
  isPresenceChannel,
  isPrivateChannel,
  toOrderedArray,
  PusherToken,
} from './pusher-utils';
import crypto from 'crypto';

describe('pusher utils', () => {
  it('works with channel detection', async () => {
    const channel = 'room-1';
    const privateChannel = 'private-room-2';
    const encryptedPrivateChannel = 'private-encrypted-room-3';
    const presenceChannel = 'presence-room-4';
    const cachingChannel = 'private-cache-room-5';
    const clientEvent = 'client-event';

    expect(await isPrivateChannel(channel)).toBe(false);
    expect(await isPrivateChannel(privateChannel)).toBe(true);
    // expect(await isPrivateChannel(encryptedPrivateChannel)).toBe(false);
    expect(await isPrivateChannel(presenceChannel)).toBe(false);
    expect(await isPrivateChannel(cachingChannel)).toBe(true);
    expect(await isPrivateChannel(clientEvent)).toBe(false);

    expect(await isPresenceChannel(channel)).toBe(false);
    expect(await isPresenceChannel(privateChannel)).toBe(false);
    expect(await isPresenceChannel(encryptedPrivateChannel)).toBe(false);
    expect(await isPresenceChannel(presenceChannel)).toBe(true);
    expect(await isPresenceChannel(cachingChannel)).toBe(false);
    expect(await isPresenceChannel(clientEvent)).toBe(false);

    expect(await isEncryptedPrivateChannel(channel)).toBe(false);
    expect(await isEncryptedPrivateChannel(privateChannel)).toBe(false);
    expect(await isEncryptedPrivateChannel(encryptedPrivateChannel)).toBe(true);
    expect(await isEncryptedPrivateChannel(presenceChannel)).toBe(false);
    expect(await isEncryptedPrivateChannel(cachingChannel)).toBe(false);
    expect(await isEncryptedPrivateChannel(clientEvent)).toBe(false);

    expect(await isCachingChannel(channel)).toBe(false);
    expect(await isCachingChannel(privateChannel)).toBe(false);
    expect(await isCachingChannel(encryptedPrivateChannel)).toBe(false);
    expect(await isCachingChannel(presenceChannel)).toBe(false);
    expect(await isCachingChannel(cachingChannel)).toBe(true);
    expect(await isCachingChannel(clientEvent)).toBe(false);

    expect(await isClientEvent(channel)).toBe(false);
    expect(await isClientEvent(privateChannel)).toBe(false);
    expect(await isClientEvent(encryptedPrivateChannel)).toBe(false);
    expect(await isClientEvent(presenceChannel)).toBe(false);
    expect(await isClientEvent(cachingChannel)).toBe(false);
    expect(await isClientEvent(clientEvent)).toBe(true);
  });

  it('works with data to bytes', async () => {
    expect(await dataToBytes('test')).toBe(4);
    expect(await dataToBytes({ test: 'test' })).toBe(15);
    expect(await dataToBytes([1, 2, 3, 4])).toBe(9);
  });

  it('works with data to kilobytes', async () => {
    expect(await dataToKilobytes('test')).toBe(0.00390625);
    expect(await dataToKilobytes({ test: 'test' })).toBe(0.0146484375);
    expect(await dataToKilobytes([1, 2, 3, 4])).toBe(0.0087890625);
  });

  it('works with data to megabytes', async () => {
    expect(await dataToMegabytes('test')).toBe(3.814697265625e-6);
    expect(await dataToMegabytes({ test: 'test' })).toBe(
      0.00001430511474609375,
    );
    expect(await dataToMegabytes([1, 2, 3, 4])).toBe(0.00000858306884765625);
  });

  it('works with generate socket id', () => {
    expect(generateSocketId()).toMatch(/(\d+)\.(\d+)/);
  });

  it('works with get md5', () => {
    expect(getMD5('test')).toBe('098f6bcd4621d373cade4e832627b4f6');
  });

  it('works with to ordered array', () => {
    expect(toOrderedArray({ a: 1, b: 2, c: 3 })).toEqual(['a=1', 'b=2', 'c=3']);
    expect(toOrderedArray({ a: 1, c: 3, b: 2 })).toEqual(['a=1', 'b=2', 'c=3']);
    expect(toOrderedArray({ c: 3, a: 1, b: 2 })).toEqual(['a=1', 'b=2', 'c=3']);
  });

  it('pusher token should work', () => {
    const token = new PusherToken('key', 'secret');
    const signature = token.sign('test');

    expect(signature).toBe(
      crypto
        .createHmac('sha256', 'secret')
        .update(Buffer.from('test'))
        .digest('hex'),
    );

    expect(token.verify(signature, 'test')).toBe(true);
  });
});
