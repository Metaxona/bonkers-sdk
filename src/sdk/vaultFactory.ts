import { getAddress, type Address } from 'viem'
import type {
    ChainId,
    Config,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    CreationFee,
    ImplementationDetails,
    IVaultFactory,
    VaultFactoryParams,
    VaultInfo
} from '../types/index.js'
import { deepStringifyBigInts } from '../utils/index.js'
import Base from './base.js'

const CLASS_NAME = 'VaultFactory'

/**
 *
 * @category Vault Factory
 */
export default class VaultFactory extends Base implements IVaultFactory {
    constructor(config: Config, params?: VaultFactoryParams) {
        super(config, params)

        this.logger.info({
            mode: this.mode,
            from: 'Vault Factory',
            status: 'Initialized'
        })
    }

    useNewVaultFactory(chainId: ChainId, params: VaultFactoryParams) {
        this.logger.info(`Vault Factory Changed To: ${params.address}`)
        this._changeBase(chainId, params)
        return this
    }

    async getParams(chainId: ChainId, address: Address) {
        return await this._getParams(chainId, address, 'VAULT FACTORY')
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

    async getVaultInfo(vault: Address): Promise<VaultInfo> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'getVaultInfo',
                args: [getAddress(vault)]
            })

            return deepStringifyBigInts(result as unknown as VaultInfo)
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: getVaultInfo`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: getVaultInfo`, error.stack)
            throw error
        }
    }

    async getImplementationDetails(): Promise<ImplementationDetails> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'getImplementationDetails'
            })

            return {
                implementationAddress: (result as unknown[])[0] as Address,
                contractType: (result as unknown[])[1] as ContractType,
                version: (result as unknown[])[2] as string
            }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: getImplementationDetails`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: getImplementationDetails`, error.stack)
            throw error
        }
    }

    async creationFee(): Promise<CreationFee> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'creationFee'
            })

            return deepStringifyBigInts({
                ethFee: (result as unknown[])[0],
                erc20Fee: (result as unknown[])[1]
            } as CreationFee)
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: creationFee`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: creationFee`, error.stack)
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

    async totalVaults(): Promise<number> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'totalVaults'
            })

            return Number(result as bigint)
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: totalVaults`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: totalVaults`, error.stack)
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

    async erc20PaymentToken(): Promise<Address> {
        try {
            this.checkParamsPresence()

            const result = await this.reader({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'erc20PaymentToken'
            })

            return result as Address
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: erc20PaymentToken`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: erc20PaymentToken`, error.stack)
            throw error
        }
    }

    async changeVaultFactoryOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'changeVaultFactoryOwner',
                args: [getAddress(newOwner)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: changeVaultFactoryOwner`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: changeVaultFactoryOwner`, error.stack)
            throw error
        }
    }

    async updateImplementation(
        newImplementation: Address
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'updateImplementation',
                args: [getAddress(newImplementation)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: updateImplementation`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: updateImplementation`, error.stack)
            throw error
        }
    }

    async updateVaultInfo(vault: Address): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'updateVaultInfo',
                args: [getAddress(vault)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: updateVaultInfo`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: updateVaultInfo`, error.stack)
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

    async setERC20PaymentToken(
        newPaymentToken: Address
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'setERC20PaymentToken',
                args: [getAddress(newPaymentToken)]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: setERC20PaymentToken`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: setERC20PaymentToken`, error.stack)
            throw error
        }
    }

    async updateCreationFee(
        newETHFee: bigint,
        newERC20Fee: bigint
    ): Promise<ContractInteractionReturnType<void>> {
        try {
            this.checkParamsPresence()

            const { status, txHash, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'updateCreationFee',
                args: [newETHFee, newERC20Fee]
            })
            return { status, txHash, receipt }
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: updateCreationFee`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: updateCreationFee`, error.stack)
            throw error
        }
    }

    async createVault(
        projectOwner: Address,
        rewardToken: Address,
        projectName: string,
        useTokenForPayment: boolean
    ): Promise<ContractInteractionReturnType<Address>> {
        try {
            this.checkParamsPresence()

            const { ethFee } = await this.creationFee()

            const value = useTokenForPayment ? 0n : BigInt(ethFee)

            const { status, txHash, result, receipt } = await this.writer({
                address: getAddress(this.contractAddress),
                abi: this.contractAbi,
                functionName: 'createVault',
                args: [
                    getAddress(projectOwner),
                    getAddress(rewardToken),
                    projectName,
                    useTokenForPayment
                ],
                value: value
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
