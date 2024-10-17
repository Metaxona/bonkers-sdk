---
title: Examples
group: Documents
---

## Server Config

```ts

import { type Config, mainnet } from "bonkers-sdk"

const config: Config = {
    mode: 'server',
    options: {
        chains: [mainnet]
        privateKey: '0x...123'
    }
}

```

### With Transports

```ts

import { type Config, mainnet, http } from "bonkers-sdk"

const config: Config = {
    mode: 'server',
    options: {
        chains: [mainnet]
        privateKey: '0x...123',
        transports: {
            [mainnet.id]: http()
        }
    }
}

```

#### With Transports Using A Custom RPC

```ts

import { type Config, mainnet, http } from "bonkers-sdk"

const config: Config = {
    mode: 'server',
    options: {
        chains: [mainnet]
        privateKey: '0x...123',
        transports: {
            [mainnet.id]: http("https://rpc.here.com/")
        }
    }
}

```

## Client Config

```ts

import { type Config, mainnet, http, injected } from "bonkers-sdk"

const config: Config = {
    mode: 'client',
    options: {
        wagmiConfig: {
            chains: [mainnet],
            transports: {
                [mainnet.id]: http()
            },
            connectors: [injected({ target: "metaMask", shimDisconnect: true })]
        }
    }
}

```

## SDK Instance

```ts

import BonkersSDK from "bonkers-sdk"

const bonkers = new BonkersSDK(config)

```

## Controller Instance

```ts

import {Controller} from "bonkers-sdk"

const controller = new Controller(config)

```

### Controller Instance With Params

```ts

import {Controller, controllerAbi_0_0_1} from "bonkers-sdk"

const controller = new Controller(config, { address: "0x...123", abi: controllerAbi_0_0_1 })

```

## Vault Instance

```ts

import {Vault, vaultAbi_0_0_1} from "bonkers-sdk"

const vault = new Vault(config)

```

### Vault Instance With Params

```ts

import {Vault, vaultAbi_0_0_1} from "bonkers-sdk"

const vault = new Vault(config, { address: "0x...123", abi: vaultAbi_0_0_1 })

```

## Vault Factory Instance

```ts

import {VaultFactory, vaultFactoryAbi_0_0_1} from "bonkers-sdk"

const vaultFactory = new VaultFactory(config)

```

### Vault Factory Instance With Params

```ts

import {VaultFactory, vaultFactoryAbi_0_0_1} from "bonkers-sdk"

const vaultFactory = new VaultFactory(config, { address: "0x...123", abi: vaultFactoryAbi_0_0_1 })

```

## Signature

### Signing Message

```ts

import BonkersSDK from "bonkers-sdk"

const bonkersSdk = new BonkersSDK(config)

const message = "Hello"

bonkersSdk.signature.setMessage(message)

await bonkersSdk.signature.signMessage()

// or

const signature = await bonkersSdk.signature.setMessage(message).signMessage()

```

### Verifying Signed Message

```ts

...

await bonkersSdk.signature.verifyMessage(signature /**, signer address */)

```

### Recover Signer of Signed Message

```ts

...

await bonkersSdk.signature.recoverMessageAddress(signature)

```

### Signing TypedData

```ts

import BonkersSDK from "bonkers-sdk"

const bonkersSdk = new BonkersSDK(config)

const typedData = {
    domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    types: {
        Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
        ],
        Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
        ],
    },
    primaryType: 'Mail',
    message: {
        from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
    },
}

bonkersSdk.signature.setTypedData(typedData)

await bonkersSdk.signature.signTypedData()

// or

const signature = await bonkersSdk.signature.setTypedData(typedData).signTypedData()

```

### Verifying Signed TypedData

```ts

...

await bonkersSdk.signature.verifyTypedData(signature /**, signer address */)

```

### Recover Signer of Signed TypedData

```ts

...

await bonkersSdk.signature.recoverTypedDataAddress(signature)

```
