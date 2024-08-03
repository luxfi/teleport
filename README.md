# teleport
Lux Teleport Protocol is comprised of Multi-Party Compute (MPC) nodes which perform oracle operations and MPC signature on the bridge.

## Features
Lux Teleport has the following features:

1. Decentralized oracle operations using MPC
2. Decentralized permissioning using MPC
3. Zero knowledge transactions, signers don't know details about assets being teleported to and from supported chains.

## Installation
Clone the repository on all signers.

```
git clone https://github.com/luxfi/teleport
```

Install rust and mongoDB on all nodes.

Run the installer file.

```
chmod 777 install.sh
./install.sh
```

Set up mongoDB and the Teleport data store.

```
pico /etc/mongod.conf
```
comment out the following:

security:
  authorization: enabled

```
mongod --config /etc/mongod.conf
mongo
use bridge
db.createUser(
  {
    user: "lux",
    pwd: "your-secure-password",
    roles: [ { role: "readWrite", db: "bridge" },
             { role: "read", db: "reporting" } ]
  }
)
```

Stop mongod, uncomment:

security:
  authorization: enabled

Then restart mongodb.

```
mongod --config /etc/mongod.conf
```

You could also run mongod using pm2 as

```
pm2 mongod --config /etc/mongod.conf
```

### Run Keygen

Manually do the following on all signers:

`cd ./target/release/examples/`

#### Start an SM server

`./gg20_sm_manager`

That will start an HTTP server on `http://127.0.0.1:8000`. Other parties will use that server in order to communicate with
each other. Note that communication channels are neither encrypted nor authenticated. In production, you must encrypt and
authenticate parties messages. Set up your own endpoint to do this. Add your signing manager to: "SigningManagers".

If you have a 3 party MPC node network, open 3 terminal tabs for each MPC TeleportNode.
Run:

1. `./gg18_keygen_client http://yourIP1:portNumber keys1.store`
2. `./gg18_keygen_client http://yourIP1:portNumber keys2.store`
3. `./gg18_keygen_client http://yourIP1:portNumber keys3.store`

Each command corresponds to one party. Once keygen is completed, you'll have 3 new files:
`keys1.json`, `keys2.json`, `lkeys3.json` corresponding to local secret
share of each party.

Add these your your SettingsMPC.json under "KeyStore"

Setup an endpoint with NGINX to run your node.
Adding additional teleport networks are created by updating SettingsMPC.json. This repo will update Settings.json with new chains.

Run the Lux Teleport node with:

```
npm run node
```

The [Teleport App](https://github.com/luxfi/teleport-app) can be used to interact with this MPC network.
