import { createLibp2p, Libp2p, type Libp2pOptions } from 'libp2p';
import { createHelia } from 'helia';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';

import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { bitswap, trustlessGateway } from '@helia/block-brokers';

import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { Identify, identify } from '@libp2p/identify';
import { mplex } from '@libp2p/mplex';
import { mdns } from '@libp2p/mdns';
import { autoNAT } from '@libp2p/autonat';
import { dcutr } from '@libp2p/dcutr';
import { KadDHT, kadDHT } from '@libp2p/kad-dht';
import {
  circuitRelayTransport,
  circuitRelayServer,
  CircuitRelayService,
} from '@libp2p/circuit-relay-v2';
import { prometheusMetrics } from '@libp2p/prometheus-metrics';
import { Perf, perf } from '@libp2p/perf';
import { preSharedKey } from '@libp2p/pnet';

import { noise } from '@chainsafe/libp2p-noise';
import { gossipsub, GossipsubEvents } from '@chainsafe/libp2p-gossipsub';
import { PubSub } from '@libp2p/interface';

export type HeliaOptions = Parameters<typeof createHelia>[0];

export interface HeliaServerOptions {
  listen?: NonNullable<Libp2pOptions['addresses']>['listen'];
  swarmKey?: string;
  maxConnectionsPerPeer?: number;
  trustlessGateways?: string[];
}

export const createHeliaServer: (options?: HeliaServerOptions) => ReturnType<
  typeof createHelia<
    Libp2p<{
      perf: Perf;
      identify: Identify;
      autoNAT: unknown;
      dcutr: unknown;
      circuitRelay: CircuitRelayService;
      dht: KadDHT;
      pubsub: PubSub<GossipsubEvents>;
    }>
  >
> = async (
  {
    listen,
    swarmKey,
    maxConnectionsPerPeer,
    trustlessGateways,
  }: HeliaServerOptions = {
    listen: ['/ip4/0.0.0.0/tcp/0', '/ip4/0.0.0.0/tcp/0/ws'],
    swarmKey: undefined,
    maxConnectionsPerPeer: 200,
    trustlessGateways: [],
  },
) =>
  createHelia({
    start: false,
    blockstore: new MemoryBlockstore(),
    datastore: new MemoryDatastore(),
    blockBrokers: [
      bitswap({
        statsEnabled: true,
      }),
      trustlessGateway({
        gateways: trustlessGateways,
      }),
    ],
    libp2p: await createLibp2p({
      start: false,
      nodeInfo: {
        name: '',
        version: '',
      },
      addresses: {
        listen: listen,
      },
      streamMuxers: [mplex()],
      connectionProtector: swarmKey
        ? preSharedKey({
            psk: uint8ArrayFromString(swarmKey as string, 'base16'),
            enabled: swarmKey !== undefined,
          })
        : undefined,
      transports: [
        tcp({
          inboundSocketInactivityTimeout: 3_600 * 24, // 1 day
          outboundSocketInactivityTimeout: 3_600 * 24, // 1 day
          socketCloseTimeout: 3 * 60_000, // 3 minutes
          maxConnections: maxConnectionsPerPeer,
        }),
        webSockets({
          //
        }),
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      peerDiscovery: [
        mdns({
          interval: 1 * 60_000, // 1 minute
        }),
      ],
      connectionEncryption: [noise()],
      connectionManager: {
        maxConnections: 100,
        minConnections: 1,
        autoDialConcurrency: 1,
      },
      transportManager: {
        faultTolerance: 0,
      },
      metrics: prometheusMetrics({
        collectDefaultMetrics: true,
      }),
      services: {
        perf: perf(),
        identify: identify(),
        autoNAT: autoNAT(),
        dcutr: dcutr(),
        circuitRelay: circuitRelayServer({
          advertise: true,
        }),
        dht: kadDHT({
          allowQueryWithZeroPeers: true,
          querySelfInterval: 10_000,
          pingConcurrency: 10,
        }),
        pubsub: gossipsub({
          heartbeatInterval: 500,
          messageProcessingConcurrency: 100,
          canRelayMessage: true,
          maxInboundStreams: 100,
          maxOutboundStreams: 100,
          allowPublishToZeroPeers: true,
          ignoreDuplicatePublishError: true,
          emitSelf: false,
          asyncValidation: false,
          Dhi: 6,
          Dlo: 1,
          D: 3,
          seenTTL: 3e3,
          doPX: true,
          scoreParams: {
            behaviourPenaltyWeight: 0,
            retainScore: 1,
          },
        }),
      },
    }),
  });
