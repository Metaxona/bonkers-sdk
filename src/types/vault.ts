import type { Address } from 'viem'
import type {
    BaseParams,
    ChainId,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    Receiver,
    Result
} from './common.js'

/**
 * @category Vault
 * @category Vault Factory
 */
export type VaultInfo = {
    id: string
    /** Implementation version */
    version: string
    /** Project owner and Contract Admin */
    projectOwner: Address
    projectName: string
    rewardToken: Address
    createdAt: Address
    /** Account that deployed the Vault */
    deployer: Address
}

/** @category Vault */
export type ControllerLimits = {
    /** The amount of users or times the controller can give rewards */
    quota: string
    /** The maximum amount of reward tokens the controller is allowed to give away  */
    rewardAllowance: string
}

/** @category Vault */
export type VaultParams = BaseParams

/** @category Vault Factory */
export type VaultFactoryParams = BaseParams

/**
 * Implementation details of the implementation
 * used by factory when generating new contracts
 *
 * @category Vault Factory */
export type ImplementationDetails = {
    implementationAddress: Address
    contractType: ContractType
    version: string
}

/**
 * Creation Fee when creating a new Vault
 *
 * @category Vault
 * @category Vault Factory
 */
export type CreationFee = {
    /** Native Token */
    ethFee: string
    erc20Fee: string
}

/**
 * Interface that ensures all important Vault functions
 * are being implemented which would allow one to interact with
 * the contract with ease
 *
 * @category Vault
 */
export interface IVault {
    /**
     * Method used to change the vault being used by the sdk/class
     *
     * @param chainId
     * @param params
     *
     * @group Params Required
     *
     * @returns
     */
    useNewVault(chainId: ChainId, params: VaultParams): void

    /**
     * Method used to get the params needed to interact with the vault contract
     * using only the chain id and the address
     *
     * @param chainId
     * @param address
     *
     * @group Params Required
     *
     * @returns
     */
    getParams(chainId: ChainId, address: Address): Promise<VaultParams>

    /**
     * Method used to retrieve the type of the contract
     *
     * @group Params Required
     *
     * @returns
     */
    contractType(): Promise<ContractType>

    /**
     * Method used to retrieve the version of the contract
     *
     * @group Params Required
     *
     * @returns
     */
    version(): Promise<ContractVersion>

    /**
     * Method used to retrieve the vault information which includes
     *
     * - Id
     * - Version
     * - Project Owner
     * - Project Name
     * - Reward Token
     * - Deployer
     * - Creation Date
     *
     * @group Params Required
     *
     * @returns
     */
    getVaultInfo(): Promise<VaultInfo>

    /**
     * Method used to check the reward pool left for the current reward token
     *
     * @group Params Required
     *
     * @returns
     */
    rewardPool(): Promise<bigint>

    /**
     * Method used to check the limits of a controller
     *
     * - Quota
     * - Token Allowance
     *
     * @param controller
     *
     * @group Params Required
     *
     * @returns
     */
    controllerLimits(controller: Address): Promise<ControllerLimits>

    /**
     * Method used to check the default limits of a controller
     * when they are first granted the role using {@link grantPermit}
     *
     * - Quota
     * - Token Allowance
     *
     * @group Params Required
     *
     * @returns
     */
    defaultControllerLimits(): Promise<ControllerLimits>

    /**
     * Method used to check if controller limits is enabled
     *
     * @group Params Required
     *
     * @returns
     */
    controllerLimitsEnabled(): Promise<boolean>

    /**
     * Method used to enable limits for controllers which would
     * prevent them from giving rewards more than they are allowed to
     *
     * @group Params Required
     *
     * @returns
     */
    toggleControllerLimits(): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the limits of a controller,
     * giving them more or less allowance or quota
     *
     * @param controller
     * @param quota
     * @param allowance
     *
     * @group Params Required
     *
     * @returns
     */
    setControllerLimits(
        controller: Address,
        quota: number | bigint,
        allowance: number | bigint
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the quota and allowance
     * when a controller is being granted the role
     *
     * @param quota
     * @param allowance
     *
     * @group Params Required
     *
     * @returns
     */
    setDefaultControllerLimits(
        quota: number | bigint,
        allowance: number | bigint
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the reward token used to reward
     *
     * @param tokenAddress
     *
     * @group Params Required
     *
     * @returns
     */
    updateRewardToken(tokenAddress: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to allow the admin to withdraw tokens from the contract
     *
     * @param tokenAddress
     * @param amount
     *
     * @group Params Required
     *
     * @returns
     */
    withdrawToken(
        tokenAddress: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to transfer vault ownership which would also update the
     * project's owner
     *
     * @param newOwner
     *
     * @group Params Required
     *
     * @returns
     */
    changeVaultOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to send reward to a single user
     *
     * @param to
     * @param amount
     *
     * @group Params Required
     *
     * @returns
     */
    reward(to: Address, amount: number | bigint): Promise<ContractInteractionReturnType<boolean>>

    /**
     * Method used to send rewards to a batch of users
     *
     * @param receivers
     *
     * @group Params Required
     *
     * @returns
     */
    rewardBatch(receivers: Receiver[]): Promise<ContractInteractionReturnType<Result[]>>

    /**
     * Method used to grant an account a controller role allowing them
     * to send reward to other accounts
     *
     * @param controller
     *
     * @group Params Required
     *
     * @returns
     */
    grantPermit(controller: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to revoke an account's controller role preventing
     * them from further sending rewards
     *
     * @param controller
     *
     * @group Params Required
     *
     * @returns
     */
    revokePermit(controller: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to check if an account is a controller or has a controller role
     *
     * @param account
     *
     * @group Params Required
     *
     * @returns
     */
    isController(account: Address): Promise<boolean>
}

/**
 * Interface that ensures all important Vault Factory functions
 * are being implemented which would allow one to interact with
 * the contract with ease
 *
 * @category Vault Factory
 */
export interface IVaultFactory {
    /**
     * Method used to change the vaultFactory being used by the sdk/class
     *
     * @param chainId
     * @param params
     *
     * @group Params Required
     *
     * @returns
     */
    useNewVaultFactory(chainId: ChainId, params: VaultFactoryParams): void

    /**
     * Method used to get the params needed to interact with the vaultFactory contract
     * using only the chain id and the address
     *
     * @param chainId
     * @param address
     *
     * @group Params Required
     *
     * @returns
     */
    getParams(chainId: ChainId, address: Address): Promise<VaultFactoryParams>

    /**
     * Method used to retrieve the type of the contract
     *
     * @group Params Required
     *
     * @returns
     */
    contractType(): Promise<ContractType>

    /**
     * Method used to retrieve the version of the contract
     *
     * @group Params Required
     *
     * @returns
     */
    version(): Promise<ContractVersion>

    /**
     * Method used to retrieve a vault's information which includes
     *
     * - Id
     * - Version
     * - Project Owner
     * - Project Name
     * - Reward Token
     * - Deployer
     * - Creation Date
     *
     * @param vault
     *
     * @group Params Required
     *
     * @returns
     */
    getVaultInfo(vault: Address): Promise<VaultInfo>

    /**
     * Method used to retrieve the implementation details
     * of the implementation used when creating a new vault
     *
     * @group Params Required
     *
     * @returns
     */
    getImplementationDetails(): Promise<ImplementationDetails>

    /**
     * Method used to check the Creation Fee needed when creating a new vault
     * vault factory controller and admin are exempt from these fees
     *
     * @group Params Required
     *
     * @returns
     */
    creationFee(): Promise<CreationFee>

    /**
     * Method used to check the account where the fees are being sent to
     *
     * @group Params Required
     *
     * @returns
     */
    feeReceiver(): Promise<Address>

    /**
     * Method used to check the the total vaults created by the vault
     *
     * @group Params Required
     *
     * @returns
     */
    totalVaults(): Promise<number>

    /**
     * Method used to check the current owner of the factory
     *
     * @group Params Required
     *
     * @returns
     */
    owner(): Promise<Address>

    /**
     * Method used to check which erc20 token is being used to pay for the creation fee
     *
     * @group Params Required
     *
     * @returns
     */
    erc20PaymentToken(): Promise<Address>

    /**
     * Method used to transfer the ownership of the factory
     *
     * @param newOwner
     *
     * @group Params Required
     *
     * @returns
     */
    changeVaultFactoryOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the implementation used when deploying a new vault
     *
     * @param newImplementation
     *
     * @group Params Required
     *
     * @returns
     */
    updateImplementation(newImplementation: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to sync a vault's info to the factory
     *
     * > can only be used by the
     * > - factory controller
     * > - factory admin -> which by default has a controller role
     * > - vault admin/project owner
     *
     * @param vault
     *
     * @group Params Required
     *
     * @returns
     */
    updateVaultInfo(vault: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the address receiving the fees
     *
     * @param newFeeReceiver
     *
     * @group Params Required
     *
     * @returns
     */
    setFeeReceiver(newFeeReceiver: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the token being used as payment when creating a new vault
     *
     * @param newPaymentToken
     *
     * @group Params Required
     *
     * @returns
     */
    setERC20PaymentToken(newPaymentToken: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change amount of token and native token used as payment when creating a new vault
     *
     * @param newETHFee
     * @param newERC20Fee
     *
     * @group Params Required
     *
     * @returns
     */
    updateCreationFee(
        newETHFee: bigint,
        newERC20Fee: bigint
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to create a new vault
     *
     * @param projectOwner
     * @param rewardToken
     * @param projectName
     * @param useTokenForPayment
     *
     * @group Params Required
     *
     * @returns
     */
    createVault(
        projectOwner: Address,
        rewardToken: Address,
        projectName: string,
        useTokenForPayment: boolean
    ): Promise<ContractInteractionReturnType<Address>>

    /**
     * Method used to grant an account a controller role allowing them
     * to send reward to other accounts
     *
     * @param controller
     *
     * @group Params Required
     *
     * @returns
     */
    grantPermit(controller: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to revoke an account's controller role preventing
     * them from further sending rewards
     *
     * @param controller
     *
     * @group Params Required
     *
     * @returns
     */
    revokePermit(controller: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to check if an account is a controller or has a controller role
     *
     * @param account
     *
     * @group Params Required
     *
     * @returns
     */
    isController(account: Address): Promise<boolean>
}
