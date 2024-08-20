import { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, describe, expect, it, test } from 'vitest'
import { MissingRequiredParams } from '../../src/utils'
import {
    clientAndContractSetup,
    CONTROLLER_ADMIN,
    controllerImplementation_artifacts,
    generateNewImplementation,
    testClient,
    TestVars,
    VAULT_ADMIN,
    VAULT_IMPLEMENTATION_ADDRESS,
    vaultImplementation_artifacts
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
        expect(vars.serverVaultNoParams.contractAddress).to.be.undefined
        expect(vars.serverVaultNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    test.todo('Upgrade To And Call', async () => {
        const oldImplementation = await vars.serverVaultInstance.implementationAddress()
        const newImplementation = await generateNewImplementation(
            vaultImplementation_artifacts as any
        )
        expect(oldImplementation).to.not.eq(newImplementation)

        expect(oldImplementation).to.eq(VAULT_IMPLEMENTATION_ADDRESS)

        // expect(
        //     async () => await vars.serverVaultNoParams.upgradeToAndCall(oldImplementation)
        // ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect((await vars.serverVaultInstance.getVaultInfo()).projectOwner).to.be.eq(VAULT_ADMIN)
        expect(vars.serverVaultInstance.account()).to.be.eq(VAULT_ADMIN)

        console.log(VAULT_ADMIN)
        console.log(vars.serverVaultInstance.account())

        await vars.serverVaultInstance.upgradeToAndCall(newImplementation)

        // await vars.serverVaultInstance.upgradeToAndCall(newImplementation, {functionName: "setFeeReceiver", args: [CONTROLLER_FEE_RECEIVER]})

        const implementationAfter = await vars.serverVaultInstance.implementationAddress()
        expect(implementationAfter).to.eq(newImplementation)

        // await vars.serverVaultInstance.upgradeToAndCall(oldImplementation, {functionName: "version"})
        // const implementationAfter2 = await vars.serverVaultInstance.implementationAddress()
        // expect(implementationAfter2).to.not.eq(oldImplementation)
    })

    test.todo('Upgrade To And Call', async () => {
        const oldImplementation = await vars.serverControllerInstance.implementationAddress()
        const newImplementation = await generateNewImplementation(
            controllerImplementation_artifacts as any
        )
        expect(oldImplementation).to.not.eq(newImplementation)

        expect(
            async () => await vars.serverControllerNoParams.upgradeToAndCall(oldImplementation)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.serverControllerInstance.owner()).to.be.eq(CONTROLLER_ADMIN)
        expect(vars.serverControllerInstance.account()).to.be.eq(CONTROLLER_ADMIN)

        console.log(CONTROLLER_ADMIN)
        console.log(vars.serverControllerInstance.account())

        await vars.serverControllerInstance.upgradeToAndCall(newImplementation as Address)

        // await vars.serverControllerInstance.upgradeToAndCall(newImplementation, {functionName: "setFeeReceiver", args: [CONTROLLER_FEE_RECEIVER]})

        const implementationAfter = await vars.serverControllerInstance.implementationAddress()
        expect(implementationAfter).to.eq(newImplementation)

        // await vars.serverControllerInstance.upgradeToAndCall(oldImplementation, {functionName: "version"})
        // const implementationAfter2 = await vars.serverControllerInstance.implementationAddress()
        // expect(implementationAfter2).to.not.eq(oldImplementation)
    })
})
