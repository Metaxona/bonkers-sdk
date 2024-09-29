import { type Address, getAddress } from 'viem'
import type {
    ChainId,
    Config,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    ControllerLimits,
    IVault,
    Receiver,
    Result,
    VaultInfo,
    VaultParams
} from '../types/index.js'
import { deepStringifyBigInts } from '../utils/index.js'
import Base from './base.js'

const CLASS_NAME = 'Vault'

/**
 *
 * @category Vault
 */
export default class Vault extends Base implements IVault {
    constructor(config: Config, params?: VaultParams) {
        super(config, params)

        this.logger.info({
            mode: this.mode,
            from: 'Vault',
            status: 'Initialized'
        })
    }

    useNewVault(chainId: ChainId, params: VaultParams) {
        this.logger.info(`Vault Changed To: ${params.address}`)
        this._changeBase(chainId, params)
        return this
    }

    async getParams(chainId: ChainId, address: Address) {
        return await this._getParams(chainId, address, 'VAULT')
    }

    async contractType(): Promise<ContractType> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'contractType'
            })

            return result as unknown as ContractType
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

    async getVaultInfo(): Promise<VaultInfo> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'getVaultInfo'
            })

            return deepStringifyBigInts(result as unknown as VaultInfo)
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: vaultInfo`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: vaultInfo`, error.stack)
            throw error
        }
    }

    async rewardPool(): Promise<bigint> {
        try {
            this.checkParamsPresence()

            return (await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'rewardPool'
            })) as unknown as bigint
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: rewardPool`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: rewardPool`, error.stack)
            throw error
        }
    }

    async controllerLimits(controller: Address): Promise<ControllerLimits> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'controllerLimits',
                args: [getAddress(controller)]
            })

            return deepStringifyBigInts({
                quota: (result as unknown[])[0],
                rewardAllowance: (result as unknown[])[1]
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: controllerLimits`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: controllerLimits`, error.stack)
            throw error
        }
    }

    async defaultControllerLimits(): Promise<ControllerLimits> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'defaultControllerLimits'
            })

            return deepStringifyBigInts({
                quota: (result as unknown[])[0],
                rewardAllowance: (result as unknown[])[1]
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: defaultControllerLimits`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: defaultControllerLimits`, error.stack)
            throw error
        }
    }

    async controllerLimitsEnabled(): Promise<boolean> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'controllerLimitsEnabled'
            })

            return result as boolean
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: controllerLimitsEnabled`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: controllerLimitsEnabled`, error.stack)
            throw error
        }
    }

    async toggleControllerLimits(): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'toggleControllerLimits'
            })

            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: toggleControllerLimits`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: toggleControllerLimits`, error.stack)
            throw error
        }
    }

    async setControllerLimits(
        controller: Address,
        quota: number | bigint,
        allowance: number | bigint
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'setControllerLimits',
                args: [getAddress(controller), quota, allowance]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: setControllerLimits`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: setControllerLimits`, error.stack)
            throw error
        }
    }
    async setDefaultControllerLimits(
        quota: number | bigint,
        allowance: number | bigint
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'setDefaultControllerLimits',
                args: [quota, allowance]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: setDefaultControllerLimits`,
                error.name,
                error.message
            )
            this.logger.trace(
                `FROM: ${CLASS_NAME} Function: setDefaultControllerLimits`,
                error.stack
            )
            throw error
        }
    }

    async updateRewardToken(tokenAddress: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'updateRewardToken',
                args: [getAddress(tokenAddress)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: updateRewardToken`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: updateRewardToken`, error.stack)
            throw error
        }
    }

    async withdrawToken(
        tokenAddress: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'withdrawToken',
                args: [getAddress(tokenAddress), amount]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: withdrawToken`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: withdrawToken`, error.stack)
            throw error
        }
    }

    async changeVaultOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'changeVaultOwner',
                args: [getAddress(newOwner)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: changeVaultOwner`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: changeVaultOwner`, error.stack)
            throw error
        }
    }

    async reward(
        to: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<boolean>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'reward',
                args: [getAddress(to), amount]
            })
            return { status, result: result as unknown as boolean, txHash, receipt }
        } catch (error: any) {
            this.logger.error(`FROM: ${CLASS_NAME} Function: reward`, error.name, error.message)
            this.logger.trace(`FROM: ${CLASS_NAME} Function: reward`, error.stack)
            throw error
        }
    }

    async rewardBatch(receivers: Receiver[]): Promise<ContractInteractionReturnType<Result[]>> {
        try {
            this.checkParamsPresence()

            const { status, result, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'rewardBatch',
                args: [
                    receivers.map((receiver) => ({
                        receiver: getAddress(receiver.receiver),
                        amount: receiver.amount
                    }))
                ]
            })

            return { status, result: result as unknown as Result[], txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: rewardBatch`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: rewardBatch`, error.stack)
            throw error
        }
    }

    async grantPermit(controller: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'grantPermit',
                args: [getAddress(controller)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: grantPermit`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: grantPermit`, error.stack)
            throw error
        }
    }

    async revokePermit(controller: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'revokePermit',
                args: [getAddress(controller)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: revokePermit`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: revokePermit`, error.stack)
            throw error
        }
    }

    async isController(account: Address): Promise<boolean> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'isController',
                args: [getAddress(account)]
            })
            return result as unknown as boolean
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: isController`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: isController`, error.stack)
            throw error
        }
    }
}
