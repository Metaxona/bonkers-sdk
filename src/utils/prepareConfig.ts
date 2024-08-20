import type { ClientConfig, Config, ServerConfig } from '../types/index.js'
import { InvalidSDKMode, MissingRequiredParams } from './errors.js'
import { getDefaultTransportFromChains } from './index.js'
import { logger } from './logger.js'

/**
 * A preparation function to make sure the provided config is correctly provided
 *
 * @param config
 * @returns config
 *
 * @category Utils
 * @category Config
 */
export default function prepareConfig(config: Config): Config {
    const defaults: Config = {
        mode: config.mode,
        options: config.options,
        logger: config?.logger || logger
    }

    const options = config.options

    if (config.mode === 'client') {
        const clientOptions = options as ClientConfig
        if (!clientOptions.wagmiConfig) {
            throw new MissingRequiredParams('Missing Wagmi Config')
        }
    }

    if (config.mode === 'server') {
        const chains = (defaults.options as ServerConfig).chains
        const serverOptions = options as ServerConfig

        if (!serverOptions?.privateKey) {
            throw new MissingRequiredParams('Missing PrivateKey')
        }

        if (serverOptions.chains.length < 1) {
            throw new MissingRequiredParams('Must Have At Least 1 Chain')
        }

        if (!serverOptions.transports || serverOptions.transports === undefined) {
            serverOptions.transports =
                serverOptions.transports || getDefaultTransportFromChains(chains)
        }
    }

    if (!['server', 'client'].includes(config.mode)) {
        throw new InvalidSDKMode()
    }

    const finalConfig = Object.assign(config, defaults)

    return finalConfig
}
