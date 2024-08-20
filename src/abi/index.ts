import type { Abi } from 'viem'
import type { FormattedContractType } from '../types/index.js'
import baseAbi from './baseAbi.js'
import controllerAbi_0_0_1 from './controller/controller_0.0.1.js'
import vaultAbi_0_0_1 from './vault/vault_0.0.1.js'
import vaultFactoryAbi_0_0_1 from './vaultFactory/vaultFactory_0.0.1.js'

export { baseAbi, controllerAbi_0_0_1, vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 }

/**
 * Object Containing Contract Abis separated by contract type and versions
 * Accessible by
 * `abis.(controller|vault|vaultFactory).<version string>`
 *
 * @category Abi
 */
export const abis: Record<FormattedContractType, Record<string, Abi>> = {
    controller: {
        '0.0.1': controllerAbi_0_0_1
    },
    vault: {
        '0.0.1': vaultAbi_0_0_1
    },
    vaultFactory: {
        '0.0.1': vaultFactoryAbi_0_0_1
    }
}
