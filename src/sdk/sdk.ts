import {
    type Connector,
    readContract,
    type ReadContractParameters,
    simulateContract,
    type SwitchAccountReturnType,
    waitForTransactionReceipt,
    writeContract
} from '@wagmi/core'
import {
    getAddress,
    type Abi,
    type Account,
    type Address,
    type Chain,
    type Hex,
    type ReadContractParameters as ViemReadContractParameters
} from 'viem'
import { baseAbi } from '../abi/index.js'
import type {
    BaseParams,
    ChainId,
    ChainReturnType,
    ClientConfig,
    Config,
    ConnectCallback,
    ConnectionState,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    ControllerParams,
    IBonkersSDK,
    Mode,
    ReaderParams,
    ReaderReturnType,
    ServerConfig,
    SwitchAccountCallback,
    SwitchChainCallback,
    VaultFactoryParams,
    VaultParams,
    WriterParams,
    WriterReturnType
} from '../types/index.js'
import {
    ContractInteractionFailed,
    getChains,
    getParameters,
    getTransportFromConfig,
    InvalidChainId,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    type Logger,
    prepareConfig
} from '../utils/index.js'
import { clients, type Clients } from './clients.js'
import Controller from './controller.js'
import Erc20 from './erc20.js'
import Vault from './vault.js'
import VaultFactory from './vaultFactory.js'
import Signature from './signature.js'

const CLASS_NAME = 'BonkersSDK'

/**
 *
 * @category SDK
 */
export default class BonkersSDK implements IBonkersSDK {
    readonly mode: Mode
    readonly config: Config

    readonly logger: Logger

    /** @group Private */
    private clients: Clients

    /** @group Private */
    private controllerClass: Controller
    /** @group Private */
    private vaultClass: Vault
    /** @group Private */
    private vaultFactoryClass: VaultFactory

    /** @group Private */
    private erc20Class: Erc20

    signature: Signature

    constructor(config: Config) {
        this.config = prepareConfig(config as Config)

        this.mode = this.config.mode
        this.logger = this.config?.logger as Logger
        this.clients = clients
        this.clients.logger = this.logger

        this.signature = new Signature(this.config, this.clients)
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
        this.erc20Class = new Erc20(this.config)
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

    async reconnect() {
        try {
            if (!this.onClientMode()) {
                throw new InvalidSDKMode(
                    'This function is only available on Client Mode/Environment'
                )
            }

            return await this.clients.reconnect(this.connectors() as Connector[])
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: reconnect`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: reconnect`, error.stack)
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

    chains(): Readonly<Chain[]> {
        return getChains(this.config)
    }

    async balanceOf(account: Address) {
        try {
            if (this.onClientMode()) {
                return await this.clients.balanceOf('wagmi', getAddress(account))
            }

            return await this.clients.balanceOf('viem', getAddress(account))
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: balanceOf`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: balanceOf`, error.stack)
            throw error
        }
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

    erc20(tokenAddress?: Address) {
        if (tokenAddress) {
            this.erc20Class.tokenAddress = tokenAddress as Address
        }
        return this.erc20Class
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

        return await getParameters(
            {
                chain: chain,
                address: address,
                expectedType: contractType
            },
            getTransportFromConfig(this.config, this.chain().id)
        )
    }

    async reader(params: ReaderParams): Promise<ReaderReturnType> {
        try {
            this.logger.debug({
                from: 'SDK',
                address: params.address,
                functionName: params.functionName,
                args: params.args,
                abi: params.abi.length
            })

            if (this.onClientMode()) {
                const result = await readContract(
                    this.clients.wagmi,
                    params as ReadContractParameters
                )
                return result
            }

            const result = await this.clients.publicClient.readContract(
                params as ViemReadContractParameters
            )

            return result
        } catch (error: any) {
            throw new ContractInteractionFailed(
                `Failed To Execute Read on: ${params.functionName}`,
                {
                    wevm: `${error.name} | ${error.message}`
                }
            )
        }
    }

    async writer(params: WriterParams): Promise<ContractInteractionReturnType<WriterReturnType>> {
        try {
            this.logger.debug({
                from: 'SDK',
                address: params.address,
                functionName: params.functionName,
                args: params.args,
                abi: params.abi.length,
                value: params.value
            })

            if (this.onClientMode()) {
                const { request, result } = await simulateContract(this.clients.wagmi, params)

                const hash = await writeContract(this.clients.wagmi, request)

                const receipt = await waitForTransactionReceipt(this.clients.wagmi, {
                    hash
                })

                return { status: 'success', result: result, txHash: hash, receipt: receipt }
            }

            const { address, abi, functionName, args } = params

            const { request, result } = await this.clients.publicClient.simulateContract({
                address,
                abi,
                functionName,
                args,
                account: this.clients.walletClient.account as Account
            })

            const hash = await this.clients.walletClient.writeContract(request)

            const receipt = await this.clients.publicClient.waitForTransactionReceipt({
                hash
            })

            return { status: 'success', result: result, txHash: hash, receipt: receipt }
        } catch (error: any) {
            throw new ContractInteractionFailed(
                `Failed To Execute Write on: ${params.functionName}`,
                {
                    wevm: `${error.name} | ${error.message}`
                }
            )
        }
    }

    async getContractType(address: Address): Promise<ContractType> {
        try {
            // @ts-ignore
            return (await this.reader({
                address: getAddress(address),
                abi: baseAbi,
                functionName: 'contractType'
            })) as ContractType
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: getContractType`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: getContractType`, error.stack)
            throw new InvalidContractType('Can Not Find Contract Type From The Given Address')
        }
    }

    async getContractVersion(address: Address): Promise<ContractVersion> {
        try {
            // @ts-ignore
            return (await this.reader({
                address: getAddress(address),
                abi: baseAbi,
                functionName: 'version'
            })) as string
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: getContractVersion`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: getContractVersion`, error.stack)
            throw new InvalidContractVersion('Can Not Find Version From The Given Address')
        }
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
