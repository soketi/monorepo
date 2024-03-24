export * from './lib/public-channel-manager';
export * from './lib/private-channel-manager';
export * from './lib/presence-channel-manager';
export * from './lib/encrypted-private-channel-manager';
export * from './lib/presence';
export * from './lib/pusher-connection';

export type AnyPusherEvent = PusherEvent<unknown, unknown, unknown>;

export type AnyPusherSubscriptionEvent =
  | PusherSubscribeToPublic
  | PusherSubscribeToPrivate
  | PusherSubscribeToPresence;

export type AnyPusherSubscriptionResponse =
  | PusherSubscriptionSucceeded
  | PusherSubscriptionError;

export type AnyPusherEventFromBroadcast = PusherClientEvent | PusherHttpEvent;

export type AnyPusherEventFromServer =
  | PusherPong
  | PusherConnectionEstablished
  | AnyPusherSubscriptionResponse
  | PusherMemberRemoved
  | PusherMemberAdded
  | PusherError
  | PusherCacheMiss
  | PusherSubscriptionCount
  | PusherSigninSuccess
  | AnyPusherEventFromBroadcast;

export type AnyPusherBroadcastableEvent =
  | PusherMemberAdded
  | PusherMemberRemoved
  | AnyPusherEventFromBroadcast
  | PusherSubscriptionCount;

export type AnyPusherEventFromConnection =
  | PusherPing
  | AnyPusherSubscriptionEvent
  | PusherUnsubscribe
  | PusherSignin
  | PusherClientEvent;

export type AnyPusherPingPong = PusherPing | PusherPong;

export type PusherEvent<
  Data,
  Key = string,
  Extra = Partial<Record<string, unknown>>,
> = {
  event: Key;
  data: Data;
} & Extra;

export type PusherPing = PusherEvent<string, 'pusher:ping'>;
export type PusherPong = PusherEvent<string, 'pusher:pong'>;

export type PusherConnectionEstablished = PusherEvent<
  string,
  'pusher:connection_established'
>;

export type PusherSubscribeToPublic = PusherEvent<
  {
    channel: string;
  },
  'pusher:subscribe'
>;

export type PusherSubscribeToPrivate = PusherEvent<
  {
    auth: string;
    channel: string;
    shared_secret?: string;
  },
  'pusher:subscribe'
>;

export type PusherSubscribeToPresence = PusherEvent<
  {
    auth: string;
    channel_data: string;
    channel: string;
  },
  'pusher:subscribe'
>;

export type PusherSubscriptionSucceeded = PusherEvent<
  string,
  'pusher_internal:subscription_succeeded',
  { channel: string }
>;

export type PusherSubscriptionError = PusherEvent<
  {
    type: string;
    error: string;
    status: number;
  },
  'pusher:subscription_error',
  { channel: string }
>;

export type PusherMemberRemoved = PusherEvent<
  string,
  'pusher_internal:member_removed',
  { channel: string }
>;

export type PusherMemberAdded = PusherEvent<
  string,
  'pusher_internal:member_added',
  { channel: string }
>;

export type PusherUnsubscribe = PusherEvent<
  {
    channel: string;
  },
  'pusher:unsubscribe'
>;

export type PusherSignin = PusherEvent<
  {
    auth: string;
    user_data: string;
  },
  'pusher:signin'
>;

export type PusherSigninSuccess = PusherEvent<
  {
    user_data: string;
  },
  'pusher:signin_success'
>;

export type PusherError = PusherEvent<
  {
    message: string;
    code: number;
  },
  'pusher:error'
>;

export type PusherCacheMiss = PusherEvent<
  {
    //
  },
  'pusher:cache_miss'
>;

export type PusherSubscriptionCount = PusherEvent<
  {
    subscription_count: number;
  },
  'pusher:subscription_count',
  { channel: string }
>;

export type PusherClientEvent = PusherEvent<
  Record<string, unknown>,
  string,
  { channel: string }
>;

export type PusherHttpEvent = PusherEvent<
  string,
  string,
  {
    channel: string;
    socket_id?: string;
  }
>;
