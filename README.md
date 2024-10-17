# Bonkers SDK

![Statements](https://img.shields.io/badge/statements-99.31%25-brightgreen.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-99.55%25-brightgreen.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-99.31%25-brightgreen.svg?style=flat)

[![Test](https://github.com/Metaxona/bonkers-sdk/actions/workflows/test.yaml/badge.svg)](https://github.com/Metaxona/bonkers-sdk/actions/workflows/test.yaml)

A Javascript SDK for interacting with Bonkers Contracts

## Installation

```bash
npm install bonkers-sdk
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

## SDK

```ts

import BonkersSDK from "bonkers-sdk"

const bonkers = new BonkersSDK(config)

```

## Controller

```ts

import {Controller} from "bonkers-sdk"

const controller = new Controller(config)

```

## Vault

```ts

import {Vault} from "bonkers-sdk"

const vault = new Vault(config)

```

## Vault Factory

```ts

import {VaultFactory} from "bonkers-sdk"

const vaultFactory = new VaultFactory(config)

```
