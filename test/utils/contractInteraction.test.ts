import { Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { baseAbi } from '../../src/abi'
import { reader } from '../../src/utils/contractInteraction'
import { clientAndContractSetup, publicClient, testClient, TestVars } from '../common/utils'

describe('Contract Interactions Test', () => {
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

    it('Reader', async () => {
        const contractType = await reader(publicClient, {
            address: vars.controller,
            abi: baseAbi,
            functionName: 'contractType'
        })

        expect(contractType).to.be.eq('CONTROLLER')
    })

    it('Reader Throw', async () => {
        expect(async () => {
            await reader(publicClient, {
                address: vars.controller,
                abi: baseAbi,
                functionName: 'contractTypeRandomFailSimulation'
            })
        }).rejects.toThrow()
    })
})
