import {
    type Address,
    type Chain,
    createPublicClient,
    type CustomTransport,
    type EIP1193RequestFn,
    fallback,
    type FallbackTransport,
    getAddress,
    type Hex,
    hexToBigInt,
    http,
    type HttpTransport,
    keccak256,
    type PublicClient,
    toBytes,
    toHex,
    type Transport,
    trim,
    type WebSocketTransport,
    zeroAddress
} from 'viem'
import type {
    ChainId,
    ClientConfig,
    Config,
    ContractType,
    FormattedContractType,
    ServerConfig
} from '../types/index.js'
import { InvalidChainId, MissingRequiredParams } from './errors.js'
import prepareConfig from './prepareConfig.js'
import { base64Encode, base64Decode } from './encoding.js'

export * from './constants.js'
export * from './contractInteraction.js'
export * from './errors.js'
export * from './getParameters.js'
export * from './logger.js'
export { prepareConfig, base64Encode, base64Decode }

/**
 * A helper function to censors any string by replacing everything
 * with `*` character
 *
 * > useful for censoring secret strings like private keys
 *
 * @category Utils
 */
export function censor(str: string) {
    try {
        return Array(str.length).fill('*').join('')
    } catch (_) {
        return str
    }
}

/**
 * A helper function used to retrieve all chains available for use from the
 * sdk config
 *
 * @category Utils
 *
 * @param config sdk config
 * @returns
 */
export function getChains(config: Config): Readonly<Chain[]> {
    if (config.mode === 'client') {
        return (config.options as ClientConfig)?.wagmiConfig?.chains || []
    }

    return (config.options as ServerConfig)?.chains || []
}

/**
 * This function is used to retrieve the chain from
 * the sdk config using the chainId while also making
 * sure that the chain being retrieved exist in the config
 *
 * @category Utils
 */
export function getChainById(config: Config, chainId: ChainId) {
    const options = config.options

    if (config.mode === 'client') {
        const chains = (options as ClientConfig).wagmiConfig.chains.filter(
            (chain) => chain.id === chainId
        )

        if (chains.length < 1) {
            throw new InvalidChainId(`Chain Id [${chainId}] Does Not Exist On The Provided Chains`)
        }

        return chains.at(0)
    }

    if (config.mode === 'server') {
        const chains = (options as ServerConfig).chains.filter((chain) => chain.id === chainId)

        if (chains.length < 1) {
            throw new InvalidChainId(`Chain Id [${chainId}] Does Not Exist On The Provided Chains`)
        }

        return chains.at(0)
    }
}

/**
 * This function is used to retrieve transport object from a list of chains
 * usually matching the chains from the sdk config and returns a transports
 * object found on wagmi config that looks like
 *
 * ```js
 * {
 *  [chain.id]: http(),
 *  ...
 * }
 * ```
 *
 * @category Utils
 */
export function getDefaultTransportFromChains(chains: Chain[]) {
    if (chains.length < 1) {
        throw new MissingRequiredParams('Must Have At Least 1 Chain')
    }

    return Object.fromEntries(
        chains.map((chain: Chain) => [
            Number(chain.id),
            fallback(chain.rpcUrls.default.http.map((url) => http(url)))
        ])
    )
}

/**
 * A Helper function to retrieve the custom transport from config and
 * falls back to the default http() when no custom transport is present
 *
 * @category Utils
 */
export function getTransportFromConfig(config: Config, chainId: ChainId) {
    if (config.mode === 'client') {
        const transports = (config.options as ClientConfig)?.wagmiConfig?.transports
        return transports && Object.keys(transports).length > 0 ? transports[chainId] : http()
    }

    const transports = (config.options as ServerConfig)?.transports
    return transports && Object.keys(transports).length > 0 ? transports[chainId] : http()
}

/**
 * A Helper function to stringify an object containing bigints
 *
 * @category Utils
 */
export function deepStringifyBigInts(obj: object) {
    if (!obj) return obj
    return JSON.parse(
        JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
    )
}

/**
 * Formats the contract type from the one the contract uses to
 * the one that {@link abis} use
 *
 * @category Utils
 */
export function contractTypeFormatter(contractType: ContractType): FormattedContractType {
    return contractType
        .split(' ')
        .map((item: string, index: number) => {
            if (index === 0) {
                return item.toLowerCase()
            }
            const n = item.toLowerCase()
            return n.charAt(0).toUpperCase() + n.slice(1)
        })
        .join('') as FormattedContractType
}

/**
 * A helper function that retrieves the implementation address of a contract
 * in a given chain and returns the zero address if it does not exist
 *
 * @category Utils
 */
export async function getImplementation(
    chain: Chain,
    address: Address,
    transport?:
        | Transport<string, Record<string, any>, EIP1193RequestFn>
        | HttpTransport
        | WebSocketTransport
        | CustomTransport
        | FallbackTransport
): Promise<Address> {
    try {
        const publicClient = createPublicClient({
            chain: chain,
            transport: transport || http()
        }) as PublicClient

        const returnData = (await publicClient.getStorageAt({
            address: address,
            slot: toHex(
                toBytes(hexToBigInt(keccak256(toHex('eip1967.proxy.implementation'))) - 1n, {
                    size: 32
                })
            )
        })) as Hex

        const implementation = trim(returnData)

        if (implementation === '0x00') {
            return zeroAddress
        }

        return getAddress(implementation)
    } catch (error: any) {
        throw error
    }
}
