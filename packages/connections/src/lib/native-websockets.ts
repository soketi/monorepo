export interface NativeConnectionHandlers<M = unknown> {
  close: (code?: number, reason?: string) => Promise<void>;
  send: <Message = M>(message: Message) => Promise<void>;
}

export interface NativeWebsocket {
  send?(...args: unknown[]): void;
  close?(code?: number, reason?: string): void;
}
