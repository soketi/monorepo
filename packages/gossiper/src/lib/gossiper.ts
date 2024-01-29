import { Connection } from '@soketi/connections';

export type DefaultPayload<
  ConnectionID extends Connection['id'] = Connection['id'],
  T = Record<string, unknown>,
> = {
  connectionId?: ConnectionID;
  message?: string;
} & T;

export abstract class Gossiper<
  ConnectionID extends Connection['id'] = Connection['id'],
  AnnouncementPayload extends DefaultPayload<ConnectionID> = DefaultPayload<ConnectionID>,
> implements IGossiper<ConnectionID, AnnouncementPayload>
{
  announcementHandlers = new Map<
    string,
    GossipTopicHandler<Announcement<AnnouncementPayload>>
  >();

  async peers(): Promise<Record<string, unknown>> {
    return {
      //
    };
  }

  abstract announce(
    namespace: string,
    event: string,
    payload: AnnouncementPayload,
  ): Promise<void>;

  async handleAnnouncement(
    namespace: string,
    data: Announcement<AnnouncementPayload>,
  ): Promise<void> {
    const handler = this.announcementHandlers.get(namespace);

    if (!handler || !handler.handler) {
      return;
    }

    await handler.handler(data);
  }

  async subscribeToNamespace(
    namespace: string,
    handler?: (data: Announcement<AnnouncementPayload>) => Promise<void>,
  ): Promise<void> {
    this.announcementHandlers.set(`${namespace}`, {
      namespace,
      handler,
    });
  }

  async unsubscribeFromNamespace(namespace: string): Promise<void> {
    this.announcementHandlers.delete(`${namespace}`);
  }

  async announceNewConnection(
    namespace: string,
    connectionId: ConnectionID,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void> {
    this.announce(namespace, 'connection:new', {
      connectionId,
      ...((payload || {}) as AnnouncementPayload),
    });
  }

  async announceEviction(
    namespace: string,
    connectionId: ConnectionID,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void> {
    this.announce(namespace, 'connection:eviction', {
      connectionId,
      ...((payload || {}) as AnnouncementPayload),
    });
  }

  announceNewMessage(
    namespace: string,
    connectionId: ConnectionID,
    message: unknown,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void> {
    return this.announce(namespace, 'message:incoming', {
      connectionId,
      message,
      ...((payload || {}) as AnnouncementPayload),
    });
  }

  async startup(): Promise<void> {
    //
  }

  async cleanup(): Promise<void> {
    //
  }
}

export interface GossipTopicHandler<Announcement> {
  namespace: string;
  handler?: (data: Announcement) => Promise<unknown>;
}

export interface Announcement<AnnouncementPayload = Record<string, unknown>> {
  event: string;
  payload?: AnnouncementPayload;
}

export interface IGossiper<
  ConnectionID extends Connection['id'] = Connection['id'],
  AnnouncementPayload = Record<string, unknown>,
> {
  peers(): Promise<Record<string, unknown>>;

  subscribeToNamespace(
    namespace: string,
    handler?: (data: Announcement<AnnouncementPayload>) => Promise<void>,
  ): Promise<void>;

  unsubscribeFromNamespace(namespace: string): Promise<void>;

  announce(
    namespace: string,
    event: string,
    payload: AnnouncementPayload,
  ): Promise<void>;

  announceNewConnection(
    namespace: string,
    connectionId: ConnectionID,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void>;

  announceEviction(
    namespace: string,
    connectionId: ConnectionID,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void>;

  announceNewMessage(
    namespace: string,
    connectionId: ConnectionID,
    message: unknown,
    payload?: Partial<AnnouncementPayload>,
  ): Promise<void>;

  startup(): Promise<void>;
  cleanup(): Promise<void>;
}
