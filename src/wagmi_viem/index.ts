import {
    injected,
    type InjectedParameters,
    type CreateConfigParameters as WagmiConfigParameters
} from '@wagmi/core'
import { type Abi, type Address, type Hex, http } from 'viem'

export * from 'viem/chains'

export {
    http,
    injected,
    type Abi,
    type Address,
    type Hex,
    type InjectedParameters,
    type WagmiConfigParameters
}
