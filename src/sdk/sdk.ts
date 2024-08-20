import type { Connector, SwitchAccountReturnType } from '@wagmi/core'
import type { Abi, Address, Chain, Hex } from 'viem'
import type {
    BaseParams,
    ChainId,
    ChainReturnType,
    ClientConfig,
    Config,
    ConnectCallback,
    ConnectionState,
    ContractType,
    ControllerParams,
    IBonkersSDK,
    Mode,
    ServerConfig,
    SwitchAccountCallback,
    SwitchChainCallback,
    VaultFactoryParams,
    VaultParams
} from '../types/index.js'
import {
    getParameters,
    InvalidChainId,
    InvalidSDKMode,
    type Logger,
    prepareConfig
} from '../utils/index.js'
import { clients, type Clients } from './clients.js'
import Controller from './controller.js'
import Vault from './vault.js'
import VaultFactory from './vaultFactory.js'

const CLASS_NAME = 'BonkersSDK'

/**
 *
 * @category SDK
 */
export default class BonkersSDK implements IBonkersSDK {
    readonly mode: Mode
    readonly config: Config

    /** @group Internal */
    protected logger: Logger

    /** @group Private */
    private clients: Clients

    /** @group Private */
    private controllerClass: Controller
    /** @group Private */
    private vaultClass: Vault
    /** @group Private */
    private vaultFactoryClass: VaultFactory

    constructor(config: Config) {
        this.config = prepareConfig(config as Config)

        this.mode = this.config.mode
        this.logger = this.config?.logger as Logger
        this.clients = clients
        this.clients.logger = this.logger

        this.logger.info({
            mode: this.mode,
            from: 'SDK',
            status: 'Initialized'
        })

        if (this.mode === 'client' && !this.clients.clientsExist('wagmi')) {
            this.clients.setClients(config)
        }

        if (this.mode === 'server' && !this.clients.clientsExist('viem')) {
            this.clients.setClients(config)
        }

        this.controllerClass = new Controller(this.config)
        this.vaultClass = new Vault(this.config)
        this.vaultFactoryClass = new VaultFactory(this.config)
    }

    connectors(): Readonly<Connector[]> {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }
            return this.clients.connectors()
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: connectors`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: connectors`, error.stack)
            throw error
        }
    }

    connection(): Readonly<ConnectionState> {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }
            return this.clients.connection()
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: connection`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: connection`, error.stack)
            throw error
        }
    }

    async connect(connector: Connector, callback?: ConnectCallback) {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }

            return await this.clients.connect(connector, callback)
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: connect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: connect`, error.stack)
            throw error
        }
    }

    async disconnect() {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }

            return await this.clients.disconnect()
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: disconnect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: disconnect`, error.stack)
            throw error
        }
    }

    async switchChain(chainId: ChainId, callback?: SwitchChainCallback) {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }

            return await this.clients.switchChain(chainId, callback)
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

    async switchAccount(
        connector: Connector,
        callback?: SwitchAccountCallback
    ): Promise<SwitchAccountReturnType> {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }

            return await this.clients.switchAccount(connector, callback)
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

    useAccount(privateKey: Hex) {
        try {
            if (!this.onServerMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Server Mode/Environment'
                )
            }

            this.clients.useAccount(privateKey)

            return this
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: useAccount`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: useAccount`, error.stack)
            throw error
        }
    }

    account(): Readonly<Address | undefined> {
        return this.clients.account(this.config)
    }

    useChain(chainId: ChainId) {
        try {
            if (!this.onServerMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Server Mode/Environment'
                )
            }

            this.clients.useChain(this.config, chainId)
            return this
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: useChain`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: useChain`, error.stack)
            throw error
        }
    }

    chain(): Readonly<ChainReturnType> {
        if (this.onClientMode()) {
            return this.clients.chain('wagmi')
        }

        return this.clients.chain('viem')
    }

    controller(controllerParams?: ControllerParams) {
        if (controllerParams) {
            this.controllerClass.contractAddress = controllerParams.address as Address
            this.controllerClass.contractAbi = controllerParams.abi as Abi
        }
        return this.controllerClass
    }

    vault(vaultParams?: VaultParams) {
        if (vaultParams) {
            this.vaultClass.contractAddress = vaultParams.address as Address
            this.vaultClass.contractAbi = vaultParams.abi as Abi
        }
        return this.vaultClass
    }

    vaultFactory(vaultFactoryParams?: VaultFactoryParams) {
        if (vaultFactoryParams) {
            this.vaultFactoryClass.contractAddress = vaultFactoryParams.address as Address
            this.vaultFactoryClass.contractAbi = vaultFactoryParams.abi as Abi
        }
        return this.vaultFactoryClass
    }

    async getParams(
        chainId: ChainId,
        address: Address,
        contractType: ContractType
    ): Promise<BaseParams> {
        const config = this.config
        let chain: Chain | undefined
        if (this.onClientMode()) {
            chain = (config.options as ClientConfig).wagmiConfig.chains.filter(
                (ch: Chain) => ch.id === chainId
            )[0]
        }
        if (this.onServerMode()) {
            chain = (config.options as ServerConfig).chains.filter(
                (ch: Chain) => ch.id === chainId
            )[0]
        }

        if (chain === undefined) {
            throw new InvalidChainId(`Chain Id [${chainId}] Does Not Exist On The Provided Chains`)
        }

        return await getParameters({
            chain: chain,
            address: address,
            expectedType: contractType
        })
    }

    /**
     * An Internal Method used to check if the current environment is a client environment or not
     *
     * @group Internal
     *
     * @returns
     */
    protected onClientMode(): boolean {
        return this.mode === 'client'
    }

    /**
     * An Internal Method used to check if the current environment is a server environment or not
     *
     * @group Internal
     *
     * @returns
     */
    protected onServerMode(): boolean {
        return this.mode === 'server'
    }
}
