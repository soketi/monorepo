#!/bin/sh
set -ex

ipfs config --json Ipns.UsePubsub true
ipfs config --json Pubsub.Enabled true

ipfs config --json Experimental.GatewayOverLibp2p true
ipfs config --json Experimental.Libp2pStreamMounting true
ipfs config --json Experimental.P2pHttpProxy true

ipfs config --json Swarm.RelayClient.Enabled true
ipfs config --json Swarm.RelayService.Enabled true
ipfs config --json Swarm.Transports.Network.Websocket true
ipfs config --bool Swarm.EnableAutoNATService true

ipfs bootstrap rm all
