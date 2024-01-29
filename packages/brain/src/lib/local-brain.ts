import { Brain, BrainRecord } from './brain';

export class LocalBrain<Value = unknown> extends Brain<Value> {
  memory = new Map<string, BrainRecord<Value>>();
  cleanupInterval: NodeJS.Timeout;

  constructor() {
    super();

    this.cleanupInterval = setInterval(() => {
      for (const [key, { ttlSeconds, setTime }] of [...this.memory]) {
        const currentTime = parseInt(
          (new Date().getTime() / 1000) as unknown as string,
        );

        if (ttlSeconds > 0 && setTime + ttlSeconds <= currentTime) {
          this.memory.delete(key);
        }
      }
    }, 1_000);
  }

  async get(key: string): Promise<Value | undefined> {
    return (await this.getWithMetadata(key))?.value;
  }

  async getWithMetadata(key: string): Promise<BrainRecord<Value> | undefined> {
    return this.memory.get(key);
  }

  async set(key: string, value: Value, ttlSeconds = -1): Promise<void> {
    this.memory.set(key, {
      value,
      ttlSeconds,
      setTime: parseInt((new Date().getTime() / 1000) as unknown as string),
    });
  }

  async has(key: string): Promise<boolean> {
    return Boolean(this.memory.get(key));
  }

  async delete(key: string): Promise<void> {
    this.memory.delete(key);
  }

  async startup(): Promise<void> {
    this.memory.clear();
  }

  override async cleanup(): Promise<void> {
    this.memory.clear();
    clearInterval(this.cleanupInterval);
  }
}
