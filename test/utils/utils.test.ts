import { connect, createConfig, CreateConfigParameters, disconnect } from '@wagmi/core'
import { createPublicClient, Hex, http, zeroAddress } from 'viem'
import { anvil, mainnet, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ClientConfig, Config } from '../../src/types'
import {
    censor,
    contractTypeFormatter,
    deepStringifyBigInts,
    getChainById,
    getChains,
    getDefaultTransportFromChains,
    getImplementation,
    getTransportFromConfig,
    InvalidChainId,
    MissingRequiredParams
} from '../../src/utils'
import {
    clientAndContractSetup,
    clientConfig,
    clientConfig_NoWagmi,
    CONTROLLER_ADMIN,
    CONTROLLER_IMPLEMENTATION_ADDRESS,
    DEPLOYER_PRIVATE_KEY,
    mockConnector,
    OWNER_PRIVATE_KEY,
    serverConfig,
    serverConfig_NoChains,
    serverConfig_NoTransport,
    serverConfig_undefinedChains,
    testClient,
    TestVars
} from '../common/utils'

describe('Utils Test', () => {
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

    it('censor', async () => {
        expect(censor(DEPLOYER_PRIVATE_KEY)).to.be.eq(
            Array(DEPLOYER_PRIVATE_KEY.length).fill('*').join('')
        )
        // @ts-ignore
        expect(censor(undefined)).to.be.eq(undefined)
        // @ts-ignore
        expect(censor(null)).to.be.eq(null)
        // @ts-ignore
        expect(censor(NaN)).to.be.eq('*')
        // @ts-ignore
        expect(censor([])).to.be.eq('')
        // @ts-ignore
        expect(censor({})).to.be.eq('*')
        // @ts-ignore
        expect(censor(1)).to.be.eq('*')
    })

    it('getChainById', async () => {
        expect(getChainById(serverConfig, anvil.id)).to.be.eq(anvil)

        expect(() => getChainById(serverConfig_NoChains, anvil.id)).toThrowError(
            new InvalidChainId(`Chain Id [${anvil.id}] Does Not Exist On The Provided Chains`)
        )
        expect(() => getChainById(clientConfig, mainnet.id)).toThrowError(
            new InvalidChainId(`Chain Id [${mainnet.id}] Does Not Exist On The Provided Chains`)
        )
    })

    it('getChains', async () => {
        expect(getChains(serverConfig).length).to.be.eq(3)
        expect(getChains(clientConfig).length).to.be.eq(3)
        expect(getChains(serverConfig_undefinedChains).length).to.be.eq(0)
        expect(getChains(serverConfig_NoChains).length).to.be.eq(0)
        expect(getChains(clientConfig_NoWagmi).length).to.be.eq(0)
    })

    it('getDefaultTransportFromChains', async () => {
        expect(() => getDefaultTransportFromChains([])).toThrowError(
            new MissingRequiredParams('Must Have At Least 1 Chain')
        )

        const chains = [anvil, sepolia]
        const defaultTransports = getDefaultTransportFromChains(chains)

        expect(Object.keys(defaultTransports).length).to.be.eq(2)
    })

    it('deepStringifyBigInts', async () => {
        const testData = {
            string: 'Hello',
            bigint: 1n
        }

        expect(() => JSON.stringify(testData)).toThrow()

        expect(() => deepStringifyBigInts(testData)).not.toThrow()

        // @ts-ignore
        expect(deepStringifyBigInts(undefined)).to.be.undefined
    })

    it('contractTypeFormatter', async () => {
        expect(contractTypeFormatter('CONTROLLER')).to.eq('controller')
        expect(contractTypeFormatter('VAULT')).to.eq('vault')
        expect(contractTypeFormatter('VAULT FACTORY')).to.eq('vaultFactory')
    })

    it('getImplementation', async () => {
        expect(await getImplementation(anvil, vars.controller)).to.be.eq(
            CONTROLLER_IMPLEMENTATION_ADDRESS
        )

        expect(await getImplementation(anvil, CONTROLLER_ADMIN)).to.be.eq(zeroAddress)
        expect(await getImplementation(anvil, vars.devToken)).to.be.eq(zeroAddress)

        expect(async () => await getImplementation(anvil, '0x0')).rejects.toThrow()
    })

    it('getTransportFromConfig', async () => {
        const _serverConfig: Config = {
            mode: 'server',
            options: {
                chains: [anvil],
                privateKey: OWNER_PRIVATE_KEY,
                transports: {}
            }
        }

        const client = createPublicClient({
            chain: anvil,
            transport: http()
        })

        const client1 = createPublicClient({
            chain: anvil,
            transport: getTransportFromConfig(_serverConfig, anvil.id)
        })

        const client2 = createPublicClient({
            chain: anvil,
            transport: getTransportFromConfig(serverConfig, anvil.id)
        })

        const client3 = createPublicClient({
            chain: anvil,
            transport: getTransportFromConfig(serverConfig_NoTransport, anvil.id)
        })

        const _serverConfig1: Config = {
            mode: 'server',
            options: {
                chains: [anvil],
                privateKey: OWNER_PRIVATE_KEY,
                transports: {
                    [anvil.id]: http('http://127.0.0.1:8888')
                }
            }
        }

        const client4 = createPublicClient({
            chain: anvil,
            transport: getTransportFromConfig(_serverConfig1, anvil.id)
        })

        expect(client.transport.url).to.be.eq(anvil.rpcUrls.default.http[0])

        // @ts-ignore
        expect(client1.transport.url).to.be.eq(anvil.rpcUrls.default.http[0])
        // @ts-ignore
        expect(client2.transport.url).to.be.eq(anvil.rpcUrls.default.http[0])
        // @ts-ignore
        expect(client3.transport.url).to.be.eq(anvil.rpcUrls.default.http[0])
        // @ts-ignore
        expect(client4.transport.url).to.be.eq('http://127.0.0.1:8888')

        const connectors = [mockConnector]

        const wagmiConfig: CreateConfigParameters = {
            chains: [anvil],
            transports: {
                [anvil.id]: http()
            },
            connectors: connectors
        }

        const wagmiConfig2: CreateConfigParameters = {
            chains: [anvil],
            transports: {
                [anvil.id]: http('http://127.0.0.1:8888')
            },
            connectors: connectors
        }

        const wagmiConfig3: CreateConfigParameters = {
            chains: [anvil],
            transports: {},
            connectors: connectors
        }

        const config1: Config = {
            mode: 'client',
            options: {
                wagmiConfig: wagmiConfig
            }
        }

        const transports = (config1.options as ClientConfig).wagmiConfig.transports
        if (transports) {
            transports[anvil.id] = getTransportFromConfig(config1, anvil.id)
        }

        const config2: Config = {
            mode: 'client',
            options: {
                wagmiConfig: wagmiConfig2
            }
        }

        const transports2 = (config2.options as ClientConfig).wagmiConfig.transports
        if (transports2) {
            transports2[anvil.id] = getTransportFromConfig(config2, anvil.id)
        }

        const config3: Config = {
            mode: 'client',
            options: {
                wagmiConfig: wagmiConfig3
            }
        }

        const transports3 = (config3.options as ClientConfig).wagmiConfig.transports
        if (transports3) {
            transports3[anvil.id] = getTransportFromConfig(config3, anvil.id)
        }

        const client5 = createConfig(wagmiConfig)

        const client6 = createConfig(wagmiConfig2)

        const client7 = createConfig(wagmiConfig3)

        await connect(client5, { connector: client5.connectors[0] })

        expect(client5.getClient().transport.url).to.be.eq(anvil.rpcUrls.default.http[0])

        await connect(client6, { connector: client6.connectors[0] })

        expect(client6.getClient().transport.url).to.be.eq('http://127.0.0.1:8888')

        await connect(client7, { connector: client7.connectors[0] })

        expect(client7.getClient().transport.url).to.be.eq(anvil.rpcUrls.default.http[0])

        await disconnect(client5)
        await disconnect(client6)
        await disconnect(client7)
    })
})
