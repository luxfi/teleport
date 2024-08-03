[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Lux Teleport MPC Node
Lux Teleport protocol is powered by a network of Multi-Party Compute (MPC) nodes which perform oracle operations and MPC signatures.

## Features
Lux Teleport nodes have the following key features:

1. Decentralized oracle operations using MPC
2. Decentralized permissioning using MPC
3. Zero knowledge transactions, signers don't know details about where transactions are "teleported" to, could be any-chain.

## Installation
Clone the repository on all signers.

```
git clone https://github.com/luxfi/teleport
```

Install rust on all nodes.

Run the installer file.

```
chmod 777 install.sh
./install.sh
```

### Run Keygen

Manually do the following on all signers:

`cd ./target/release/examples/`

#### Start an SM server

`./gg20_sm_manager`

That will start an HTTP server on `http://127.0.0.1:8000`. Other parties will use that server in order to communicate with
each other. Note that communication channels are neither encrypted nor authenticated. In production, you must encrypt and
authenticate parties messages. Set up your own endpoint to do this. Add your signing manager to: "SigningManagers".

To run a 3 party MPC node network, open 3 terminal tabs for each node.

Run:

1. `./gg18_keygen_client http://yourIP1:portNumber keys1.store`
2. `./gg18_keygen_client http://yourIP1:portNumber keys2.store`
3. `./gg18_keygen_client http://yourIP1:portNumber keys3.store`

Each command corresponds to one party. Once keygen is completed, you'll have 3 new files:
`keys1.json`, `keys2.json`, `lkeys3.json` corresponding to local secret
share of each party.

Add these your your `settings.json` under "KeyStore"

Setup an endpoint with NGINX to run your node.

Adding additional bridge networks are created by updating `settings.json`.

We will continue to update `settings.json` with new chains and tokens over time.

Run the node with:

```
npm run node
```

The [Lux Bridge](https://github.com/luxfi/bridge) map be used to interact with this MPC network.
