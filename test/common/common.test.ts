import { Address, encodeFunctionData, erc20Abi, Hex, hexToBigInt, parseEther } from 'viem'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Call3, Result } from '../../src/types'
import { reader } from '../../src/utils/contractInteraction'
import multicall3 from '../contracts/0_0_1/Multicall3.sol/Multicall3.json'
import {
    clientAndContractSetup,
    MULTICALL3_ADDRESS,
    publicClient,
    testClient,
    TestVars
} from './utils'

describe('Global Setup Common Test', () => {
    let vars: TestVars
    let snapshot: Hex

    beforeAll(async () => {
        vars = await clientAndContractSetup()
        snapshot = await testClient.snapshot()
    })

    beforeEach(async () => {
        await testClient.revert({
            id: snapshot
        })
    })

    afterEach(async () => {})

    it('Deployments', async () => {
        expect(await testClient.getCode({ address: MULTICALL3_ADDRESS })).eq(
            (multicall3 as any).deployedBytecode.object as Hex
        )

        expect(vars.devToken).to.be.not.undefined
        expect(vars.controller).to.be.not.undefined
        expect(vars.vault).to.be.not.undefined
        expect(vars.vaultFactory).to.be.not.undefined
    })

    it('DEV TOKEN', async () => {
        expect(
            await reader(publicClient, {
                abi: erc20Abi,
                address: vars.devToken,
                functionName: 'name'
            })
        ).to.be.eq('DevToken')
        expect(
            await reader(publicClient, {
                abi: erc20Abi,
                address: vars.devToken,
                functionName: 'symbol'
            })
        ).to.be.eq('DEV')
        expect(
            await reader(publicClient, {
                abi: erc20Abi,
                address: vars.devToken,
                functionName: 'decimals'
            })
        ).to.be.eq(18)
        const result = await reader(publicClient, {
            abi: erc20Abi,
            address: vars.devToken,
            functionName: 'totalSupply'
        })
        expect(result).to.be.eq(parseEther('1000000000000'))
    })

    it('Multicall 3', async () => {
        const calldata: Call3[] = Array(3).fill({
            target: vars.devToken,
            allowFailure: false,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        })

        const result = (await testClient.readContract({
            address: MULTICALL3_ADDRESS as Address,
            abi: multicall3.abi,
            functionName: 'aggregate3',
            args: [calldata]
        })) as unknown as Result[]

        result.forEach((returnData) => {
            expect(returnData.success).to.be.true
            expect(hexToBigInt(returnData.returnData)).to.be.eq(parseEther('1000000000000'))
        })
    })
})
