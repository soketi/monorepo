import crypto from 'crypto';

const clientEventPatterns: string[] = ['client-*'];

const privateChannelPatterns: string[] = ['private-*', 'private-encrypted-*'];

const cachingChannelPatterns: string[] = [
  'cache-*',
  'private-cache-*',
  'private-encrypted-cache-*',
  'presence-cache-*',
];

export const matchesPattern = async (
  pattern: string,
  string: string,
): Promise<boolean> => {
  return new RegExp(pattern.replace('*', '.*')).test(string);
};

export const dataToBytes = async (...data: unknown[]): Promise<number> => {
  let totalBytes = 0;

  for await (let element of data) {
    element = typeof element === 'string' ? element : JSON.stringify(element);

    try {
      totalBytes += new TextEncoder().encode(element as string).byteLength;
    } catch (e) {
      console.log(e);
    }
  }

  return totalBytes;
};

export const dataToKilobytes = async (...data: unknown[]): Promise<number> => {
  return (await dataToBytes(...data)) / 1024;
};

export const dataToMegabytes = async (...data: unknown[]): Promise<number> => {
  return dataToKilobytes(...data).then((x) => x / 1024);
};

export const isPrivateChannel = async (channel: string): Promise<boolean> => {
  let isPrivate = false;

  for await (const pattern of privateChannelPatterns) {
    if (await matchesPattern(pattern, channel)) {
      isPrivate = true;
      break;
    }
  }

  return isPrivate;
};

export const isPresenceChannel = async (channel: string): Promise<boolean> =>
  channel.lastIndexOf('presence-', 0) === 0;

export const isEncryptedPrivateChannel = async (
  channel: string,
): Promise<boolean> => channel.lastIndexOf('private-encrypted-', 0) === 0;

export const isCachingChannel = async (channel: string): Promise<boolean> => {
  let isCachingChannel = false;

  for await (const pattern of cachingChannelPatterns) {
    if (await matchesPattern(pattern, channel)) {
      isCachingChannel = true;
      break;
    }
  }

  return isCachingChannel;
};

export const isClientEvent = async (event: string): Promise<boolean> => {
  let isClientEvent = false;

  for await (const pattern of clientEventPatterns) {
    if (await matchesPattern(pattern, event)) {
      isClientEvent = true;
      break;
    }
  }

  return isClientEvent;
};

export const generateSocketId = <T extends string = string>(): T => {
  const min = 0;
  const max = 10_000_000_000;
  const randomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  return `${randomNumber(min, max)}.${randomNumber(min, max)}` as T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toOrderedArray = (map: Record<string, any>): string[] => {
  return Object.keys(map)
    .map((key) => {
      return [key, map[key]];
    })
    .sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      }

      if (a[0] > b[0]) {
        return 1;
      }

      return 0;
    })
    .map((pair) => {
      return pair[0] + '=' + pair[1];
    });
};

export const getMD5 = (body: string): string =>
  crypto.createHash('md5').update(body, 'utf8').digest('hex');

export class PusherToken {
  constructor(protected key: string, protected secret: string) {
    //
  }

  sign(string: string) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(Buffer.from(string))
      .digest('hex');
  }

  verify(string: string, signature: string) {
    return this.secureCompare(this.sign(string), signature);
  }

  secureCompare(a: string, b: string) {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;

    for (const i in [...a]) {
      result |=
        a.charCodeAt(i as unknown as number) ^
        b.charCodeAt(i as unknown as number);
    }

    return result === 0;
  }
}
