import { Address, encodeFunctionData, Hex } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getParameters, InvalidContract } from '../../src/utils'
import {
    clientAndContractSetup,
    CONTROLLER_ADMIN,
    CONTROLLER_FEE_RECEIVER,
    CONTROLLER_INITIAL_BOT,
    testClient,
    TestVars
} from '../common/utils'
import proxy from '../contracts/0_0_1/ERC1967Proxy.sol/ERC1967Proxy.json'
import mockController_0_0_1_mock from '../contracts/mocks/ControllerImplementation.sol/ControllerImplementation.json'

describe('Get Parameters Test', () => {
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

    it('Get Parameters', async () => {
        const params = await getParameters({
            address: vars.controller,
            chain: anvil,
            expectedType: 'CONTROLLER'
        })

        expect(params.address).to.be.eq(vars.controller)
        expect(params.abi?.length).to.be.gt(0)

        const params2 = await getParameters({
            address: vars.vault,
            chain: anvil,
            expectedType: 'VAULT'
        })

        expect(params2.address).to.be.eq(vars.vault)
        expect(params2.abi?.length).to.be.gt(0)

        const params3 = await getParameters({
            address: vars.vaultFactory,
            chain: anvil,
            expectedType: 'VAULT FACTORY'
        })

        expect(params3.address).to.be.eq(vars.vaultFactory)
        expect(params3.abi?.length).to.be.gt(0)
    })

    it('Get Parameter non Type Address', async () => {
        expect(
            async () =>
                await getParameters({
                    address: CONTROLLER_ADMIN,
                    chain: anvil,
                    expectedType: 'VAULT'
                })
        ).rejects.toThrow()
    })

    it('Get Parameter Invalid Contract Type', async () => {
        const errorMessage = 'Contract Type and Expected Contract Type Does Not Match'

        expect(
            async () =>
                await getParameters({
                    address: vars.controller,
                    chain: anvil,
                    expectedType: 'VAULT'
                })
        ).rejects.toThrowError(
            new InvalidContract(
                `Failed To Verify Contract Existence On ${anvil.name} Chain | Cause: ${errorMessage}`
            )
        )

        const errorMessage2 = 'Failed To Execute Read on: contractType'

        expect(
            async () =>
                await getParameters({
                    address: vars.controller,
                    chain: sepolia,
                    expectedType: 'VAULT'
                })
        ).rejects.toThrowError(
            new InvalidContract(
                `Failed To Verify Contract Existence On ${sepolia.name} Chain | Cause: ${errorMessage2}`
            )
        )
    })

    it('Get Parameter Invalid Version', async () => {
        const implementationHash = await testClient.deployContract({
            abi: mockController_0_0_1_mock.abi,
            bytecode: mockController_0_0_1_mock.bytecode.object as Hex
        })
        const implementationTx = await testClient.waitForTransactionReceipt({
            hash: implementationHash
        })

        const hash = await testClient.deployContract({
            abi: proxy.abi,
            bytecode: proxy.bytecode.object,
            args: [
                implementationTx.contractAddress,
                encodeFunctionData({
                    abi: mockController_0_0_1_mock.abi,
                    functionName: 'initialize',
                    args: [CONTROLLER_ADMIN, CONTROLLER_FEE_RECEIVER, CONTROLLER_INITIAL_BOT]
                })
            ]
        } as any)

        const tx = await testClient.waitForTransactionReceipt({ hash: hash })

        const controller = tx.contractAddress

        expect(
            async () =>
                await getParameters({
                    address: controller as Address,
                    chain: anvil,
                    expectedType: 'CONTROLLER'
                })
        ).rejects.toThrowError(
            new InvalidContract(
                `Failed To Verify Contract Existence On ${anvil.name} Chain | Cause: Contract Abi Not Found In The SDK for CONTROLLER version 0.0.1-mock, Please Provide it Manually`
            )
        )
    })
})
