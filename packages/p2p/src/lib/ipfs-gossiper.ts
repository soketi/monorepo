import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { Peer } from '@libp2p/interface/src/peer-store';

import { Announcement, Gossiper, type DefaultPayload } from '@soketi/gossiper';
import { Connection } from '@soketi/connections';
import { createHeliaServer } from './helia';

export class IpfsGossiper<
  ConnectionID extends Connection['id'] = Connection['id'],
  AnnouncementPayload extends DefaultPayload<ConnectionID> = DefaultPayload<ConnectionID>,
> extends Gossiper<ConnectionID, AnnouncementPayload> {
  constructor(protected readonly node: Awaited<ReturnType<typeof createHeliaServer>>) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async peers(): Promise<Record<string, any>> {
    const peerToObject = (peer: Peer) => ({
      id: peer.id.toString(),
      addrs: peer.addresses.map(addr => addr.multiaddr),
      metadata: [...peer.metadata].map(([key, value]) => ({
        key,
        value: uint8ArrayToString(value),
      })),
      protocols: peer.protocols,
      tags: [...peer.tags].map(([key, value]) => ({
        key,
        value: value.value,
      })),
    });

    return {
      me: this.node.libp2p.peerId.toString(),
      peerStore: (await this.node.libp2p.peerStore.all()).map(peer => peerToObject(peer)),
      connections: this.node.libp2p.getConnections().map(conn => ({
        id: conn.id,
        remotePeer: conn.remotePeer.toString(),
        remoteAddr: conn.remoteAddr.toString(),
        status: conn.status,
        tags: conn.tags,
        transient: conn.transient,
        timeline: conn.timeline,
        multiplexer: conn.multiplexer,
        encryption: conn.encryption,
        direction: conn.direction,
        streams: conn.streams.map(stream => ({
          id: stream.id,
          direction: stream.direction,
          timeline: stream.timeline,
          protocol: stream.protocol,
          metadata: stream.metadata,
          status: stream.status,
          readStatus: stream.readStatus,
          writeStatus: stream.writeStatus,
        })),
      })),
      pubsub: {
        peers: this.node.libp2p.services.pubsub.getPeers(),
        topics: this.node.libp2p.services.pubsub.getTopics(),
      },
    };
  }

  async announce(
    namespace: string,
    event: string,
    payload: AnnouncementPayload,
  ): Promise<void> {
    this.node.libp2p.services.pubsub.publish(
      `${namespace}`,
      new TextEncoder().encode(JSON.stringify({ event, payload })),
    );
  }

  override async subscribeToNamespace(
    namespace: string,
    handler: (data: Announcement<AnnouncementPayload>) => Promise<void>,
  ): Promise<void> {
    super.subscribeToNamespace(namespace, handler);
    this.node.libp2p.services.pubsub.subscribe(`${namespace}`);
  }

  override async unsubscribeFromNamespace(
    namespace: string,
  ): Promise<void> {
    super.unsubscribeFromNamespace(namespace);
    this.node.libp2p.services.pubsub.unsubscribe(`${namespace}`);
  }

  override async startup(): Promise<void> {
    await super.startup();

    this.node.libp2p.services.pubsub.addEventListener(
      'message',
      async ({ detail }) => {
        console.log(`received: ${new TextDecoder().decode(detail.data)} on ns ${detail.topic}`);

        await this.handleAnnouncement(
          detail.topic,
          JSON.parse(new TextDecoder().decode(detail.data)),
        );
      },
    );
  }
}
