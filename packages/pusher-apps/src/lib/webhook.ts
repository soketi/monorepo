export interface WebhookInterface {
  url?: string;
  headers?: Record<string, unknown>;
  lambda_function?: string;
  event_types: string[];
  filter?: {
    channel_name_starts_with?: string;
    channel_name_ends_with?: string;
  };
  lambda?: {
    async?: boolean;
    region?: string;
    client_options?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      credentials?: any;
      endpoint?: string;
      version?: string;
    };
  };
}

export interface PusherWebhookEvent {
  name: string;
  channel: string;
  event?: string;
  data?: string; // TODO: Was Record<string, any>, might influence tests
  socket_id?: string;
  user_id?: string;
  time_ms?: number;
}

export interface PusherWebhookData {
  time_ms: number;
  events: PusherWebhookEvent;
}

export interface PusherWebhookQueuedJob {
  appKey: string;
  appId: string;
  payload: PusherWebhookData;
  originalPusherSignature: string;
}
