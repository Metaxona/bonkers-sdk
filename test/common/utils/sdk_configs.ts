import { CreateConfigParameters, http } from '@wagmi/core'
import { anvil, baseSepolia, sepolia } from 'viem/chains'
import { Config } from '../../../src/types'
import { LogLevel, Logger } from '../../../src/utils'
import { CALLER_PRIVATE_KEY, OWNER_PRIVATE_KEY } from './accounts'
import {
    mockConnector,
    mockConnectorAdminOnly,
    mockConnectorCallerNonOwner,
    mockConnectorNoAccount,
    mockConnectorNoConnect,
    mockConnectorNoReconnect,
    mockConnectorNoSwitch
} from './common'

export const wagmiConfig: CreateConfigParameters = {
    chains: [anvil, sepolia, baseSepolia],
    transports: {
        [anvil.id]: http(),
        [sepolia.id]: http(),
        [baseSepolia.id]: http()
    },
    connectors: [
        mockConnector,
        mockConnectorAdminOnly,
        mockConnectorNoConnect,
        mockConnectorNoSwitch,
        mockConnectorNoAccount,
        mockConnectorNoReconnect
    ]
}

export const wagmiConfig_NonOwner: CreateConfigParameters = {
    chains: [anvil, sepolia, baseSepolia],
    transports: {
        [anvil.id]: http(),
        [sepolia.id]: http(),
        [baseSepolia.id]: http()
    },
    connectors: [mockConnectorCallerNonOwner]
}

const logger = new Logger(LogLevel.NONE)

export const clientConfig: Config = {
    mode: 'client',
    options: {
        wagmiConfig: wagmiConfig
    },
    logger: logger
}

export const clientConfig_NonOwner: Config = {
    mode: 'client',
    options: {
        wagmiConfig: wagmiConfig_NonOwner
    },
    logger: logger
}

export const clientConfig_InvalidMode: Config = {
    // @ts-ignore
    mode: 'random',
    options: {
        wagmiConfig: wagmiConfig
    },
    logger: logger
}

export const clientConfig_NoWagmi: Config = {
    mode: 'client',
    options: {
        wagmiConfig: undefined as any
    },
    logger: logger
}

export const clientConfig_NoChains: Config = {
    mode: 'client',
    options: {
        chains: [],
        privateKey: OWNER_PRIVATE_KEY,
        transports: {}
    },
    logger: logger
}

export const clientConfig_UsingServerConfig: Config = {
    mode: 'client',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: OWNER_PRIVATE_KEY,
        transports: {
            [anvil.id]: http(),
            [sepolia.id]: http(),
            [baseSepolia.id]: http()
        }
    },
    logger: logger
}

export const serverConfig: Config = {
    mode: 'server',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: OWNER_PRIVATE_KEY,
        transports: {
            [anvil.id]: http(),
            [sepolia.id]: http(),
            [baseSepolia.id]: http()
        }
    },
    logger: logger
}

export const serverConfig_NonOwner: Config = {
    mode: 'server',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: CALLER_PRIVATE_KEY,
        transports: {
            [anvil.id]: http(),
            [sepolia.id]: http(),
            [baseSepolia.id]: http()
        }
    },
    logger: logger
}

export const serverConfig_InvalidMode: Config = {
    // @ts-ignore
    mode: 'random',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: OWNER_PRIVATE_KEY,
        transports: {
            [anvil.id]: http(),
            [sepolia.id]: http(),
            [baseSepolia.id]: http()
        }
    },
    logger: logger
}

export const serverConfig_NoPrivateKey: Config = {
    mode: 'server',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: '' as any,
        transports: {
            [anvil.id]: http(),
            [sepolia.id]: http(),
            [baseSepolia.id]: http()
        }
    },
    logger: logger
}

export const serverConfig_NoChains: Config = {
    mode: 'server',
    options: {
        chains: [],
        privateKey: OWNER_PRIVATE_KEY
    },
    logger: logger
}

export const serverConfig_undefinedChains: Config = {
    mode: 'server',
    // @ts-ignore
    options: {
        privateKey: OWNER_PRIVATE_KEY
    },
    logger: logger
}

export const serverConfig_NoTransport: Config = {
    mode: 'server',
    options: {
        chains: [anvil, sepolia, baseSepolia],
        privateKey: OWNER_PRIVATE_KEY
    },
    logger: logger
}

export const serverConfig_UsingClientConfig: Config = {
    mode: 'server',
    options: {
        wagmiConfig: wagmiConfig
    },
    logger: logger
}
