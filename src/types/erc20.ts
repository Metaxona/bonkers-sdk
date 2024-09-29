import type { Abi, Address, Hex } from 'viem'
import type {
    ContractInteractionReturnType,
    IClientInteraction,
    ReaderParams,
    ReaderReturnType,
    WriterParams,
    WriterReturnType
} from './common.js'

/**
 * Interface that ensures all important Erc20 functions
 * are being implemented which would allow one to interact with
 * the contract with ease
 *
 * @category Erc20 */
export interface IErc20 extends IClientInteraction {
    /**
     * Method used to interact with contracts by reading into them
     * and is used by all Read Enabled Methods for all class extending from
     * the Base class
     *
     * @param params
     * @returns
     */
    reader(params: ReaderParams): Promise<ReaderReturnType>

    /**
     * Method used to interact with contracts by writing into them
     * and is used by all Write Enabled Methods for all class extending from
     * the Base class
     *
     * @param params
     * @returns
     */
    writer(params: WriterParams): Promise<ContractInteractionReturnType<WriterReturnType>>

    /**
     * Method used to set or update the token address being used
     *
     * @returns
     */
    useToken(tokenAddress: Address): this

    /**
     * Method used to change the token abi being used
     *
     * @remarks Make sure the token abi being used has the same
     * methods and implementations as the standard erc20 interface
     * to ensure compatibility
     *
     * @returns
     */
    useAbi(tokenAbi: Abi): this

    /**
     * Method used to retrieve the token's name
     *
     * @group Params Required
     *
     * @remarks Possible to not exist in a standard erc20 contract since
     * this is an optional feature
     *
     * @returns
     */
    name(): Promise<string>

    /**
     * Method used to retrieve the token's symbol
     *
     * @group Params Required
     *
     * @remarks Possible to not exist in a standard erc20 contract since
     * this is an optional feature
     *
     * @returns
     */
    symbol(): Promise<string>

    /**
     * Method used to retrieve the token's decimals
     *
     * @group Params Required
     *
     * @remarks Possible to not exist in a standard erc20 contract since
     * this is an optional feature
     *
     * @returns
     */
    decimals(): Promise<number>

    /**
     * Method used to retrieve the token's total supply
     *
     * @group Params Required
     *
     * @returns
     */
    totalSupply(): Promise<bigint>

    /**
     * Method used to retrieve the amount of tokens a spender was allowed
     * by the owner to spend on their behalf
     *
     * @group Params Required
     *
     * @returns
     */
    allowance(owner: Address, spender: Address): Promise<bigint>

    /**
     * Method used to retrieve the token balance of an account
     *
     * @group Params Required
     *
     * @returns
     */
    balanceOf(account: Address): Promise<bigint>

    /**
     * Method used to approve a spender a certain amount of tokens to spend on
     * their behalf
     *
     * @group Params Required
     *
     * @returns
     */
    approve(spender: Address, amount: number | bigint): Promise<ContractInteractionReturnType<Hex>>

    /**
     * Method used to transfer a certain amount of owned tokens to another account
     *
     * @group Params Required
     *
     * @returns
     */
    transfer(to: Address, amount: number | bigint): Promise<ContractInteractionReturnType<Hex>>

    /**
     * Method used to transfer a certain amount of owned tokens to another account
     * on behalf of the owner
     *
     * @group Params Required
     *
     * @returns
     */
    transferFrom(
        from: Address,
        to: Address,
        amount: number | bigint
    ): Promise<ContractInteractionReturnType<Hex>>
}
