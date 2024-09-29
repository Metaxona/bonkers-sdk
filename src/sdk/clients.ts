import {
    connect,
    type Connector,
    createConfig,
    disconnect,
    getAccount,
    type GetAccountReturnType,
    getBalance,
    reconnect,
    switchAccount,
    switchChain,
    type Config as WagmiConfig,
    type CreateConfigParameters as WagmiConfigParameters,
    watchAccount,
    watchChainId,
    watchConnections
} from '@wagmi/core'
import {
    type Address,
    type Chain,
    createPublicClient,
    createWalletClient,
    type Hex,
    type PublicClient,
    type Transport,
    type WalletClient
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import type {
    ChainId,
    ChainReturnType,
    ClientConfig,
    ClientType,
    Config,
    ConnectCallback,
    ConnectionState,
    IClients,
    ServerConfig,
    SwitchAccountCallback,
    SwitchChainCallback
} from '../types/index.js'
import {
    ClientNotFound,
    getChainById,
    InvalidClientType,
    logger,
    type Logger,
    prepareConfig
} from '../utils/index.js'

const CLASS_NAME = 'Clients'

/**
 *
 * @category Clients
 */
export class Clients implements IClients {
    publicClient: PublicClient
    walletClient: WalletClient
    wagmi: WagmiConfig
    logger: Logger

    constructor(
        publicClient?: PublicClient,
        walletClient?: WalletClient,
        wagmi?: WagmiConfig,
        _logger?: Logger
    ) {
        this.publicClient = publicClient || (undefined as any)
        this.walletClient = walletClient || (undefined as any)
        this.wagmi = wagmi || (undefined as any)
        this.logger = _logger || logger
    }

    /**
     * Method used to set the clients for the given client type based the SDK config
     *
     * @param config
     */
    setClients(config: Config) {
        try {
            const _config = prepareConfig(config)
            const options = _config.options
            if (_config.mode === 'client') {
                this.wagmi = createConfig(
                    (options as ClientConfig).wagmiConfig as WagmiConfigParameters
                )
            }

            if (_config.mode === 'server') {
                const chain = (options as ServerConfig)?.chains[0] as Chain
                const transport = (options as ServerConfig).transports?.[chain.id] as Transport

                this.publicClient = createPublicClient({
                    chain: chain,
                    transport: transport
                }) as PublicClient

                this.walletClient = createWalletClient({
                    account: privateKeyToAccount((options as ServerConfig).privateKey),
                    chain: chain,
                    transport: transport
                }) as WalletClient
            }
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: setClients`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: setClients`, error.stack)
            throw error
        }
    }

    clientsExist(clientType: ClientType): Readonly<boolean> {
        if (clientType === 'viem') {
            if (this.publicClient === undefined || this.walletClient === undefined) return false
            return true
        }
        if (clientType === 'wagmi') {
            if (this.wagmi === undefined) return false
            return true
        }
        return false
    }

    chain(clientType: ClientType): Readonly<ChainReturnType> {
        try {
            if (clientType === 'viem' && this.clientsExist('viem')) {
                const chain = this.publicClient.chain as Chain
                return {
                    id: Number(chain.id),
                    chainId: Number(chain.id) as ChainId,
                    name: chain.name as string,
                    symbol: chain?.nativeCurrency?.symbol
                }
            }

            if (clientType === 'wagmi' && this.clientsExist('wagmi')) {
                const chain = this.wagmi.getClient().chain as Chain
                return {
                    id: Number(chain.id),
                    chainId: Number(chain.id) as ChainId,
                    name: chain.name as string,
                    symbol: chain?.nativeCurrency?.symbol
                }
            }

            throw new InvalidClientType()
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: chain`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: chain`, error.stack)
            throw error
        }
    }

    connectors(): Readonly<Connector[]> {
        if (!this.clientsExist('wagmi')) {
            throw new ClientNotFound('Wagmi Client Not Found')
        }
        return this.wagmi.connectors
    }

    connection(): Readonly<ConnectionState> {
        if (!this.clientsExist('wagmi')) {
            throw new ClientNotFound('Wagmi Client Not Found')
        }

        return this.wagmi.state.status
    }

    async reconnect(connectors: Connector[]) {
        try {
            if (!this.clientsExist('wagmi')) {
                throw new ClientNotFound('Wagmi Client Not Found')
            }

            return await reconnect(this.wagmi, { connectors: connectors })
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: reconnect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: reconnect`, error.stack)
            throw error
        }
    }

    async connect(connector: Connector, callback?: ConnectCallback) {
        try {
            if (!this.clientsExist('wagmi')) {
                throw new ClientNotFound('Wagmi Client Not Found')
            }

            if (callback) {
                const unwatch = watchConnections(this.wagmi, {
                    onChange(connections, prevConnections) {
                        callback(connections, prevConnections, unwatch)
                    }
                })
            }

            return await connect(this.wagmi, { connector: connector })
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: connect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: connect`, error.stack)
            throw error
        }
    }

    async disconnect() {
        try {
            if (!this.clientsExist('wagmi')) {
                throw new ClientNotFound('Wagmi Client Not Found')
            }

            return await disconnect(this.wagmi)
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: disconnect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: disconnect`, error.stack)
            throw error
        }
    }

    async switchChain(chainId: ChainId, callback?: SwitchChainCallback) {
        try {
            if (!this.clientsExist('wagmi')) {
                throw new ClientNotFound('Wagmi Client Not Found')
            }

            if (callback) {
                const unwatch = watchChainId(this.wagmi, {
                    onChange(_chainId, _prevChainId) {
                        callback(_chainId, _prevChainId, unwatch)
                    }
                })
            }

            return await switchChain(this.wagmi, { chainId: chainId })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: switchChain`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: switchChain`, error.stack)
            throw error
        }
    }

    async switchAccount(connector: Connector, callback?: SwitchAccountCallback) {
        try {
            if (!this.clientsExist('wagmi')) {
                throw new ClientNotFound('Wagmi Client Not Found')
            }

            if (callback) {
                const unwatch = watchAccount(this.wagmi, {
                    onChange(account: GetAccountReturnType, prevAccount: GetAccountReturnType) {
                        callback(account, prevAccount, unwatch)
                    }
                })
            }

            return await switchAccount(this.wagmi, { connector: connector as Connector })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: switchAccount`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: switchAccount`, error.stack)
            throw error
        }
    }

    useAccount(privateKey: Hex): void {
        try {
            if (!this.clientsExist('viem')) {
                throw new ClientNotFound('Viem Public and Wallet Client Not Found')
            }

            this.walletClient.account = privateKeyToAccount(privateKey as Hex)
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: useAccount`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: useAccount`, error.stack)
            throw error
        }
    }

    useChain(config: Config, chainId: ChainId): void {
        try {
            if (!this.clientsExist('viem')) {
                throw new ClientNotFound('Viem Public and Wallet Client Not Found')
            }

            const _config = prepareConfig(config)
            const options = _config.options

            const chain = getChainById(_config, chainId)
            const transport = (options as ServerConfig).transports?.[chainId] as Transport

            this.logger.debug({
                from: 'clients',
                chain: chain?.name,
                chainId: chain?.id,
                transport: transport
            })

            this.publicClient = createPublicClient({
                chain: chain,
                transport: transport
            }) as PublicClient

            this.walletClient = createWalletClient({
                account: privateKeyToAccount((options as ServerConfig).privateKey),
                chain: chain,
                transport: transport
            }) as WalletClient
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: useChain`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: useChain`, error.stack)
            throw error
        }
    }

    account(config: Config): Readonly<Address | undefined> {
        try {
            const _config = prepareConfig(config)

            if (_config.mode === 'client') {
                if (!this.clientsExist('wagmi')) {
                    throw new ClientNotFound('Wagmi Client Not Found')
                }

                return getAccount(this.wagmi).address
            }

            if (_config.mode === 'server') {
                if (!this.clientsExist('viem')) {
                    throw new ClientNotFound('Viem Public and Wallet Client Not Found')
                }
                return this.walletClient.account?.address
            }
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: account`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: account`, error.stack)
            throw error
        }
    }

    async balanceOf(clientType: ClientType, account: Address) {
        try {
            if (clientType === 'viem') {
                if (!this.clientsExist('viem')) {
                    throw new ClientNotFound('Viem Public and Wallet Client Not Found')
                }
                return await this.publicClient.getBalance({ address: account })
            }

            if (clientType === 'wagmi') {
                if (!this.clientsExist('wagmi')) {
                    throw new ClientNotFound('Wagmi Client Not Found')
                }
                return (await getBalance(this.wagmi, { address: account })).value
            }

            throw new InvalidClientType()
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: balanceOf`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: balanceOf`, error.stack)
            throw error
        }
    }
}

/** @category Clients */
export const clients = new Clients()
