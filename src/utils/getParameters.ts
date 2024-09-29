import {
    type Address,
    type Chain,
    createPublicClient,
    type CustomTransport,
    type EIP1193RequestFn,
    type FallbackTransport,
    getAddress,
    http,
    type HttpTransport,
    type PublicClient,
    type Transport,
    type WebSocketTransport
} from 'viem'
import { abis, baseAbi } from '../abi/index.js'
import type {
    BaseParams,
    ContractType,
    ContractVersion,
    FormattedContractType
} from '../types/index.js'
import { reader } from './contractInteraction.js'
import { ContractAbiNotFound, InvalidContract, InvalidContractType } from './errors.js'

/**
 * A helper function that retrieves existing abi from the library
 * of a given address automatically with verification for:
 *
 * - Contract existence in the given chain
 * - Contract type matching the expected contract type
 * - Existence of the Abi For the contract version
 *
 * @throws {@link InvalidContract} if a valid contract is not found on that chain
 * will contain any other errors including the contract type not matching error and
 * abi not found in the given pattern below
 *
 * `Failed To Verify Contract Existence On ${chain.name} Chain | Cause: ${error.message}`
 *
 * @throws {@link InvalidContractType} if the contract type and expected type does not match
 * @throws {@link ContractAbiNotFound} if there are no abi in the sdk for that contract's version
 *
 * @category Utils
 */
export async function getParameters(
    {
        chain,
        address,
        expectedType
    }: {
        chain: Chain
        address: Address
        expectedType: ContractType
    },
    transport?:
        | Transport<string, Record<string, any>, EIP1193RequestFn>
        | HttpTransport
        | WebSocketTransport
        | CustomTransport
        | FallbackTransport
): Promise<BaseParams> {
    try {
        const publicClient = createPublicClient({
            chain: chain,
            transport: transport || http()
        }) as PublicClient

        const [contractType, contractVersion] = await Promise.all([
            (await reader(publicClient, {
                address: getAddress(address),
                abi: baseAbi,
                functionName: 'contractType'
            })) as ContractType,
            (await reader(publicClient, {
                address: getAddress(address),
                abi: baseAbi,
                functionName: 'version'
            })) as ContractVersion
        ])

        if (expectedType !== contractType) {
            throw new InvalidContractType('Contract Type and Expected Contract Type Does Not Match')
        }

        const formattedContractType = contractType
            .split(' ')
            .map((item: string, index: number) => {
                if (index === 0) {
                    return item.toLowerCase()
                }
                const n = item.toLowerCase()
                return n.charAt(0).toUpperCase() + n.slice(1)
            })
            .join('') as FormattedContractType

        const abi = abis[formattedContractType][contractVersion]

        if (abi === undefined) {
            throw new ContractAbiNotFound(
                `Contract Abi Not Found In The SDK for ${contractType} version ${contractVersion}, Please Provide it Manually`
            )
        }

        return { address: getAddress(address), abi: abi }
    } catch (error: any) {
        throw new InvalidContract(
            `Failed To Verify Contract Existence On ${chain.name} Chain | Cause: ${error.message}`
        )
    }
}
