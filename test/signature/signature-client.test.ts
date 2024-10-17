import { hashMessage, hashTypedData, type Hex } from 'viem'
import { anvil, mainnet } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { TypedDataParams } from '../../src/types'
import { ClientNotFound, MissingRequiredParams } from '../../src/utils'
import {
    CALLER_WALLET,
    clientAndContractSetup,
    clientConfig,
    DEPLOYER_WALLET,
    resetClientConnection,
    testClient,
    type TestVars
} from '../common/utils'
import test from 'node:test'
import Signature from '../../src/sdk/signature'

describe('Signature Client Test', () => {
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
        expect(vars.clientControllerNoParams.contractAddress).to.be.undefined
        expect(vars.clientControllerNoParams.contractAbi).to.be.undefined
        expect(vars.clientControllerInvalidAddress.contractAddress).to.be.not.eq(vars.controller)
    })

    afterEach(async () => {
        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Set Message', async () => {
        // sdk
        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        expect(vars.clientBonkersSDKInstance.signature.message).to.eq('Hello')
        // controller
        vars.clientControllerInstance.signature.setMessage('Hi')
        expect(vars.clientControllerInstance.signature.message).to.eq('Hi')
        // vault
        vars.clientVaultInstance.signature.setMessage('Heh')
        expect(vars.clientVaultInstance.signature.message).to.eq('Heh')
        // vault factory
        vars.clientVaultFactoryInstance.signature.setMessage('Hoh')
        expect(vars.clientVaultFactoryInstance.signature.message).to.eq('Hoh')

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hello') })
        expect((vars.clientBonkersSDKInstance.signature.message as any).raw).to.eq(
            hashMessage('Hello')
        )
    })

    it('Set Typed Data', async () => {
        // sdk
        vars.clientBonkersSDKInstance.signature.setTypedData(typedData)
        expect(vars.clientBonkersSDKInstance.signature.typedData).to.eq(typedData as any)
        // controller
        vars.clientControllerInstance.signature.setTypedData(typedData2)
        expect(vars.clientControllerInstance.signature.typedData).to.eq(typedData2 as any)
        // vault
        vars.clientVaultInstance.signature.setTypedData(typedData3)
        expect(vars.clientVaultInstance.signature.typedData).to.eq(typedData3 as any)
        // vault factory
        vars.clientVaultFactoryInstance.signature.setTypedData(typedData)
        expect(vars.clientVaultFactoryInstance.signature.typedData).to.eq(typedData as any)
    })

    it('Sign Message', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        // no params
        vars.clientBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.signMessage()
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))

        // incorrect params?
        // @ts-ignore
        vars.clientBonkersSDKInstance.signature.setMessage({ test: 'hi' })
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.signMessage()
        ).rejects.toThrow()

        // sdk
        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        expect(await vars.clientBonkersSDKInstance.signature.signMessage()).toBeDefined()
        // controller
        vars.clientControllerInstance.signature.setMessage('Hi')
        expect(await vars.clientControllerInstance.signature.signMessage()).toBeDefined()
        // vault
        vars.clientVaultInstance.signature.setMessage('Heh')
        expect(await vars.clientVaultInstance.signature.signMessage()).toBeDefined()
        // vault factory
        vars.clientVaultFactoryInstance.signature.setMessage('Hoh')
        expect(await vars.clientVaultFactoryInstance.signature.signMessage()).toBeDefined()

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        expect(await vars.clientBonkersSDKInstance.signature.signMessage()).toBeDefined()
    })

    it('Sign Typed Data', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        // no params
        vars.clientBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.signTypedData()
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))

        // sdk
        vars.clientBonkersSDKInstance.signature.setTypedData(typedData)
        expect(await vars.clientBonkersSDKInstance.signature.signTypedData()).toBeDefined()

        // controller
        vars.clientControllerInstance.signature.setTypedData(typedData2)
        expect(await vars.clientControllerInstance.signature.signTypedData()).toBeDefined()

        // vault
        vars.clientVaultInstance.signature.setTypedData(typedData3)
        expect(await vars.clientVaultInstance.signature.signTypedData()).toBeDefined()

        // vault factory
        vars.clientVaultFactoryInstance.signature.setTypedData(typedData)
        expect(await vars.clientVaultFactoryInstance.signature.signTypedData()).toBeDefined()
    })

    it('Verify Message', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        const account = vars.clientBonkersSDKInstance.account()
        expect(account).to.not.eq(CALLER_WALLET)

        // sdk
        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        const sig = await vars.clientBonkersSDKInstance.signature.signMessage()
        expect(sig).toBeDefined()
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig)).to.be.true
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig, CALLER_WALLET)).to
            .be.false

        // no params
        vars.clientBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.verifyMessage(sig)
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))

        // controller
        vars.clientControllerInstance.signature.setMessage('Hi')
        const sig1 = await vars.clientControllerInstance.signature.signMessage()
        expect(await vars.clientControllerInstance.signature.verifyMessage(sig1)).to.be.true
        expect(await vars.clientControllerInstance.signature.verifyMessage(sig1, CALLER_WALLET)).to
            .be.false
        // vault
        vars.clientVaultInstance.signature.setMessage('Heh')
        const sig2 = await vars.clientVaultInstance.signature.signMessage()
        expect(await vars.clientVaultInstance.signature.verifyMessage(sig2)).to.be.true
        expect(await vars.clientVaultInstance.signature.verifyMessage(sig2, CALLER_WALLET)).to.be
            .false
        // vault factory
        vars.clientVaultFactoryInstance.signature.setMessage('Hoh')
        const sig3 = await vars.clientVaultFactoryInstance.signature.signMessage()
        expect(await vars.clientVaultFactoryInstance.signature.verifyMessage(sig3)).to.be.true
        expect(await vars.clientVaultFactoryInstance.signature.verifyMessage(sig3, CALLER_WALLET))
            .to.be.false

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        const sig4 = await vars.clientBonkersSDKInstance.signature.signMessage()
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig4)).to.be.true
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig4, CALLER_WALLET)).to
            .be.false

        //

        await vars.clientBonkersSDKInstance.disconnect()
        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientControllerInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientVaultInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientVaultFactoryInstance.connection()).to.be.eq('disconnected')

        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        expect(await vars.clientControllerInstance.signature.verifyMessage(sig1, account)).to.be
            .true
        expect(await vars.clientControllerInstance.signature.verifyMessage(sig1, CALLER_WALLET)).to
            .be.false

        expect(await vars.clientVaultInstance.signature.verifyMessage(sig2, account)).to.be.true
        expect(await vars.clientVaultInstance.signature.verifyMessage(sig2, CALLER_WALLET)).to.be
            .false
        expect(await vars.clientVaultFactoryInstance.signature.verifyMessage(sig3, account)).to.be
            .true
        expect(await vars.clientVaultFactoryInstance.signature.verifyMessage(sig3, CALLER_WALLET))
            .to.be.false

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig4, account)).to.be
            .true
        expect(await vars.clientBonkersSDKInstance.signature.verifyMessage(sig4, CALLER_WALLET)).to
            .be.false
    })

    it('Verify Typed Data', async () => {
        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(1)!
        )

        const account = vars.clientBonkersSDKInstance.account()

        expect(account).to.not.eq(CALLER_WALLET)

        // sdk
        vars.clientBonkersSDKInstance.signature.setTypedData(typedData)
        const sig = await vars.clientBonkersSDKInstance.signature.signTypedData()
        expect(await vars.clientBonkersSDKInstance.signature.verifyTypedData(sig)).to.be.true
        expect(await vars.clientBonkersSDKInstance.signature.verifyTypedData(sig, CALLER_WALLET)).to
            .be.false

        // controller
        vars.clientControllerInstance.signature.setTypedData(typedData2)
        const sig1 = await vars.clientControllerInstance.signature.signTypedData()
        expect(await vars.clientControllerInstance.signature.verifyTypedData(sig1)).to.be.true
        expect(await vars.clientControllerInstance.signature.verifyTypedData(sig1, CALLER_WALLET))
            .to.be.false

        // vault
        vars.clientVaultInstance.signature.setTypedData(typedData3)
        const sig2 = await vars.clientVaultInstance.signature.signTypedData()
        expect(await vars.clientVaultInstance.signature.verifyTypedData(sig2)).to.be.true
        expect(await vars.clientVaultInstance.signature.verifyTypedData(sig2, CALLER_WALLET)).to.be
            .false

        // vault factory
        vars.clientVaultFactoryInstance.signature.setTypedData(typedData)
        const sig3 = await vars.clientVaultFactoryInstance.signature.signTypedData()
        expect(await vars.clientVaultFactoryInstance.signature.verifyTypedData(sig3)).to.be.true
        expect(await vars.clientVaultFactoryInstance.signature.verifyTypedData(sig3, CALLER_WALLET))
            .to.be.false

        //

        await vars.clientBonkersSDKInstance.disconnect()
        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientControllerInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientVaultInstance.connection()).to.be.eq('disconnected')
        expect(vars.clientVaultFactoryInstance.connection()).to.be.eq('disconnected')

        expect(await vars.clientBonkersSDKInstance.signature.verifyTypedData(sig, account)).to.be
            .true
        expect(await vars.clientBonkersSDKInstance.signature.verifyTypedData(sig, CALLER_WALLET)).to
            .be.false
        expect(await vars.clientControllerInstance.signature.verifyTypedData(sig1, account)).to.be
            .true
        expect(await vars.clientControllerInstance.signature.verifyTypedData(sig1, CALLER_WALLET))
            .to.be.false
        expect(await vars.clientVaultInstance.signature.verifyTypedData(sig2, account)).to.be.true
        expect(await vars.clientVaultInstance.signature.verifyTypedData(sig2, CALLER_WALLET)).to.be
            .false
        expect(await vars.clientVaultFactoryInstance.signature.verifyTypedData(sig3, account)).to.be
            .true
        expect(await vars.clientVaultFactoryInstance.signature.verifyTypedData(sig3, CALLER_WALLET))
            .to.be.false

        // no params
        vars.clientBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.verifyTypedData(sig)
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))
    })

    it('Hash Message', async () => {
        // no params
        vars.clientBonkersSDKInstance.signature.message = undefined
        expect(() => vars.clientBonkersSDKInstance.signature.hashMessage()).toThrow(
            new MissingRequiredParams('Message To Sign or Verify Missing')
        )

        const message = 'hello hi heh'
        const hashedMessage = hashMessage(message, 'hex')
        // sdk
        vars.clientBonkersSDKInstance.signature.setMessage(message)
        expect(vars.clientBonkersSDKInstance.signature.hashMessage()).to.eq(hashedMessage)
        // controller
        vars.clientControllerInstance.signature.setMessage(message)
        expect(vars.clientControllerInstance.signature.hashMessage()).to.eq(hashedMessage)
        // vault
        vars.clientVaultInstance.signature.setMessage(message)
        expect(vars.clientVaultInstance.signature.hashMessage()).to.eq(hashedMessage)
        // vault factory
        vars.clientVaultFactoryInstance.signature.setMessage(message)
        expect(vars.clientVaultFactoryInstance.signature.hashMessage()).to.eq(hashedMessage)
    })

    it('Hash Typed Data', async () => {
        // no params
        vars.clientBonkersSDKInstance.signature.typedData = undefined
        expect(() => vars.clientBonkersSDKInstance.signature.hashTypedData()).toThrow(
            new MissingRequiredParams('Typed Data To Sign or Verify Missing')
        )

        const hashedTypedData = hashTypedData(typedData)
        // sdk
        vars.clientBonkersSDKInstance.signature.setTypedData(typedData)
        expect(vars.clientBonkersSDKInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // controller
        vars.clientControllerInstance.signature.setTypedData(typedData)
        expect(vars.clientControllerInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // vault
        vars.clientVaultInstance.signature.setTypedData(typedData)
        expect(vars.clientVaultInstance.signature.hashTypedData()).to.eq(hashedTypedData)
        // vault factory
        vars.clientVaultFactoryInstance.signature.setTypedData(typedData)
        expect(vars.clientVaultFactoryInstance.signature.hashTypedData()).to.eq(hashedTypedData)
    })

    it('Recover Address From Message', async () => {
        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(1)!
        )

        const account = vars.clientBonkersSDKInstance.account()

        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        const sig = await vars.clientBonkersSDKInstance.signature.signMessage()

        vars.clientControllerInstance.signature.setMessage('Hi')
        const sig1 = await vars.clientControllerInstance.signature.signMessage()

        vars.clientVaultInstance.signature.setMessage('Heh')
        const sig2 = await vars.clientVaultInstance.signature.signMessage()

        vars.clientVaultFactoryInstance.signature.setMessage('Hoh')
        const sig3 = await vars.clientVaultFactoryInstance.signature.signMessage()

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        const sig4 = await vars.clientBonkersSDKInstance.signature.signMessage()

        //
        await vars.clientBonkersSDKInstance.disconnect()
        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('disconnected')

        // sdk
        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('disconnected')

        expect(sig).toBeDefined()

        vars.clientBonkersSDKInstance.signature.setMessage('Hello')
        expect(await vars.clientBonkersSDKInstance.signature.recoverMessageAddress(sig)).to.be.eq(
            account
        )
        expect(sig4).toBeDefined()

        vars.clientBonkersSDKInstance.signature.setMessage({ raw: hashMessage('Hoh') })
        expect(await vars.clientBonkersSDKInstance.signature.recoverMessageAddress(sig4)).to.be.eq(
            account
        )

        // controller
        expect(vars.clientControllerInstance.connection()).to.be.eq('disconnected')
        expect(sig1).toBeDefined()

        expect(await vars.clientControllerInstance.signature.recoverMessageAddress(sig1)).to.be.eq(
            account
        )
        // vault
        expect(vars.clientVaultInstance.connection()).to.be.eq('disconnected')
        expect(sig2).toBeDefined()

        expect(await vars.clientVaultInstance.signature.recoverMessageAddress(sig2)).to.be.eq(
            account
        )
        // vault factory
        expect(vars.clientVaultFactoryInstance.connection()).to.be.eq('disconnected')
        expect(sig3).toBeDefined()

        expect(
            await vars.clientVaultFactoryInstance.signature.recoverMessageAddress(sig3)
        ).to.be.eq(account)

        // no params
        vars.clientBonkersSDKInstance.signature.message = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.recoverMessageAddress(sig)
        ).rejects.toThrow(new MissingRequiredParams('Message To Sign or Verify Missing'))
    })

    it('Recover Address From Typed Data', async () => {
        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(1)!
        )

        const account = vars.clientBonkersSDKInstance.account()

        // sdk
        vars.clientBonkersSDKInstance.signature.setTypedData(typedData)
        const sig = await vars.clientBonkersSDKInstance.signature.signTypedData()

        vars.clientControllerInstance.signature.setTypedData(typedData2)
        const sig1 = await vars.clientControllerInstance.signature.signTypedData()

        vars.clientVaultInstance.signature.setTypedData(typedData3)
        const sig2 = await vars.clientVaultInstance.signature.signTypedData()

        vars.clientVaultFactoryInstance.signature.setTypedData(typedData)
        const sig3 = await vars.clientVaultFactoryInstance.signature.signTypedData()

        //

        await vars.clientBonkersSDKInstance.disconnect()
        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('disconnected')

        expect(await vars.clientBonkersSDKInstance.signature.recoverTypedDataAddress(sig)).to.be.eq(
            account
        )

        // controller
        expect(vars.clientControllerInstance.connection()).to.be.eq('disconnected')

        expect(
            await vars.clientControllerInstance.signature.recoverTypedDataAddress(sig1)
        ).to.be.eq(account)

        // vault
        expect(vars.clientVaultInstance.connection()).to.be.eq('disconnected')

        expect(await vars.clientVaultInstance.signature.recoverTypedDataAddress(sig2)).to.be.eq(
            account
        )

        // vault factory
        expect(vars.clientVaultFactoryInstance.connection()).to.be.eq('disconnected')

        expect(
            await vars.clientVaultFactoryInstance.signature.recoverTypedDataAddress(sig3)
        ).to.be.eq(account)

        // no params
        vars.clientBonkersSDKInstance.signature.typedData = undefined
        expect(
            async () => await vars.clientBonkersSDKInstance.signature.recoverTypedDataAddress(sig)
        ).rejects.toThrow(new MissingRequiredParams('Typed Data To Sign or Verify Missing'))
    })

    it('Sign No Client', async () => {
        // @ts-ignore
        const signature = new Signature(clientConfig, undefined)

        // @ts-ignore
        expect(signature?.clients?.wagmi).toBeUndefined()

        // no client
        signature.setMessage('Hello')
        expect(async () => await signature.signMessage()).rejects.toThrowError(ClientNotFound)

        // no client
        signature.setTypedData(typedData)
        expect(async () => await signature.signTypedData()).rejects.toThrowError(ClientNotFound)
    })
})
