import { describe, expect, it } from 'vitest'
import { ClientConfig, ServerConfig } from '../../src/types'
import { InvalidSDKMode, MissingRequiredParams, prepareConfig } from '../../src/utils'
import {
    clientConfig,
    clientConfig_InvalidMode,
    clientConfig_NoWagmi,
    clientConfig_UsingServerConfig,
    OWNER_PRIVATE_KEY,
    serverConfig,
    serverConfig_InvalidMode,
    serverConfig_NoChains,
    serverConfig_NoPrivateKey,
    serverConfig_NoTransport,
    wagmiConfig
} from '../common/utils'

describe('Prepare Config Test', async () => {
    it('Should Prepare Server Config', () => {
        const config = prepareConfig(serverConfig)
        const options = config.options as ServerConfig

        expect(options.privateKey === OWNER_PRIVATE_KEY)

        expect(options.chains.length === 3)

        expect(Object.keys(options.transports!).length === 3)

        expect(config.mode).eq('server')

        expect(
            Object.keys(
                (prepareConfig(serverConfig_NoTransport).options as ServerConfig).transports!
            ).length
        ).eq(3)

        expect(() => prepareConfig(serverConfig_NoChains)).toThrowError(
            new MissingRequiredParams('Must Have At Least 1 Chain')
        )

        expect(() => prepareConfig(serverConfig_NoPrivateKey)).toThrowError(
            new MissingRequiredParams('Missing PrivateKey')
        )

        expect(() => prepareConfig(serverConfig_InvalidMode)).toThrowError(new InvalidSDKMode())
    })

    it('Should Prepare Client Config', () => {
        const config = prepareConfig(clientConfig)

        expect((clientConfig.options as ClientConfig).wagmiConfig).eq(wagmiConfig)

        expect(config.mode).eq('client')

        expect(() => prepareConfig(clientConfig_NoWagmi)).toThrowError(
            new MissingRequiredParams('Missing Wagmi Config')
        )

        expect(() => prepareConfig(clientConfig_UsingServerConfig)).toThrowError(
            new MissingRequiredParams('Missing Wagmi Config')
        )

        expect(() => prepareConfig(clientConfig_InvalidMode)).toThrowError(new InvalidSDKMode())
    })
})
