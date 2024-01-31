# soketipfs — Real-Time 🤝 Web3

[![Discord](https://img.shields.io/discord/957380329985958038?color=%235865F2&label=Discord&logo=discord&logoColor=%23fff)](https://discord.gg/VgfKCQydjb)
[![CI](https://github.com/soketi/monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/soketi/monorepo/actions/workflows/ci.yml)

soketipfs is a framework for building distributed applications using Websockets. It is built on top of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) and uses the IPFS networking protocol via [Helia](https://github.com/ipfs/helia).

## 🔀 Roadmap

```text
🧑‍💻 = currently in development
👉 = upcoming for development
⏳ = planned, but not yet scheduled
👀 = not sure, maybe in the future
```

- [ ] Deployment
  - [ ] 🧑‍💻 New Soketi CLI
  - [ ] 🧑‍💻 Docker
  - [ ] 👉 Kubernetes
  - [ ] 👉 Railway
- [ ] Protocols
  - [ ] 👉 Pusher Protocol
  - [ ] 👉 Ably Protocol
  - [ ] ⏳ MQTT Protocol
  - [ ] ⏳ PubNub Protocol
  - [ ] ⏳ SockJS Protocol
  - [ ] ⏳ Socket.IO / Engine.IO Protocol
  - [ ] 👀 AMQP Protocol
  - [ ] 👀 Centrifugo Protocol
  - [ ] 👀 STOMP Protocol
- [ ] Discovery Mechanisms
  - [ ] 🧑‍💻 IPFS
  - [ ] ⏳ Redis Pubsub
  - [ ] ⏳ NATS
- [ ] Databases
  - [ ] 👉 Redis Stack
  - [ ] 👉 SQL via Knex
  - [ ] 👀 MongoDB

## 🤝 Supporting

soketipfs is meant to be open source, forever and ever. It solves issues that many developers face - the one of wanting to be limitless while testing locally or performing benchmarks. More than that, itt is also suited for production usage, either it is public for your frontend applications or internal to your team.

The frequency of releases and maintenance is based on the available time, which is tight as hell. Recently, there were issues with the maintenance and this caused infrequent updates, as well as infrequent support.

To cover some of the expenses of handling new features or having to maintain the project, we would be more than happy if you can donate towards the goal. This will ensure that soketipfs will be taken care of at its full extent.

**[💰 Sponsor the development via Github Sponsors](https://github.com/sponsors/rennokki)**

## Features

### SRF (🌍 Scalable | ✨ Resilient | 🏎️ Fast)

soketipfs is built with the SRF principles in mind. It is designed to be scalable, resilient and fast by nature, leveraging the power of uWebSockets.js and the IPFS networking.

While IPFS is public, soketipfs is designed to be used in private networks, where you can control the nodes that are part of the network — you have a fully private and secure network for your real-time application. 🚀

The server is built on top of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) - a C application ported to Node.js. uWebSockets.js is demonstrated to perform at levels [_8.5x that of Fastify_](https://alexhultman.medium.com/serving-100k-requests-second-from-a-fanless-raspberry-pi-4-over-ethernet-fdd2c2e05a1e) and at least [_10x that of Socket.IO_](https://medium.com/swlh/100k-secure-websockets-with-raspberry-pi-4-1ba5d2127a23). ([_source_](https://github.com/uNetworking/uWebSockets.js))

### Cheaper 🤑

For a $49 plan on Pusher, you get a limited amount of connections (500) and messages (30M).

With soketipfs, for the price of an instance on Vultr or DigitalOcean ($5-$10), you get virtually unlimited connections, messages, and some more!

soketipfs is capable to hold thousands of active connections with high traffic on less than **1 GB and 1 CPU** in the cloud. You can also [get free $100 on Vultr to try out soketipfs →](https://www.vultr.com/?ref=9032189-8H)

### Pusher Protocol 📡

soketipfs implements the [Pusher Protocol v7](https://pusher.com/docs/channels/library\_auth\_reference/pusher-websockets-protocol#version-7-2017-11). Your existing projects that connect to Pusher requires minimal code change to make it work with soketipfs - you just add the host and port and swap the credentials.

## 🚀 Getting Started

Get started by using the new `soketi` CLI to start the server:

```bash
npx @soketi/cli ipfs start --port=7001
```

The CLI replaces the [soketi](https://github.com/soketi/soketi) project that has the built-in CLI for starting a server. To add backwards compatibility, you can use the `legacy` subcommand in `@soketi/cli`:

```bash
npx @soketi/cli legacy start --port=6001
```

If you wish to install the command as global, make sure to uninstall the old `soketi` package before installing the new one:

```bash
npm uninstall -g @soketi/soketi
npm install -g @soketi/cli
```

```bash
# Now you can use the IPFS server
soketi ipfs start --port=7001

# ...or the legacy server
soketi legacy start --port=6001
```

For legacy server, see the [soketi/soketi](https://github.com/soketi/soketi) repository.

## ⁉ Ideas or Discussions?

Have any ideas that can make into the project? Perhaps you have questions? [Jump into the discussions board](https://github.com/soketi/monorepo/discussions) or [join the Discord channel](https://discord.gg/VgfKCQydjb)

## 🔒  Security

If you discover any security related issues, please email <security@soketi.app> instead of using the issue tracker.

## 🎉 Credits

- [Alex Renoki](https://github.com/rennokki)
- [Pusher Protocol](https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol)
- [All Contributors](../../contributors)

## 🤝 Contributing

✨ **This workspace has been generated by [Nx, a Smart, fast and extensible build system.](https://nx.dev)** ✨

### Learn more

- [Nx Documentation](https://nx.dev)
- [30-minute video showing all Nx features](https://nx.dev/getting-started/what-is-nx)

### Install dependencies

Run `npm install` to install all dependencies.

```bash
npm install
```

### Packages

soketipfs is a monorepo, and it's composed of the following packages:

- [brain](./packages/brain): Used to cache data in memory
- [cli](./packages/cli): the CLI took for soketi that supports both legacy and IPFS, plus possibly many more integratins
- [connections](./packages/connections): Base implementation for Websocket connections handling
- [gossiper](./packages/gossiper): Integration for the Gossip protocol, used to broadcast messages to all nodes in the network
- [p2p](./packages/p2p): libp2p networking implementation using Helia
- [protocols](./packages/protocols): implementation of various protocols, such as Pusher, Ably or MQTT
- [routing](./packages/routing): Unified implementation for HTTP routing or handling custom events in the network
- [server](./packages/server): Ready-to-go & customizable server implemenations for soketipfs
- [utils](./packages/utils): Utility functions used across the packages

Each abstraction has its own place in the soketipfs ecosystem, and they can be used independently or together.
