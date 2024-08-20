import type {
    Connector,
    ConnectReturnType,
    DisconnectReturnType,
    GetAccountReturnType,
    GetConnectionsReturnType,
    ReadContractParameters,
    ReadContractReturnType,
    SwitchAccountReturnType,
    SwitchChainReturnType,
    Config as WagmiConfig,
    CreateConfigParameters as WagmiConfigParameters,
    WatchAccountReturnType,
    WatchChainIdReturnType,
    WatchConnectionsReturnType,
    WriteContractParameters,
    WriteContractReturnType
} from '@wagmi/core'
import type {
    Abi,
    Address,
    Chain,
    CustomTransport,
    FallbackTransport,
    Hex,
    HttpTransport,
    PublicClient,
    TransactionReceipt,
    ReadContractParameters as ViemReadContractParameters,
    ReadContractReturnType as ViemReadContractReturnType,
    WriteContractParameters as ViemWriteContractParameters,
    WriteContractReturnType as ViemWriteContractReturnType,
    WalletClient,
    WebSocketTransport
} from 'viem'
import type { Logger } from '../utils/index.js'

export type Status = 'success' | 'failed'

export type ContractInteractionReturnType<T> = {
    status: Status
    result?: T
    txHash?: Hex
    receipt?: TransactionReceipt
}

export type ReaderParams = ReadContractParameters | ViemReadContractParameters

export type ReaderReturnType = ReadContractReturnType | ViemReadContractReturnType

export type WriterParams = WriteContractParameters | ViemWriteContractParameters

export type WriterReturnType = WriteContractReturnType | ViemWriteContractReturnType

export type ContractType = 'CONTROLLER' | 'VAULT' | 'VAULT FACTORY'

export type FormattedContractType = 'controller' | 'vault' | 'vaultFactory'

/**
 * @category Base Class
 */
export type BaseParams = {
    address: Address
    abi: Abi
}

/**
 * @category Controller
 * @category Vault
 */
export type Receiver = {
    receiver: Address
    amount: number
}

/**
 * @category Controller
 * @category Vault
 */
export type Result = {
    success: boolean
    returnData: Hex
}

/** @category Config */
export type Mode = 'client' | 'server'

/**
 * This Config is being used for server use and is a setup for
 * viem clients
 *
 * this can be used on the front end too but it is not recommended since
 * it would expose the private key on the client and that is a bad practice
 *
 * in case you want to use this setup on the client, you can hide this
 * under a rest endpoint
 *
 * @category Config
 */
export type ServerConfig = {
    chains: Chain[]
    privateKey: Hex
    transports?: Record<
        ChainId,
        HttpTransport | WebSocketTransport | CustomTransport | FallbackTransport
    >
}

/**
 * This is the Parameters Being Passed to wagmi's createConfig
 * function which is being used by wagmi core to execute interactions
 * with the blockchain like writes, reads and more
 *
 * @category Config
 */
export type ClientConfig = {
    wagmiConfig: WagmiConfigParameters
}

/**
 * Config used by the sdk or by individual to setup most things
 * to get it working and configured allowing a limited behavior
 * customization
 *
 * @category Config
 */
export type Config = {
    readonly mode: Mode
    options: ServerConfig | ClientConfig
    logger?: Logger
}

export type ChainId = Chain['id']

export type ChainReturnType = { chainId: ChainId; name: string }

// export type ContractVersions = Partial<Record<ChainId, Record<FormattedContractType, string[]>>>

// export type ContractAddresses = Partial<Record<ChainId, Record<FormattedContractType, Address>>>

/**
 * Params used to build the calldata when calling {@link IBase.upgradeToAndCall}
 */
export type UpgradeParams = { functionName: string; args?: any[]; value?: bigint }

/**
 * Interface used by Controller, Vault, and VaultFactory who shares
 * a common base
 *
 * @category Base Class
 */
export interface IBase extends IClientInteraction {
    readonly mode: Mode
    readonly config: Config
    contractAddress: Address
    contractAbi: Abi

    /**
     * Method used to upgrade (Controller|Vault|VaultFactory) contract in an unsafe manner
     * since there will be no storage layout check during upgrade
     *
     * it is only recommended to use this method when upgrading to official verified implementations
     * to make sure no storage collisions will happen which would overwrite the contract storage values
     * causing data to be corrupted rendering the contract unusable and or exploitable
     *
     * @param newImplementationAddress
     * @param params upgrade params or calldata
     * @returns
     *
     * @privateRemarks currently unable to test it in an automated manner given the current
     * test setup (manual test required)
     */
    upgradeToAndCall(
        newImplementationAddress: Address,
        params?: UpgradeParams | Hex
    ): Promise<ContractInteractionReturnType<WriterReturnType>>

    /**
     * Method used to get the contract version of the given contract address
     * in the current chain
     *
     * @param address
     * @returns
     */
    getContractVersion(address: Address): Promise<string>

    /**
     * Method used to get the contract type of the given contract address
     * in the current chain
     *
     * @param address
     * @returns
     */
    getContractType(address: Address): Promise<ContractType>

    /**
     * Method used to retrieve the implementation address of the proxy contract
     *
     * @returns
     */
    implementationAddress(): Promise<Address>
}

/**
 * Interface used By SDK, Base, Controller, Vault, and VaultFactory
 * whp shares a common base for interacting with viem and wagmi clients
 *
 * This Interface also shows what the Wrapper for Clients should look
 * when they are being used by SDK, Base, Controller, Vault,
 * and VaultFactory
 *
 * @category Clients
 */
export interface IClientInteraction {
    /**
     * Method that fetches the connection state of the current
     * connection
     *
     * @group Client Only
     * @returns
     */
    connection(): Readonly<ConnectionState>

    /**
     * Method that fetches the connectors used by wagmi config
     *
     * @group Client Only
     * @returns
     */
    connectors(): Readonly<Connector[]>

    /**
     * Method used to connect an account to the wagmi config client
     *
     * @param connector
     * @param callback callback used to watch for connection changes
     *
     * @group Client Only
     * @returns
     */
    connect(
        connector: Connector,
        callback?: ConnectCallback
    ): Promise<ConnectReturnType<WagmiConfig>>

    /**
     * Method to disconnect all connected connectors
     *
     * @group Client Only
     * @returns
     */
    disconnect(): Promise<DisconnectReturnType>

    /**
     * Method to switch chain for the currently connected connector
     *
     * @param chainId
     * @param callback callback used to watch for chain changes
     *
     * @group Client Only
     * @returns
     */
    switchChain(chainId: ChainId, callback?: SwitchChainCallback): Promise<SwitchChainReturnType>

    /**
     * Method to retrieve the chain currently being used
     *
     * @returns
     */
    chain(): ChainReturnType

    /**
     * Method to switch chain for viem clients
     *
     * @param chainId
     *
     * @group Server Only
     * @returns
     */
    useChain(chainId: ChainId): void

    /**
     * Method to switch account for the currently connected connector
     *
     * @param connector
     * @param callback callback used to watch for account changes
     *
     * @group Client Only
     * @returns
     */
    switchAccount(
        connector: Connector,
        callback?: SwitchAccountCallback
    ): Promise<SwitchAccountReturnType>

    /**
     * Method to switch account for viem clients
     *
     * @param privateKey
     *
     * @group Server Only
     * @returns
     */
    useAccount(privateKey: Hex): void

    /**
     * Method to retrieve the account currently being used
     *
     * @returns
     */
    account(): Readonly<Address | undefined>
}

/** @category Clients */
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting'

/** @category Clients */
export type SwitchChainCallback =
    | ((chainId: number, prevChainId: number, unwatch: WatchChainIdReturnType) => void)
    | undefined

/** @category Clients */
export type SwitchAccountCallback =
    | ((
          account: GetAccountReturnType,
          prevAccount: GetAccountReturnType,
          unwatch: WatchAccountReturnType
      ) => void)
    | undefined

/** @category Clients */
export type ConnectCallback =
    | ((
          connections: GetConnectionsReturnType,
          prevConnections: GetConnectionsReturnType,
          unwatch: WatchConnectionsReturnType
      ) => void)
    | undefined

/** @category Clients */
export type ClientType = 'wagmi' | 'viem'

/**
 * Interface for interacting with wagmi and viem clients
 *
 * @category Clients
 */
export interface IClients {
    /** Viem's PublicClient | [More Info](/documents/External_Documentations.html) */
    publicClient: PublicClient

    /** Viem's WalletClient | [More Info](/documents/External_Documentations.html) */
    walletClient: WalletClient

    /** Wagmi's Config | [More Info](/documents/External_Documentations.html) */
    wagmi: WagmiConfig

    /**
     * Method that sets the viem clients and wagmi config based on the sdk config
     *
     * @param config sdk config
     */
    setClients(config: Config): void

    /**
     * Method that checks if clients exist based on the client type
     *
     * @param clientType
     * @returns
     */
    clientsExist(clientType: ClientType): Readonly<boolean>

    /**
     * Method that fetches the connectors used by wagmi config
     *
     * @group Client Only
     * @returns
     */
    connectors(): Readonly<Connector[]>

    /**
     * Method that fetches the connection state of the current
     * connection
     *
     * @group Client Only
     * @returns
     */
    connection(): Readonly<ConnectionState>

    /**
     * Method used to connect an account to the wagmi config client
     *
     * @param connector
     * @param callback callback used to watch for connection changes
     *
     * @group Client Only
     * @returns
     */
    connect(
        connector: Connector,
        callback?: ConnectCallback
    ): Promise<ConnectReturnType<WagmiConfig>>

    /**
     * Method to disconnect all connected connectors
     *
     * @group Client Only
     * @returns
     */
    disconnect(): Promise<DisconnectReturnType>

    /**
     * Method to switch chain for the currently connected connector
     *
     * @param chainId
     * @param callback callback used to watch for chain changes
     *
     * @group Client Only
     * @returns
     */
    switchChain(chainId: ChainId, callback?: SwitchChainCallback): Promise<SwitchChainReturnType>

    /**
     * Method to switch chain for viem clients
     *
     * @param config
     * @param chainId
     *
     * @group Server Only
     * @returns
     */
    useChain(config: Config, chainId: ChainId): void

    /**
     * Method to retrieve the chain currently being used
     *
     * @param clientType
     * @returns
     */
    chain(clientType: ClientType): Readonly<ChainReturnType>

    /**
     * Method to switch account for the currently connected connector
     *
     * @param connector
     * @param callback callback used to watch for account changes
     *
     * @group Client Only
     * @returns
     */
    switchAccount(
        connector: Connector,
        callback?: SwitchAccountCallback
    ): Promise<SwitchAccountReturnType>

    /**
     * Method to switch account for viem clients
     *
     * @param privateKey
     *
     * @group Server Only
     * @returns
     */
    useAccount(privateKey: Hex): void

    /**
     * Method to retrieve the account currently being used
     *
     * @param config
     * @returns
     */
    account(config: Config): Readonly<Address | undefined>
}
