export type PusherUserID = string;

export interface PusherUserT<UID extends PusherUserID = PusherUserID> {
  id: UID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class PusherUser<UID extends PusherUserID = PusherUserID>
  implements PusherUserT<UID>
{
  public id!: UID;

  constructor(id: UID) {
    this.id = id;
  }

  // TODO: Impl
  static fromPresenceMember() {
    //
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromLiteral(data: string) {
    //
  }
}
