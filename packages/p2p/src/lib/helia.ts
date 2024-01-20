import { createLibp2p } from 'libp2p';
import { createHelia } from 'helia';

import { MemoryBlockstore } from 'blockstore-core';
import { MemoryDatastore } from 'datastore-core';
import { bitswap } from '@helia/block-brokers';

import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { identify } from '@libp2p/identify';
import { mplex } from '@libp2p/mplex';
import { mdns } from '@libp2p/mdns';
import { autoNAT } from '@libp2p/autonat';
import { dcutr } from '@libp2p/dcutr';
import { kadDHT } from '@libp2p/kad-dht';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { prometheusMetrics } from '@libp2p/prometheus-metrics';
import { perf } from '@libp2p/perf';
import { preSharedKey } from '@libp2p/pnet';

import { noise }  from '@chainsafe/libp2p-noise';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';


const heliaServer = async () => createHelia({
  start: false,
  blockstore: new MemoryBlockstore(),
  datastore: new MemoryDatastore(),
  blockBrokers: [
    bitswap({
      statsEnabled: true,
    }),
  ],
  libp2p: await createLibp2p({
    start: false,
    nodeInfo: {
      name: '',
      version: '',
    },
    addresses: {
      listen: process.env['SOKETI_P2P_ADDRESSES']?.split(',') || [
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/tcp/0/ws',
      ],
    },
    streamMuxers: [
      mplex(),
    ],
    connectionProtector: preSharedKey({
      psk: new TextEncoder().encode(process.env['SOKETI_SWARM_KEY']),
      enabled: process.env['SOKETI_SWARM_KEY'] !== undefined,
    }),
    transports: [
      tcp({
        inboundSocketInactivityTimeout: 3_600 * 24, // 1 day
        outboundSocketInactivityTimeout: 3_600 * 24, // 1 day
        socketCloseTimeout: 3 * 60_000, // 3 minutes
        maxConnections: 200,
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
    connectionEncryption: [
      noise(),
    ],
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

export const createHeliaServer = heliaServer;
