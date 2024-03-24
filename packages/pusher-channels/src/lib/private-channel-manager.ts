import type { JoinResponse } from '.';
import type { PusherSubscribeToPrivate } from '../';
import { PublicChannelManager } from './public-channel-manager';
import { PusherConnection } from './pusher-connection';

export class PrivateChannelManager extends PublicChannelManager {
  override async join(
    conn: PusherConnection,
    channel: string,
    message: PusherSubscribeToPrivate,
  ): Promise<JoinResponse> {
    const signatureIsValid = await this.signatureIsValid(
      conn.id,
      message,
      message.data.auth,
    );

    if (!signatureIsValid) {
      return {
        conn,
        success: false,
        errorCode: 4009,
        errorMessage: 'The connection is unauthorized.',
        authError: true,
        type: 'AuthError',
      };
    }

    return await super.join(conn, channel, message);
  }

  async signatureIsValid(
    socketId: string,
    message: PusherSubscribeToPrivate,
    signatureToCheck: string,
  ): Promise<boolean> {
    const token = await this.app.createToken(
      this.getDataToSignForSignature(socketId, message),
    );

    return this.app.key + ':' + token === signatureToCheck;
  }

  getDataToSignForSignature(
    socketId: string,
    message: PusherSubscribeToPrivate,
  ): string {
    return `${socketId}:${message.data.channel}`;
  }
}
