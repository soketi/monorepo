import type { AnyPusherEvent, PresenceMember } from '../';
import { PusherUser } from './presence/pusher-user';
import { Connection, RemoteConnection } from '@soketi/connections';

export class PusherConnection<
  ID extends Connection['id'] = Connection['id'],
  Message = AnyPusherEvent,
> extends Connection<ID, Message> {
  readonly subscribedChannels = new Set<string>();
  readonly presence = new Map<string, PresenceMember<ID>>();

  userAuthenticationTimeout?: NodeJS.Timeout;
  user!: PusherUser<string>;

  async clearUserAuthenticationTimeout(): Promise<void> {
    if (this.userAuthenticationTimeout) {
      clearTimeout(this.userAuthenticationTimeout);
    }
  }

  override async close(code?: number, reason?: string): Promise<void> {
    this.clearUserAuthenticationTimeout();
    super.close(code, reason);
  }

  async handlePong(): Promise<void> {
    this.sendJson({
      event: 'pusher:pong',
      data: {},
    } as Message);
  }

  override toRemote(remoteInstanceId?: ID): PusherRemoteConnection<ID> {
    return {
      ...super.toRemote(remoteInstanceId),
      user: this.user,
      subscribedChannels: [...this.subscribedChannels],
      presence: [...this.presence].map(([channel, member]) => ({
        channel,
        member: member.toObject(),
      })),
    };
  }
}

export type PusherRemoteConnection<
  ID extends Connection['id'] = Connection['id'],
> = {
  subscribedChannels: string[];
  user: PusherUser<string>;
  presence: {
    channel: string;
    member: ReturnType<PresenceMember['toObject']>;
  }[];
} & RemoteConnection<ID>;
