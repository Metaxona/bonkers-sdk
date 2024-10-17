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
    type Abi,
    type Account,
    type Address,
    type Chain,
    encodeFunctionData,
    getAddress,
    type Hex,
    toHex,
    type ReadContractParameters as ViemReadContractParameters,
    zeroAddress
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
    IBase,
    Mode,
    ReaderParams,
    ReaderReturnType,
    ServerConfig,
    SwitchAccountCallback,
    SwitchChainCallback,
    UpgradeParams,
    WriterParams,
    WriterReturnType
} from '../types/index.js'
import {
    censor,
    ContractInteractionFailed,
    getChainById,
    getChains,
    getImplementation,
    getParameters,
    getTransportFromConfig,
    InvalidChainId,
    InvalidContract,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    type Logger,
    MissingRequiredParams,
    prepareConfig
} from '../utils/index.js'
import { clients, type Clients } from './clients.js'
import Signature from './signature.js'

const CLASS_NAME = 'Base'

/**
 *
 * @category Base
 */
export default class Base implements IBase {
    readonly mode: Mode
    readonly config: Config

    contractAddress: Address
    contractAbi: Abi

    readonly logger: Logger

    /** @group Private */
    private clients: Clients

    signature: Signature

    constructor(config: Config, params?: BaseParams) {
        this.config = prepareConfig(config)

        this.logger = this.config.logger as Logger
        this.mode = this.config.mode
        this.clients = clients
        this.clients.logger = this.logger

        this.signature = new Signature(this.config, this.clients)
        this.contractAddress = params?.address as Address
        this.contractAbi = params?.abi as Abi

        this.logger.debug({
            from: CLASS_NAME,
            config: {
                mode: this.mode,
                server_options: {
                    chains:
                        this.mode === 'server'
                            ? (this.config.options as ServerConfig).chains.map(
                                  (chain) => chain.name
                              )
                            : undefined,
                    privateKey: censor((this.config.options as ServerConfig)?.privateKey),
                    transports: (this.config.options as ServerConfig)?.transports
                },
                client_options: {
                    wagmiConfig: (this.config.options as ClientConfig)?.wagmiConfig
                },
                logger: this.config.logger
            },
            params: {
                address: params?.address,
                abi: (this.contractAbi === undefined ? [] : this.contractAbi)
                    .filter((item) => ['function', 'event', 'error'].includes(item.type))
                    .map(({ name }: any) => name)
            }
        })

        if (this.mode === 'client' && !this.clients.clientsExist('wagmi')) {
            this.clients.setClients(this.config)
        }

        if (this.mode === 'server' && !this.clients.clientsExist('viem')) {
            this.clients.setClients(this.config)
        }
    }

    /**
     * Method used By Controller, Vault, Vault Factory when changing contracts
     *
     * @group Internal
     *
     * @param chainId
     * @param params
     */
    protected _changeBase(chainId: ChainId, params: BaseParams) {
        try {
            if (this.onServerMode()) {
                this.clients.useChain(this.config, chainId)
            }

            if (params.address === zeroAddress) throw new InvalidContract('Can Not Be Zero Address')

            this.contractAddress = getAddress(params.address as Address)
            this.contractAbi = params.abi as Abi

            this.logger.debug({
                from: CLASS_NAME,
                status: 'Base Changed',
                affected: ['Chain Id', 'Contract Address', 'Contract Abi'],
                result: [chainId, params.address, params.abi?.length]
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: _changeBase`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: _changeBase`, error.stack)
            throw error
        }
    }

    /**
     * Method used to change the contract being used by the sdk/class
     * same as useNewController | useNewVault | useNewVaultFactory
     *
     * @param chainId
     * @param params
     *
     * @returns
     */
    useNewContract(chainId: ChainId, params: ControllerParams) {
        this.logger.info(`Contract Changed To: ${params.address}`)
        this._changeBase(chainId, params)
        return this
    }

    /**
     * @group Internal
     */
    protected async _getParams(
        chainId: ChainId,
        address: Address,
        contractType: ContractType
    ): Promise<BaseParams> {
        const config = this.config
        let chain: Chain | undefined
        if (this.onClientMode()) {
            chain = (config.options as ClientConfig).wagmiConfig.chains
                .filter((ch: Chain) => ch.id === chainId)
                .at(0)
        }
        if (this.onServerMode()) {
            chain = (config.options as ServerConfig).chains
                .filter((ch: Chain) => ch.id === chainId)
                .at(0)
        }

        if (chain === undefined) {
            throw new InvalidChainId(`Chain Id [${chainId}] Does Not Exist On The Provided Chains`)
        }

        return await getParameters(
            {
                chain: chain,
                address: getAddress(address),
                expectedType: contractType
            },
            getTransportFromConfig(this.config, this.chain().id)
        )
    }

    /**
     * An Internal Method used to check if the current environment is a client environment or not
     *
     * @group Internal
     *
     * @returns
     */
    protected onClientMode(): Readonly<boolean> {
        return this.mode === 'client'
    }

    /**
     * An Internal Method used to check if the current environment is a server environment or not
     *
     * @group Internal
     *
     * @returns
     */
    protected onServerMode(): Readonly<boolean> {
        return this.mode === 'server'
    }

    async reader(params: ReaderParams): Promise<ReaderReturnType> {
        try {
            this.logger.debug({
                from: CLASS_NAME,
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
                from: CLASS_NAME,
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

    async balance() {
        try {
            this.checkParamsPresence()
            if (this.onClientMode()) {
                return await this.clients.balanceOf('wagmi', getAddress(this.contractAddress))
            }

            return await this.clients.balanceOf('viem', getAddress(this.contractAddress))
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: balance`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: balance`, error.stack)
            throw error
        }
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

    async implementationAddress(): Promise<Address> {
        try {
            this.checkParamsPresence()
            const chainId = this.chain().id
            return await getImplementation(
                getChainById(this.config, chainId) as Chain,
                this.contractAddress,
                getTransportFromConfig(this.config, chainId)
            )
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: implementationAddress`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: implementationAddress`, error.stack)
            throw error
        }
    }

    async getContractType(address: Address): Promise<ContractType> {
        try {
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
     * An Internal method used to check the presence of contract address and abi
     * which is required to be present in some methods
     *
     * @group Internal
     */
    protected checkParamsPresence() {
        if (!this.contractAbi) {
            throw new MissingRequiredParams('Contract Abi')
        }
        if (!this.contractAddress) {
            throw new MissingRequiredParams('Contract Address')
        }
    }

    async upgradeToAndCall(
        newImplementationAddress: Address,
        params?: UpgradeParams | Hex
    ): Promise<ContractInteractionReturnType<WriterReturnType>> {
        try {
            this.checkParamsPresence()

            let callData: any
            let value: any

            if (!params) {
                callData = toHex('')
            }

            if (params && typeof params === 'string') {
                callData = params
            }

            if (params && typeof params === 'object') {
                callData = encodeFunctionData({
                    abi: this.contractAbi,
                    functionName: (params as UpgradeParams).functionName,
                    args: (params as UpgradeParams).args
                })

                value = (params as UpgradeParams).value as bigint
            }

            value = (value as bigint) || 0n

            return await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'upgradeToAndCall',
                args: [getAddress(newImplementationAddress), callData]
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: upgradeToAndCall`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: upgradeToAndCall`, error.stack)
            throw error
        }
    }
}
