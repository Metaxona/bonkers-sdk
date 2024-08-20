import { Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import {
    clientAndContractSetup,
    resetClientConnection,
    testClient,
    TestVars
} from '../common/utils'

describe('Upgrade Contract Test', () => {
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
        expect(vars.clientVaultNoParams.contractAddress).to.be.undefined
        expect(vars.clientVaultNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    test.todo('Upgrade To And Call', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        await resetClientConnection(vars.clientVaultInstance)
    })
})
