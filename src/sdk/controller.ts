import { getAddress, type Address, type Hex } from 'viem'
import type {
    Call3,
    Call3Value,
    ChainId,
    Config,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    ControllerParams,
    ControllerRole,
    IController,
    Receiver,
    Result
} from '../types/index.js'
import Base from './base.js'

const CLASS_NAME = 'Controller'

/**
 *
 * @category Controller
 */
export default class Controller extends Base implements IController {
    constructor(config: Config, params?: ControllerParams) {
        super(config, params)

        this.logger.info({
            mode: this.mode,
            from: 'Controller',
            status: 'Initialized'
        })
    }

    useNewController(chainId: ChainId, params: ControllerParams) {
        this.logger.info(`Controller Changed To: ${params.address}`)
        this._changeBase(chainId, params)
        return this
    }

    async getParams(chainId: ChainId, address: Address) {
        return await this._getParams(chainId, address, 'CONTROLLER')
    }

    async multicallAddress(): Promise<Address> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'multicallAddress'
            })

            return result as Address
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: multicallAddress`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: multicallAddress`, error.stack)
            throw error
        }
    }

    async feeReceiver(): Promise<Address> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'feeReceiver'
            })

            return result as Address
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: feeReceiver`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: feeReceiver`, error.stack)
            throw error
        }
    }

    async contractType(): Promise<ContractType> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'contractType'
            })

            return result as string as ContractType
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: contractType`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: contractType`, error.stack)
            throw error
        }
    }

    async version(): Promise<ContractVersion> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'version'
            })
            return result as string
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: version`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: version`, error.stack)
            throw error
        }
    }

    async owner(): Promise<Address> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'owner'
            })

            return result as Address
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: owner`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: owner`, error.stack)
            throw error
        }
    }

    async hasControllerRole(role: ControllerRole, account: Address): Promise<boolean> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'hasControllerRole',
                args: [role, getAddress(account)]
            })

            return result as boolean
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: hasControllerRole`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: hasControllerRole`, error.stack)
            throw error
        }
    }
    async call(
        targetContract: Address,
        callData: Hex
    ): Promise<ContractInteractionReturnType<Hex>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'call',
                args: [getAddress(targetContract), callData]
            })

            return { status, result, txHash, receipt }
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: call`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: call`, error.stack)
            throw error
        }
    }

    async callBatch(
        calls: Call3[],
        value: number | bigint = 0
    ): Promise<ContractInteractionReturnType<Result[]>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'callBatch',
                args: [
                    calls.map((call) => ({
                        target: getAddress(call.target),
                        allowFailure: call.allowFailure,
                        callData: call.callData
                    }))
                ],
                value: BigInt(value)
            })
            return { status, result: result as unknown as Result[], txHash, receipt }
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: callBatch`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: callBatch`, error.stack)
            throw error
        }
    }

    async callBatchValue(calls: Call3Value[]): Promise<ContractInteractionReturnType<Result[]>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'callBatchValue',
                args: [
                    calls.map((call) => ({
                        target: getAddress(call.target),
                        allowFailure: call.allowFailure,
                        value: call.value,
                        callData: call.callData
                    }))
                ],
                value: BigInt(calls.reduce((acc, curr) => Number(acc) + Number(curr.value), 0))
            })
            return { status, result: result as unknown as Result[], txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: callBatchValue`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: callBatchValue`, error.stack)
            throw error
        }
    }

    async transferERC20Token(
        tokenAddress: Address,
        receiver: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'transferERC20Token',
                args: [getAddress(tokenAddress), getAddress(receiver), amount]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: transferERC20Token`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: transferERC20Token`, error.stack)
            throw error
        }
    }

    async changeControllerOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'changeControllerOwner',
                args: [getAddress(newOwner)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: changeControllerOwner`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: changeControllerOwner`, error.stack)
            throw error
        }
    }

    async addControllerRole(
        role: ControllerRole,
        account: Address
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'addControllerRole',
                args: [role, getAddress(account)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: addControllerRole`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: addControllerRole`, error.stack)
            throw error
        }
    }

    async removeControllerRole(
        role: ControllerRole,
        account: Address
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'removeControllerRole',
                args: [role, getAddress(account)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: removeControllerRole`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: removeControllerRole`, error.stack)
            throw error
        }
    }

    async setFeeReceiver(newFeeReceiver: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'setFeeReceiver',
                args: [getAddress(newFeeReceiver)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: setFeeReceiver`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: setFeeReceiver`, error.stack)
            throw error
        }
    }

    async setMulticallAddress(
        newMulticallAddress: Address
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'setMulticallAddress',
                args: [getAddress(newMulticallAddress)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: setMulticallAddress`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: setMulticallAddress`, error.stack)
            throw error
        }
    }

    // IVault

    async createVault(
        targetVaultFactory: Address,
        projectOwner: Address,
        rewardToken: Address,
        projectName: string
    ): Promise<ContractInteractionReturnType<Address>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'createVault',
                args: [
                    getAddress(targetVaultFactory),
                    getAddress(projectOwner),
                    getAddress(rewardToken),
                    projectName
                ]
            })
            return { status, result: result as Address, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: createVault`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: createVault`, error.stack)
            throw error
        }
    }

    async vaultReward(
        targetVault: Address,
        to: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<boolean>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'vaultReward',
                args: [getAddress(targetVault), getAddress(to), amount]
            })
            return { status: status, result: result as unknown as boolean, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: vaultReward`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: vaultReward`, error.stack)
            throw error
        }
    }

    async vaultRewardBatch(
        targetVault: Address,
        receivers: Receiver[]
    ): Promise<ContractInteractionReturnType<Result[]>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'vaultRewardBatch',
                args: [
                    getAddress(targetVault),
                    receivers.map((receiver) => ({
                        receiver: getAddress(receiver.receiver),
                        amount: receiver.amount
                    }))
                ]
            })
            return { status, result: result as unknown as Result[], txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: vaultRewardBatch`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: vaultRewardBatch`, error.stack)
            throw error
        }
    }
}
