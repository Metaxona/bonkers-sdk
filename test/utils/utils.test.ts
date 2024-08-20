import { Hex, zeroAddress } from 'viem'
import { anvil, mainnet, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
    censor,
    contractTypeFormatter,
    deepStringifyBigInts,
    getChainById,
    getDefaultTransportFromChains,
    getImplementation,
    InvalidChainId,
    MissingRequiredParams
} from '../../src/utils'
import {
    clientAndContractSetup,
    clientConfig,
    CONTROLLER_ADMIN,
    CONTROLLER_IMPLEMENTATION_ADDRESS,
    DEPLOYER_PRIVATE_KEY,
    serverConfig,
    serverConfig_NoChains,
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
})
