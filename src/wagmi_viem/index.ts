import {
    type Connector,
    createConfig,
    injected,
    type InjectedParameters,
    type Config as WagmiConfig,
    type CreateConfigParameters as WagmiConfigParameters
} from '@wagmi/core'

import {
    type Abi,
    type Address,
    createPublicClient,
    createWalletClient,
    custom,
    type CustomTransport,
    type EIP1193RequestFn,
    erc20Abi,
    erc20Abi_bytes32,
    fallback,
    type FallbackTransport,
    formatEther,
    formatUnits,
    type Hex,
    http,
    type HttpTransport,
    parseEther,
    parseUnits,
    type PublicClient,
    type Transport,
    type WalletClient,
    webSocket,
    type WebSocketTransport,
    zeroAddress,
    zeroHash,
    getAddress
} from 'viem'

import { type Account, privateKeyToAccount, privateKeyToAddress } from 'viem/accounts'

export * from 'viem/chains'

export {
    createConfig,
    createPublicClient,
    createWalletClient,
    custom,
    erc20Abi,
    erc20Abi_bytes32,
    fallback,
    formatEther,
    formatUnits,
    getAddress,
    http,
    injected,
    parseEther,
    parseUnits,
    privateKeyToAccount,
    privateKeyToAddress,
    webSocket,
    zeroAddress,
    zeroHash,
    type Abi,
    type Account,
    type Address,
    type Connector,
    type CustomTransport,
    type EIP1193RequestFn,
    type FallbackTransport,
    type Hex,
    type HttpTransport,
    type InjectedParameters,
    type PublicClient,
    type Transport,
    type WagmiConfig,
    type WagmiConfigParameters,
    type WalletClient,
    type WebSocketTransport
}
