import { createConfig } from '@wagmi/core'
import { Hex, http } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { Clients } from '../../src/sdk/clients'
import { ClientNotFound, InvalidClientType } from '../../src/utils'
import { WagmiConfigParameters, Connector } from '../../src/wagmi_viem'
import {
    CALLER_WALLET,
    clientAndContractSetup,
    clientConfig,
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    mockConnector,
    OWNER_WALLET,
    publicClient,
    serverConfig,
    serverConfig_NoPrivateKey,
    testClient,
    TestVars,
    wagmiConfig,
    walletClient
} from '../common/utils'

describe('Clients Test', () => {
    let vars: TestVars
    let snapshot: Hex

    let client: Clients
    let client2: Clients
    let clientNoClients: Clients
    let wagmiConfiguration: any

    beforeAll(async () => {
        vars = await clientAndContractSetup()
        snapshot = await testClient.snapshot()
        wagmiConfiguration = createConfig(wagmiConfig)
        client = new Clients(publicClient, walletClient, wagmiConfiguration)
        client2 = new Clients(publicClient, walletClient, wagmiConfiguration)
        clientNoClients = new Clients()
    })

    beforeEach(async () => {
        await testClient.revert({
            id: snapshot
        })
    })

    afterEach(async () => {
        await client.disconnect()
    })

    it('Set Clients', async () => {
        expect(client2.publicClient).to.be.eq(publicClient)
        expect(client2.walletClient).to.be.eq(walletClient)
        expect(client2.wagmi).to.be.eq(wagmiConfiguration)

        const wagmi: WagmiConfigParameters = {
            chains: [anvil, sepolia],
            transports: {
                [anvil.id]: http(),
                [sepolia.id]: http()
            },
            connectors: [mockConnector]
        }

        client2.setClients({
            mode: 'client',
            options: {
                wagmiConfig: wagmi
            }
        })

        client2.setClients({
            mode: 'server',
            options: {
                chains: [anvil, sepolia],
                privateKey: DEPLOYER_PRIVATE_KEY
            }
        })

        expect(client2.publicClient).to.not.be.eq(publicClient)
        expect(client2.walletClient).to.not.be.eq(walletClient)
        expect(client2.wagmi).to.not.be.eq(wagmiConfiguration)

        // @ts-ignore
        expect(() => client2.setClients({}, 'wagmi')).toThrow()
    })

    it('Connection', async () => {
        const connector1 = client.connectors()[0]!
        await client.connect(connector1)

        expect(client.connection()).to.eq('connected')

        await client.disconnect()

        expect(client.connection()).to.eq('disconnected')
    })

    it('Connect', async () => {
        const connector1 = client.connectors()[0]!

        expect(async () => await client.connect(client.connectors()[2])).rejects.toThrow()

        const connect = await client.connect(connector1)

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(client.connection()).to.eq('connected')

        expect(async () => await clientNoClients.connect(connector1)).rejects.toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Re-Connect', async () => {
        const connector1 = client.connectors()[0]!
        const connectorNoReconnect = client.connectors()[5]!

        expect(async () => await client.connect(client.connectors()[2])).rejects.toThrow()

        await client.connect(connector1)

        expect(client.connection()).to.eq('connected')

        await client.disconnect()

        expect(client.connection()).to.eq('disconnected')

        await client.connect(connectorNoReconnect)

        expect(client.connection()).to.eq('connected')

        await client.disconnect()

        expect(client.connection()).to.eq('disconnected')

        await client.connect(connector1)
        await client.connect(connectorNoReconnect)

        expect(
            async () => await clientNoClients.reconnect(client.connectors() as Connector[])
        ).rejects.toThrowError(new ClientNotFound('Wagmi Client Not Found'))

        const res = await client.reconnect(client.connectors() as Connector[])

        expect(res.length).to.eq(1)

        expect(client.connection()).to.eq('connected')
    })

    it('Connectors', async () => {
        expect(client.connectors().length).to.be.eq(6)
        client.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })

        expect(() => clientNoClients.connectors()).toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Connection', async () => {
        const connector1 = client.connectors()[0]!
        await client.connect(connector1)

        expect(client.connection()).to.eq('connected')

        await client.disconnect()

        await client.connect(connector1, (curr, prev, unwatch) => {
            expect(curr).to.be.not.eq(prev)
            expect(curr.length).to.be.gt(0)
            expect(prev.length).to.be.eq(0)
            unwatch()
        })

        await client.disconnect()

        expect(client.connection()).to.eq('disconnected')
        expect(() => clientNoClients.connection()).toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Disconnect', async () => {
        const connector1 = client.connectors()[0]!
        await client.connect(connector1)

        expect(client.connection()).to.eq('connected')

        await client.disconnect()

        expect(client.connection()).to.eq('disconnected')

        expect(async () => await clientNoClients.disconnect()).rejects.toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Switch Chain', async () => {
        const { id, chainId, name, symbol } = client.chain('wagmi')

        expect(chainId).eq(anvil.id)
        expect(id).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(symbol).eq(anvil.nativeCurrency.symbol)

        const switchR = await client.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const { id: id2, chainId: chainId2, name: name2, symbol: symbol2 } = client.chain('wagmi')

        expect(chainId2).eq(sepolia.id)
        expect(id2).eq(sepolia.id)
        expect(name2).eq('Sepolia')
        expect(symbol2).eq(sepolia.nativeCurrency.symbol)

        await client.switchChain(anvil.id, (curr, prev, unwatch) => {
            expect(curr).to.be.not.eq(prev)
            expect(curr).to.be.eq(anvil.id)
            expect(prev).to.be.eq(sepolia.id)
            unwatch()
        })

        expect(async () => await clientNoClients.switchChain(anvil.id)).rejects.toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Use Chain', async () => {
        const { chainId, name } = client.chain('viem')

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')

        client.useChain(serverConfig, sepolia.id)

        const { chainId: chainId2, name: name2 } = client.chain('viem')

        expect(chainId2).eq(sepolia.id)
        expect(name2).eq('Sepolia')

        client.useChain(serverConfig, anvil.id)

        expect(() => clientNoClients.useChain(serverConfig, anvil.id)).toThrowError(
            new ClientNotFound('Viem Public and Wallet Client Not Found')
        )
    })

    it('Chain', async () => {
        const { id, chainId, name, symbol } = client.chain('wagmi')
        expect(chainId).to.eq(anvil.id)
        expect(id).to.eq(anvil.id)
        expect(name).to.eq(anvil.name)
        expect(symbol).to.eq(anvil.nativeCurrency.symbol)

        const { id: id2, chainId: chainId2, name: name2, symbol: symbol2 } = client.chain('viem')
        expect(chainId2).to.eq(anvil.id)
        expect(id2).to.eq(anvil.id)
        expect(name2).to.eq(anvil.name)
        expect(symbol2).to.eq(anvil.nativeCurrency.symbol)

        // @ts-ignore
        expect(() => client.chain('random')).toThrowError(new InvalidClientType())
    })

    it('Clients Exist', async () => {
        expect(client.clientsExist('wagmi')).to.be.true
        expect(client.clientsExist('viem')).to.be.true

        expect(clientNoClients.clientsExist('wagmi')).to.be.false
        expect(clientNoClients.clientsExist('viem')).to.be.false

        // @ts-ignore
        expect(clientNoClients.clientsExist('random')).to.be.false
    })

    it('Account', async () => {
        expect(client.account(serverConfig)).to.be.eq(OWNER_WALLET)

        const connector1 = client.connectors()[0]!
        await client.connect(connector1)

        expect(client.account(clientConfig)).to.be.eq(walletClient.account.address)

        await client.disconnect()

        expect(() => client.account(serverConfig_NoPrivateKey)).toThrow()
        expect(client.account(clientConfig)).to.be.undefined

        expect(() => clientNoClients.account(serverConfig)).toThrowError(
            new ClientNotFound('Viem Public and Wallet Client Not Found')
        )
        expect(() => clientNoClients.account(clientConfig)).toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Switch Account', async () => {
        client.setClients(clientConfig)

        const connector1 = client.connectors()[0]!
        const connector2 = client.connectors()[1]!

        await client.connect(connector1)

        expect(client.account(clientConfig)).toBeDefined()

        expect(client.account(clientConfig)).to.be.eq(DEPLOYER_WALLET)

        expect(client.connection()).to.be.eq('connected')

        await client.connect(connector2)

        expect(client.connection()).to.be.eq('connected')

        await client.switchAccount(connector2, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(client.account(clientConfig)).toBeDefined()

        expect(client.account(clientConfig)).to.be.eq(OWNER_WALLET)

        await client.switchAccount(connector1, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(client.account(clientConfig)).toBeDefined()

        expect(client.account(clientConfig)).to.be.eq(DEPLOYER_WALLET)

        await client.disconnect()

        expect(async () => await clientNoClients.switchAccount(connector1)).rejects.toThrowError(
            new ClientNotFound('Wagmi Client Not Found')
        )
    })

    it('Use Account', async () => {
        client.setClients(serverConfig)

        expect(client.account(serverConfig)).to.be.eq(OWNER_WALLET)

        client.useAccount(DEPLOYER_PRIVATE_KEY)
        expect(client.account(serverConfig)).to.be.eq(DEPLOYER_WALLET)

        expect(() => clientNoClients.useAccount(DEPLOYER_PRIVATE_KEY)).toThrowError(
            new ClientNotFound('Viem Public and Wallet Client Not Found')
        )
    })

    it('Balance Of', async () => {
        client.setClients(serverConfig)
        client.setClients(clientConfig)

        expect(await client.balanceOf('viem', CALLER_WALLET)).to.be.eq(10000000000000000000000n)

        const connector1 = client.connectors()[0]!

        await client.connect(connector1)

        expect(await client.balanceOf('wagmi', CALLER_WALLET)).to.be.eq(10000000000000000000000n)

        await client.disconnect()

        // @ts-ignore
        expect(async () => await client.balanceOf('random', CALLER_WALLET)).rejects.toThrowError(
            new InvalidClientType()
        )

        expect(
            async () => await clientNoClients.balanceOf('wagmi', CALLER_WALLET)
        ).rejects.toThrowError(new ClientNotFound('Wagmi Client Not Found'))

        expect(
            async () => await clientNoClients.balanceOf('viem', CALLER_WALLET)
        ).rejects.toThrowError(new ClientNotFound('Viem Public and Wallet Client Not Found'))
    })
})
