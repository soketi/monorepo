import { PusherConnection } from '../pusher-connection';

export interface PresenceMemberStaticData {
  user_id: number | string;
  user_info: Record<string, unknown>;
  socket_id?: string;
}

export class PresenceMember<
  ConnectionID extends PusherConnection['id'] = PusherConnection['id'],
> {
  constructor(
    public user_id: string | number,
    public user_info: Record<string, unknown>,
    public socket_id?: ConnectionID,
  ) {
    //
  }

  static fromObject(data: PresenceMemberStaticData): PresenceMember {
    return new PresenceMember(data.user_id, data.user_info, data.socket_id);
  }

  toObject(): PresenceMemberStaticData {
    return {
      user_id: this.user_id,
      user_info: this.user_info,
      socket_id: this.socket_id,
    };
  }
}
