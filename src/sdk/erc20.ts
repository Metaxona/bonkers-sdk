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
    erc20Abi,
    type Hex,
    type ReadContractParameters as ViemReadContractParameters
} from 'viem'
import type {
    ChainId,
    ChainReturnType,
    Config,
    ConnectCallback,
    ConnectionState,
    ContractInteractionReturnType,
    IErc20,
    Mode,
    ReaderParams,
    ReaderReturnType,
    SwitchAccountCallback,
    SwitchChainCallback,
    WriterParams,
    WriterReturnType
} from '../types/index.js'
import {
    ContractInteractionFailed,
    getChains,
    InvalidSDKMode,
    type Logger,
    MissingRequiredParams,
    prepareConfig
} from '../utils/index.js'
import { clients, type Clients } from './clients.js'

const CLASS_NAME = 'ERC20'

/** @category Erc20 */
export default class Erc20 implements IErc20 {
    readonly mode: Mode
    readonly config: Config

    tokenAddress: Address
    tokenAbi: Abi

    private logger: Logger
    private clients: Clients

    constructor(config: Config, tokenAddress?: Address) {
        this.config = prepareConfig(config)
        this.mode = this.config.mode
        this.logger = this.config.logger as Logger
        this.clients = clients

        this.tokenAddress = (tokenAddress || undefined) as Address
        this.tokenAbi = erc20Abi
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
                from: 'ERC20',
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
                from: 'ERC20',
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

    useToken(tokenAddress: Address) {
        this.tokenAddress = tokenAddress
        return this
    }

    useAbi(tokenAbi: Abi) {
        this.tokenAbi = tokenAbi
        return this
    }

    protected hasTokenAddress() {
        return this.tokenAddress !== undefined
    }

    async name() {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'name'
            })) as string
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: name`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: name`, error.stack)
            throw error
        }
    }

    async symbol() {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'symbol'
            })) as string
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: symbol`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: symbol`, error.stack)
            throw error
        }
    }

    async decimals() {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'decimals'
            })) as number
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: decimals`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: decimals`, error.stack)
            throw error
        }
    }

    async balanceOf(account: Address) {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'balanceOf',
                args: [account]
            })) as bigint
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: balanceOf`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: balanceOf`, error.stack)
            throw error
        }
    }

    async allowance(owner: Address, spender: Address) {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'allowance',
                args: [owner, spender]
            })) as bigint
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: allowance`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: allowance`, error.stack)
            throw error
        }
    }

    async approve(spender: Address, amount: number | bigint) {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return await this.writer({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'approve',
                args: [spender, amount]
            })
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: approve`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: approve`, error.stack)
            throw error
        }
    }

    async transfer(to: Address, amount: number | bigint) {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return await this.writer({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'transfer',
                args: [to, amount]
            })
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: transfer`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: transfer`, error.stack)
            throw error
        }
    }

    async transferFrom(from: Address, to: Address, amount: number | bigint) {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return await this.writer({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'transferFrom',
                args: [from, to, amount]
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: transferFrom`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: transferFrom`, error.stack)
            throw error
        }
    }

    async totalSupply() {
        try {
            if (!this.hasTokenAddress()) {
                throw new MissingRequiredParams('Token Address')
            }

            return (await this.reader({
                address: this.tokenAddress,
                abi: this.tokenAbi,
                functionName: 'totalSupply'
            })) as bigint
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: totalSupply`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: totalSupply`, error.stack)
            throw error
        }
    }
}
