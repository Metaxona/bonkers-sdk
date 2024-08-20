import type { PublicClient, ReadContractParameters as ViemReadContractParameters } from 'viem'
import type { ReaderParams, ReaderReturnType } from '../types/index.js'
import { ContractInteractionFailed } from './errors.js'

/** @category Utils */
export async function reader(
    publicClient: PublicClient,
    params: ReaderParams
): Promise<ReaderReturnType> {
    try {
        const result = await publicClient.readContract(params as ViemReadContractParameters)
        return result
    } catch (error: any) {
        throw new ContractInteractionFailed(`Failed To Execute Read on: ${params.functionName}`, {
            wevm: `${error.name} | ${error.message}`
        })
    }
}
