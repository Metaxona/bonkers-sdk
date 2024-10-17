import type { Address, Hex, SignableMessage, TypedData } from 'viem'

/** @category Signature */
export type Domain = {
    name: string
    version: string
    chainId?: number
    verifyingContract?: Address
}

/**
 *
 * @category Signature
 *
 * @example
 * ```
 * {
 *    domain: {
 *        name: 'Ether Mail',
 *        version: '1',
 *        chainId: 1,
 *        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
 *    },
 *    types: {
 *        Person: [
 *        { name: 'name', type: 'string' },
 *        { name: 'wallet', type: 'address' },
 *        ],
 *        Mail: [
 *        { name: 'from', type: 'Person' },
 *        { name: 'to', type: 'Person' },
 *        { name: 'contents', type: 'string' },
 *        ],
 *    },
 *    primaryType: 'Mail',
 *    message: {
 *        from: {
 *        name: 'Cow',
 *        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
 *        },
 *        to: {
 *        name: 'Bob',
 *        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *        },
 *        contents: 'Hello, Bob!',
 *    },
 *    }
 *  ```
 */
export type TypedDataParams = {
    domain?: Domain
    types: TypedData
    primaryType: string
    message: Record<string, any>
}

/**
 * Interface to ensure all important Signature functions are being
 * implemented which would allow signing, verifying, hashing messages
 * or typed data which allows for another way of authentication using
 * externally owned accounts
 *
 * @category Signature
 */
export interface ISignature {
    /**
     * Message to sign
     */
    message: SignableMessage | undefined

    /**
     * Typed data to sign
     */
    typedData: TypedDataParams | undefined

    /**
     * Method used to set the message to sign, verify and hash
     *
     * @param message
     *
     * @returns
     */
    setMessage(message: SignableMessage): this

    /**
     * Method used to set the typed data to sign, verify and hash
     *
     * @param param
     *
     * @returns
     */
    setTypedData(param: TypedDataParams): this

    /**
     * Method used to sign a message using an Externally Owned Account
     *
     * @group Message Required
     *
     * @returns
     */
    signMessage(): Promise<Hex>

    /**
     * Method used to sign a typed data using an Externally Owned Account
     *
     * @group Typed Data Required
     *
     * @returns
     */
    signTypedData(): Promise<Hex>

    /**
     * Method used to verify a signed message
     *
     * @param signature
     * @param signer the address who signed the message
     *
     * @group Message Required
     *
     * @returns
     */
    verifyMessage(signature: Hex, signer?: Address): Promise<boolean>

    /**
     * Method used to verify a signed typed data
     *
     * @param signature
     * @param signer the address who signed the typed data
     *
     * @group Typed Data Required
     *
     * @returns
     */
    verifyTypedData(signature: Hex, signer?: Address): Promise<boolean>

    /**
     * Method used to recover the signer address from a signed message
     *
     * @param signature
     *
     * @group Message Required
     *
     * @returns
     */
    recoverMessageAddress(signature: Hex): Promise<Address>

    /**
     * Method used to recover the signer address from a signed typed data
     *
     * @param signature
     *
     * @group Typed Data Required
     *
     * @returns
     */
    recoverTypedDataAddress(signature: Hex): Promise<Address>

    /**
     * Method used to get the hashed version of a message
     *
     * @group Message Required
     *
     * @returns
     */
    hashMessage(): Hex

    /**
     * Method used to get the hashed version of a typed data
     *
     * @group Typed Data Required
     *
     * @returns
     */
    hashTypedData(): Hex
}
