import type { Address, Hex } from 'viem'
import type {
    BaseParams,
    ChainId,
    ContractInteractionReturnType,
    ContractType,
    Receiver,
    Result
} from './common.js'

/** @category Controller */
export type ControllerParams = BaseParams

/** @category Controller */
export enum ControllerRole {
    BOT = 0,
    CALLER = 1,
    ERC = 2
}

/** @category Controller */
export type Call3 = {
    target: Address
    allowFailure: boolean
    callData: Hex
}

/** @category Controller */
export type Call3Value = {
    target: Address
    allowFailure: boolean
    value: number | bigint
    callData: Hex
}

/**
 * Interface that ensures all important Controller functions
 * are being implemented which would allow one to interact with
 * the contract with ease
 *
 * @category Controller
 */
export interface IController {
    /**
     * Method used to change the controller being used by the sdk/class
     *
     * @param chainId
     * @param params
     *
     * @group Params Required
     *
     * @returns
     */
    useNewController(chainId: ChainId, params: ControllerParams): void

    /**
     * Method used to get the params needed to interact with the controller contract
     * using only the chain id and the address
     *
     * @param chainId
     * @param address
     *
     * @group Params Required
     *
     * @returns
     */
    getParams(chainId: ChainId, address: Address): Promise<ControllerParams>

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
    version(): Promise<string>

    /**
     * Method used to retrieve the current owner of the contract
     *
     * @group Params Required
     *
     * @returns
     */
    owner(): Promise<Address>

    /**
     * Method used to retrieve the current multicall3 address being used by the contract
     *
     * @group Params Required
     *
     * @returns
     */
    multicallAddress(): Promise<Address>

    /**
     * Method used to retrieve the current fee receiver address being used by the contract
     *
     * @group Params Required
     *
     * @returns
     */
    feeReceiver(): Promise<Address>

    /**
     * Method used to call another contract in a more general way using solidity low level call
     *
     * @param targetContract
     * @param callData
     * @returns
     */
    call(targetContract: Address, callData: Hex): Promise<ContractInteractionReturnType<Hex>>

    /**
     * Method used to batch calls to another contract in a more general way
     * using multicall3
     *
     * @group Params Required
     *
     * @param calls
     * @returns
     */
    callBatch(calls: Call3[]): Promise<ContractInteractionReturnType<Result[]>>

    /**
     * Method used to batch calls to another contract in a more general way
     * using multicall3 but with values attached to each call
     *
     * @group Params Required
     *
     * @param calls
     * @returns
     */
    callBatchValue(calls: Call3Value[]): Promise<ContractInteractionReturnType<Result[]>>

    /**
     * Method used to transfer ERC20 tokens owned by the contract to a specified receiver
     *
     * @group Params Required
     *
     * @param tokenAddress
     * @param receiver
     * @param amount
     * @returns
     */
    transferERC20Token(
        tokenAddress: Address,
        receiver: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the multicall3 address being used by the contract
     *
     * @group Params Required
     *
     * @param newMulticallAddress
     * @returns
     */
    setMulticallAddress(newMulticallAddress: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the fee receiver address being used by the contract
     *
     * @group Params Required
     *
     * @param newFeeReceiver
     * @returns
     */
    setFeeReceiver(newFeeReceiver: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to change the owner of the contract
     *
     * @group Params Required
     *
     * @param newOwner
     * @returns
     */
    changeControllerOwner(newOwner: Address): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to grant an account roles that has access to restricted functions
     * in the contract
     *
     * @group Params Required
     *
     * @param role
     * @param account
     * @returns
     */
    addControllerRole(
        role: ControllerRole,
        account: Address
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to remove account roles that has access to restricted functions
     * in the contract preventing them from further accessing those functions again
     *
     * @group Params Required
     *
     * @param role
     * @param account
     * @returns
     */
    removeControllerRole(
        role: ControllerRole,
        account: Address
    ): Promise<ContractInteractionReturnType<void>>

    /**
     * Method used to check if an account has a specific role used to access certain
     * restricted functions
     *
     * @group Params Required
     *
     * @param role
     * @param account
     * @returns
     */
    hasControllerRole(role: ControllerRole, account: Address): Promise<boolean>

    /**
     * Method used to send a reward from a vault to a receiver without a direct wallet to vault
     * interaction
     *
     * @group Params Required
     *
     * @param targetVault the vault being used to reward the receiver
     * @param to reward receiver
     * @param amount amount of tokens to reward
     *
     * @returns
     */
    vaultReward(
        targetVault: Address,
        to: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<boolean>>

    /**
     * Method used to send a reward in batch from a vault to a receiver without a direct wallet to vault
     * interaction
     *
     * @group Params Required
     *
     * @param targetVault the vault being used to reward the receivers
     * @param receivers a list of receivers and amounts to send
     *
     * @returns
     */
    vaultRewardBatch(
        targetVault: Address,
        receivers: Receiver[]
    ): Promise<ContractInteractionReturnType<Result[]>>

    /**
     * Method used to create a new vault which is exempted from the fee
     * only if the controller contract is a controller on the vault factory
     * side
     *
     * @group Params Required
     *
     * @param targetVaultFactory
     * @param projectOwner
     * @param rewardToken
     * @param projectName
     */
    createVault(
        targetVaultFactory: Address,
        projectOwner: Address,
        rewardToken: Address,
        projectName: string
    ): Promise<ContractInteractionReturnType<Address>>
}
