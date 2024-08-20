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
