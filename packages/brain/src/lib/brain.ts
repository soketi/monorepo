export interface IBrain<Value = unknown> {
  get(key: string): Promise<Value | undefined>;
  getWithMetadata(key: string): Promise<BrainRecord<Value> | undefined>;
  set(key: string, value: Value, ttlSeconds?: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  startup(): Promise<void>;
  cleanup(): Promise<void>;
}

export interface BrainRecord<Value = unknown> {
  value: Value;
  ttlSeconds: number;
  setTime: number;
}

export abstract class Brain<Value = unknown> implements IBrain<Value> {
  abstract get(key: string): Promise<Value | undefined>;
  abstract getWithMetadata(
    key: string,
  ): Promise<BrainRecord<Value> | undefined>;
  abstract set(key: string, value: Value, ttlSeconds?: number): Promise<void>;
  abstract has(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<void>;
  abstract startup(): Promise<void>;

  async cleanup(): Promise<void> {
    //
  }
}
