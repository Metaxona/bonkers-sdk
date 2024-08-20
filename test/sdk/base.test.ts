import { anvil } from 'viem/chains'
import { beforeAll, describe, expect, it } from 'vitest'
import Controller from '../../src/sdk/controller'
import Vault from '../../src/sdk/vault'
import VaultFactory from '../../src/sdk/vaultFactory'
import { Config } from '../../src/types'
import { InvalidSDKMode, MissingRequiredParams } from '../../src/utils'
import {
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    OWNER_PRIVATE_KEY,
    OWNER_WALLET,
    wagmiConfig,
    walletClient
} from '../common/utils'

describe('Base Test', () => {
    const config: Config = {
        mode: 'client',
        options: {
            wagmiConfig: wagmiConfig
        }
    }

    const config2: Config = {
        mode: 'server',
        options: {
            privateKey: DEPLOYER_PRIVATE_KEY,
            chains: [anvil]
        }
    }

    let clientController: Controller
    let serverController: Controller

    beforeAll(async () => {
        clientController = new Controller(config)
        serverController = new Controller(config2)
    })

    it('Initialize', async () => {
        expect(() => new Controller(config)).not.toThrow()
        expect(() => new Controller(config2)).not.toThrow()
        expect(() => new Vault(config)).not.toThrow()
        expect(() => new Vault(config2)).not.toThrow()
        expect(() => new VaultFactory(config)).not.toThrow()
        expect(() => new VaultFactory(config2)).not.toThrow()
    })

    it('Account', async () => {
        expect(clientController.account()).to.be.undefined

        const connector1 = clientController.connectors()[0]!
        await clientController.connect(connector1)

        expect(clientController.account()).to.be.eq(walletClient.account.address)

        await clientController.disconnect()

        expect(clientController.account()).to.be.undefined
    })

    it('Switch Account', async () => {
        const connector1 = clientController.connectors()[0]!
        const connector2 = clientController.connectors()[1]!

        await clientController.connect(connector1)

        expect(clientController.account()).toBeDefined()

        expect(clientController.account()).to.be.eq(DEPLOYER_WALLET)

        expect(clientController.connection()).to.be.eq('connected')

        await clientController.connect(connector2)

        expect(clientController.connection()).to.be.eq('connected')

        await clientController.switchAccount(connector2, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(clientController.account()).toBeDefined()

        expect(clientController.account()).to.be.eq(OWNER_WALLET)

        await clientController.switchAccount(connector1, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(clientController.account()).toBeDefined()

        expect(clientController.account()).to.be.eq(DEPLOYER_WALLET)

        expect(async () => await serverController.switchAccount(connector2)).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await clientController.disconnect()
    })

    it('Use Account', async () => {
        expect(serverController.account()).to.be.eq(DEPLOYER_WALLET)

        serverController.useAccount(OWNER_PRIVATE_KEY)

        expect(() => clientController.useAccount(OWNER_PRIVATE_KEY)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )

        expect(serverController.account()).to.be.eq(OWNER_WALLET)
    })

    it('Implementation Address Not Found', async () => {
        expect(async () => await serverController.implementationAddress()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )
    })
})
