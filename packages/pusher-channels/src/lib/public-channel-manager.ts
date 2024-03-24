import type { JoinResponse, LeaveResponse } from './';
import type { PusherSubscribeToPublic } from '../';
import { App } from '@soketi/pusher-apps';
import { PusherConnectionsPool } from './pusher-connections-pool';
import { PusherConnection } from './pusher-connection';

export class PublicChannelManager {
  constructor(
    protected readonly connections: PusherConnectionsPool,
    protected readonly app: Required<App>,
  ) {
    //
  }

  async join(
    conn: PusherConnection,
    channel: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message?: PusherSubscribeToPublic,
  ): Promise<JoinResponse> {
    const connections = await this.connections.addToChannel(conn, channel);

    return {
      conn,
      success: true,
      channelConnections: connections,
    };
  }

  async leave(conn: PusherConnection, channel: string): Promise<LeaveResponse> {
    const remainingConnections = (await this.connections.removeFromChannels(
      conn,
      channel,
    )) as number;

    return {
      left: true,
      remainingConnections,
    };
  }
}
