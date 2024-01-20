/* eslint-disable @typescript-eslint/no-explicit-any */

export type Handler<Args extends any[] = any[], ReturnT = any> = (
  ...args: Args
) => ReturnT | Promise<ReturnT>;

export class GenericRouter<H extends Handler = Handler> {
  constructor(
    protected handlers: Record<string, any> = {},
  ) {
    //
  }

  registerHandler<Handler extends H = H>(name: string, handler: Handler): void {
    this.handlers[name] = handler;
  }

  async handle<Handler extends H = H>(
    name: string,
    ...args: Parameters<Handler>
  ): Promise<ReturnType<Handler>|undefined> {
    const handler = this.handlers[name];

    if (!handler) {
      return undefined;
    }

    return handler(...args);
  }
}
