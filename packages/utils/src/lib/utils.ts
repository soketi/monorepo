export const chunkArray = async <Item = unknown>(
  array: Item[],
  chunkSize: number,
  callback: (chunks: Item[]) => Promise<void>,
): Promise<void> => {
  Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    async (_, index) => await callback(array.slice(index * chunkSize, (index + 1) * chunkSize)),
  );
};

export const ab2str = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString('utf-8');
}

export const waitGracefullyFor = async (
  callback: () => Promise<boolean>,
  interval = 1e3,
  maxRetries = 30,
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    let tries = 0;

    const i = setInterval(async () => {
      const callbackResponse = await callback();

      if (callbackResponse === true) {
        clearInterval(i);
        return resolve();
      }

      tries++;

      if (tries >= maxRetries) {
        clearInterval(i);
        return reject();
      }
    }, interval);
  });
}

export type JsonObject = { [key: string]: JsonValue; };
export type JsonArray = JsonValue[]|JsonObject[];
export type JsonValue = Date|RegExp|string|number|boolean|null|JsonObject|unknown;
export type JsonStringifiable = JsonObject|JsonObject[]|JsonArray|JsonArray[];
