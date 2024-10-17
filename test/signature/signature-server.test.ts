import { hashMessage, hashTypedData, type Hex } from 'viem'
import { anvil, mainnet } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { TypedDataParams } from '../../src/types'
import { ClientNotFound, MissingRequiredParams } from '../../src/utils'
import {
    CALLER_WALLET,
    clientAndContractSetup,
    DEPLOYER_WALLET,
    testClient,
    type TestVars
} from '../common/utils'
import test from 'node:test'

describe('Signature Server Test', () => {
    let vars: TestVars
    let snapshot: Hex

    const typedData: TypedDataParams = {
        domain: {
            name: 'test 1',
            version: '1'
        },
        types: {
            Test: [{ name: 'name', type: 'string' }]
        },
        primaryType: 'Test',
        message: {
            name: 'Hello'
        }
    }

    const typedData2: TypedDataParams = {
        domain: {
            name: 'test 2',
            version: '1',
            chainId: mainnet.id
        },
        types: {
            Test: [{ name: 'name', type: 'string' }]
        },
        primaryType: 'Test',
        message: {
            name: 'Hi'
        }
    }

    const typedData3: TypedDataParams = {
        domain: {
            name: 'test 3',
            version: '1',
            chainId: anvil.id,
            verifyingContract: DEPLOYER_WALLET
        },
        types: {
            Test: [{ name: 'name', type: 'string' }]
        },
        primaryType: 'Test',
        message: {
            name: 'Hi'
        }
    }

    beforeAll(async () => {
        vars = await clientAndContractSetup()
        snapshot = await testClient.snapshot()
    })

    beforeEach(async () => {
        await testClient.revert({
            id: snapshot
        })
        expect(vars.serverControllerNoParams.contractAddress).to.be.undefined
        expect(vars.serverControllerNoParams.contractAbi).to.be.undefined
        expect(vars.serverControllerInvalidAddress.contractAddress).to.be.not.eq(vars.controller)
    })

    afterEach(async () => {})

    it('Set Message', async () => {
        // sdk
        vars.serverBonkersSDKInstance.signature.setMessage('Hello')
        expect(vars.serverBonkersSDKInstance.signature.message).to.eq('Hello')
        // controller
        vars.serverControllerInstance.signature.setMessage('Hi')
        expect(vars.serverControllerInstance.signature.message).to.eq('Hi')
        // vault
        vars.serverVaultInstance.signature.setMessage('Heh')
        expect(vars.serverVaultInstance.signature.message).to.eq('Heh')
        // vault factory
        vars.serverVaultFactoryInstance.signature.setMessage('Hoh')
        expect(vars.serverVaultFactoryInstance.signature.message).to.eq('Hoh')

        vars.serverBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hello') })
        expect((vars.serverBonkersSDKInstance.signature.message as any).raw).to.eq(
            hashMessage('Hello')
        )
    })

    it('Set Typed Data', async () => {
        // sdk
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        expect(vars.serverBonkersSDKInstance.signature.typedData).to.eq(typedData as any)
        // controller
        vars.serverControllerInstance.signature.setTypedData(typedData2)
        expect(vars.serverControllerInstance.signature.typedData).to.eq(typedData2 as any)
        // vault
        vars.serverVaultInstance.signature.setTypedData(typedData3)
        expect(vars.serverVaultInstance.signature.typedData).to.eq(typedData3 as any)
        // vault factory
        vars.serverVaultFactoryInstance.signature.setTypedData(typedData)
        expect(vars.serverVaultFactoryInstance.signature.typedData).to.eq(typedData as any)
    })

    it('Sign Message', async () => {
        // no params
        vars.serverBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.signMessage()
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))

        // incorrect params?
        // @ts-ignore
        vars.serverBonkersSDKInstance.signature.setMessage({ test: 'hi' })
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.signMessage()
        ).rejects.toThrow()

        // sdk
        vars.serverBonkersSDKInstance.signature.setMessage('Hello')
        expect(await vars.serverBonkersSDKInstance.signature.signMessage()).toBeDefined()
        // controller
        vars.serverControllerInstance.signature.setMessage('Hi')
        expect(await vars.serverControllerInstance.signature.signMessage()).toBeDefined()
        // vault
        vars.serverVaultInstance.signature.setMessage('Heh')
        expect(await vars.serverVaultInstance.signature.signMessage()).toBeDefined()
        // vault factory
        vars.serverVaultFactoryInstance.signature.setMessage('Hoh')
        expect(await vars.serverVaultFactoryInstance.signature.signMessage()).toBeDefined()

        vars.serverBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        expect(await vars.serverBonkersSDKInstance.signature.signMessage()).toBeDefined()
    })

    it('Sign Typed Data', async () => {
        // no params
        vars.serverBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.signTypedData()
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))

        // sdk
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        expect(await vars.serverBonkersSDKInstance.signature.signTypedData()).toBeDefined()

        // controller
        vars.serverControllerInstance.signature.setTypedData(typedData2)
        expect(await vars.serverControllerInstance.signature.signTypedData()).toBeDefined()

        // vault
        vars.serverVaultInstance.signature.setTypedData(typedData3)
        expect(await vars.serverVaultInstance.signature.signTypedData()).toBeDefined()

        // vault factory
        vars.serverVaultFactoryInstance.signature.setTypedData(typedData)
        expect(await vars.serverVaultFactoryInstance.signature.signTypedData()).toBeDefined()
    })

    it('Verify Message', async () => {
        const account = vars.serverBonkersSDKInstance.account()
        expect(account).to.be.not.eq(CALLER_WALLET)

        // sdk
        vars.serverBonkersSDKInstance.signature.setMessage('Hello')
        const sig = await vars.serverBonkersSDKInstance.signature.signMessage()
        expect(sig).toBeDefined()
        expect(await vars.serverBonkersSDKInstance.signature.verifyMessage(sig)).to.be.true
        expect(await vars.serverBonkersSDKInstance.signature.verifyMessage(sig, CALLER_WALLET)).to
            .be.false

        // no params
        vars.serverBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.verifyMessage(sig)
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))

        // controller
        vars.serverControllerInstance.signature.setMessage('Hi')
        const sig1 = await vars.serverControllerInstance.signature.signMessage()
        expect(await vars.serverControllerInstance.signature.verifyMessage(sig1)).to.be.true
        expect(await vars.serverControllerInstance.signature.verifyMessage(sig1, CALLER_WALLET)).to
            .be.false
        // vault
        vars.serverVaultInstance.signature.setMessage('Heh')
        const sig2 = await vars.serverVaultInstance.signature.signMessage()
        expect(await vars.serverVaultInstance.signature.verifyMessage(sig2)).to.be.true
        expect(await vars.serverVaultInstance.signature.verifyMessage(sig2, CALLER_WALLET)).to.be
            .false
        // vault factory
        vars.serverVaultFactoryInstance.signature.setMessage('Hoh')
        const sig3 = await vars.serverVaultFactoryInstance.signature.signMessage()
        expect(await vars.serverVaultFactoryInstance.signature.verifyMessage(sig3)).to.be.true
        expect(await vars.serverVaultFactoryInstance.signature.verifyMessage(sig3, CALLER_WALLET))
            .to.be.false

        vars.serverBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        const sig4 = await vars.serverBonkersSDKInstance.signature.signMessage()
        expect(await vars.serverBonkersSDKInstance.signature.verifyMessage(sig4)).to.be.true
        expect(await vars.serverBonkersSDKInstance.signature.verifyMessage(sig4, CALLER_WALLET)).to
            .be.false
    })

    // TODO: verify using the incorrect signer and expect false
    it('Verify Typed Data', async () => {
        const account = vars.serverBonkersSDKInstance.account()
        expect(account).to.be.not.eq(CALLER_WALLET)

        // sdk
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        const sig = await vars.serverBonkersSDKInstance.signature.signTypedData()
        expect(await vars.serverBonkersSDKInstance.signature.verifyTypedData(sig)).to.be.true
        expect(await vars.serverBonkersSDKInstance.signature.verifyTypedData(sig, CALLER_WALLET)).to
            .be.false

        // no params
        vars.serverBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.verifyTypedData(sig)
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))

        // controller
        vars.serverControllerInstance.signature.setTypedData(typedData2)
        const sig1 = await vars.serverControllerInstance.signature.signTypedData()
        expect(await vars.serverControllerInstance.signature.verifyTypedData(sig1)).to.be.true
        expect(await vars.serverControllerInstance.signature.verifyTypedData(sig1, CALLER_WALLET))
            .to.be.false

        // vault
        vars.serverVaultInstance.signature.setTypedData(typedData3)
        const sig2 = await vars.serverVaultInstance.signature.signTypedData()
        expect(await vars.serverVaultInstance.signature.verifyTypedData(sig2)).to.be.true
        expect(await vars.serverVaultInstance.signature.verifyTypedData(sig2, CALLER_WALLET)).to.be
            .false

        // vault factory
        vars.serverVaultFactoryInstance.signature.setTypedData(typedData)
        const sig3 = await vars.serverVaultFactoryInstance.signature.signTypedData()
        expect(await vars.serverVaultFactoryInstance.signature.verifyTypedData(sig3)).to.be.true
        expect(await vars.serverVaultFactoryInstance.signature.verifyTypedData(sig3, CALLER_WALLET))
            .to.be.false
    })

    it('Hash Message', async () => {
        // no params
        vars.serverBonkersSDKInstance.signature.message = undefined
        expect(() => vars.serverBonkersSDKInstance.signature.hashMessage()).toThrow(
            new MissingRequiredParams('Message To Sign or Verify Missing')
        )

        const message = 'hello hi heh'
        const hashedMessage = hashMessage(message, 'hex')
        // sdk
        vars.serverBonkersSDKInstance.signature.setMessage(message)
        expect(vars.serverBonkersSDKInstance.signature.hashMessage()).to.eq(hashedMessage)
        // controller
        vars.serverControllerInstance.signature.setMessage(message)
        expect(vars.serverControllerInstance.signature.hashMessage()).to.eq(hashedMessage)
        // vault
        vars.serverVaultInstance.signature.setMessage(message)
        expect(vars.serverVaultInstance.signature.hashMessage()).to.eq(hashedMessage)
        // vault factory
        vars.serverVaultFactoryInstance.signature.setMessage(message)
        expect(vars.serverVaultFactoryInstance.signature.hashMessage()).to.eq(hashedMessage)
    })

    it('Hash Typed Data', async () => {
        // no params
        vars.serverBonkersSDKInstance.signature.typedData = undefined
        expect(() => vars.serverBonkersSDKInstance.signature.hashTypedData()).toThrow(
            new MissingRequiredParams('Typed Data To Sign or Verify Missing')
        )

        const hashedTypedData = hashTypedData(typedData)
        // sdk
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        expect(vars.serverBonkersSDKInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // controller
        vars.serverControllerInstance.signature.setTypedData(typedData)
        expect(vars.serverControllerInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // vault
        vars.serverVaultInstance.signature.setTypedData(typedData)
        expect(vars.serverVaultInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // vault factory
        vars.serverVaultFactoryInstance.signature.setTypedData(typedData)
        expect(vars.serverVaultFactoryInstance.signature.hashTypedData()).to.eq(hashedTypedData)
    })

    it('Recover Address From Message', async () => {
        // sdk
        vars.serverBonkersSDKInstance.signature.setMessage('Hello')
        const sig = await vars.serverBonkersSDKInstance.signature.signMessage()
        expect(sig).toBeDefined()
        expect(await vars.serverBonkersSDKInstance.signature.recoverMessageAddress(sig)).to.be.eq(
            vars.serverBonkersSDKInstance.account()
        )

        // no params
        vars.serverBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.recoverMessageAddress(sig)
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))

        // controller
        vars.serverControllerInstance.signature.setMessage('Hi')
        const sig1 = await vars.serverControllerInstance.signature.signMessage()
        expect(await vars.serverControllerInstance.signature.recoverMessageAddress(sig1)).to.be.eq(
            vars.serverControllerInstance.account()
        )
        // vault
        vars.serverVaultInstance.signature.setMessage('Heh')
        const sig2 = await vars.serverVaultInstance.signature.signMessage()
        expect(await vars.serverVaultInstance.signature.recoverMessageAddress(sig2)).to.be.eq(
            vars.serverVaultInstance.account()
        )
        // vault factory
        vars.serverVaultFactoryInstance.signature.setMessage('Hoh')
        const sig3 = await vars.serverVaultFactoryInstance.signature.signMessage()
        expect(
            await vars.serverVaultFactoryInstance.signature.recoverMessageAddress(sig3)
        ).to.be.eq(vars.serverVaultFactoryInstance.account())

        vars.serverBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        const sig4 = await vars.serverBonkersSDKInstance.signature.signMessage()
        expect(await vars.serverBonkersSDKInstance.signature.recoverMessageAddress(sig4)).to.be.eq(
            vars.serverBonkersSDKInstance.account()
        )
    })

    it('Recover Address From Typed Data', async () => {
        // sdk
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        const sig = await vars.serverBonkersSDKInstance.signature.signTypedData()
        expect(await vars.serverBonkersSDKInstance.signature.recoverTypedDataAddress(sig)).to.be.eq(
            vars.serverBonkersSDKInstance.account()
        )

        // no params
        vars.serverBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.recoverTypedDataAddress(sig)
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))

        // controller
        vars.serverControllerInstance.signature.setTypedData(typedData2)
        const sig1 = await vars.serverControllerInstance.signature.signTypedData()
        expect(
            await vars.serverControllerInstance.signature.recoverTypedDataAddress(sig1)
        ).to.be.eq(vars.serverControllerInstance.account())

        // vault
        vars.serverVaultInstance.signature.setTypedData(typedData3)
        const sig2 = await vars.serverVaultInstance.signature.signTypedData()
        expect(await vars.serverVaultInstance.signature.recoverTypedDataAddress(sig2)).to.be.eq(
            vars.serverVaultInstance.account()
        )

        // vault factory
        vars.serverVaultFactoryInstance.signature.setTypedData(typedData)
        const sig3 = await vars.serverVaultFactoryInstance.signature.signTypedData()
        expect(
            await vars.serverVaultFactoryInstance.signature.recoverTypedDataAddress(sig3)
        ).to.be.eq(vars.serverVaultFactoryInstance.account())
    })

    it('Sign No Client', async () => {
        // @ts-ignore
        vars.serverBonkersSDKInstance.signature.clients.walletClient = undefined

        // no client
        vars.serverBonkersSDKInstance.signature.setMessage('Hello')
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.signMessage()
        ).rejects.toThrow(new ClientNotFound())

        // no client
        vars.serverBonkersSDKInstance.signature.setTypedData(typedData)
        expect(
            async () => await vars.serverBonkersSDKInstance.signature.signTypedData()
        ).rejects.toThrow(new ClientNotFound())
    })
})
