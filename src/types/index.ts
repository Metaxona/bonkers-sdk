import type { Address } from 'viem'
import type {
    Config,
    ContractInteractionReturnType,
    ContractType,
    ContractVersion,
    IClientInteraction,
    Mode,
    ReaderParams,
    ReaderReturnType,
    WriterParams,
    WriterReturnType
} from './common.js'
import type { ControllerParams, IController } from './controller.js'
import type { IVault, IVaultFactory, VaultFactoryParams, VaultParams } from './vault.js'
import type { IErc20 } from './erc20.js'

export * from './common.js'
export * from './controller.js'
export * from './vault.js'
export * from './erc20.js'
export * from './signature.js'

/**
 * Interface that ensures all important SDK methods
 * are being implemented allowing access to all
 * contract interacting class like Controller, Vault,
 * and Vault Factory using a single mode and config
 *
 * @category SDK
 */
export interface IBonkersSDK extends IClientInteraction {
    readonly mode: Mode
    readonly config: Config

    /**
     * Method allowing access to the controller class
     * and other contract interacting class in a single class
     * using a single mode and config
     *
     * @param controllerParams
     */
    controller(controllerParams?: ControllerParams): IController

    /**
     * Method allowing access to the vault class
     * and other contract interacting class in a single class
     * using a single mode and config
     *
     * @param vaultParams
     */
    vault(vaultParams?: VaultParams): IVault

    /**
     * Method allowing access to the vault factory class
     * and other contract interacting class in a single class
     * using a single mode and config
     *
     * @param vaultFactoryParams
     */
    vaultFactory(vaultFactoryParams?: VaultFactoryParams): IVaultFactory

    /**
     * Method allowing access to the erc20 class
     * and other contract interacting class in a single class
     * using a single mode and config
     *
     * @param tokenAddress
     */
    erc20(tokenAddress?: Address): IErc20

    /**
     * Method used to get the contract version of the given contract address
     * in the current chain
     *
     * @param address
     * @returns
     */
    getContractVersion(address: Address): Promise<ContractVersion>

    /**
     * Method used to get the contract type of the given contract address
     * in the current chain
     *
     * @param address
     * @returns
     */
    getContractType(address: Address): Promise<ContractType>

    /**
     * Method used to interact with contracts by reading into them
     * and is used by all Read Enabled Methods for all class extending from
     * the Base class
     *
     * @param params
     * @returns
     */
    reader(params: ReaderParams): Promise<ReaderReturnType>

    /**
     * Method used to interact with contracts by writing into them
     * and is used by all Write Enabled Methods for all class extending from
     * the Base class
     *
     * @param params
     * @returns
     */
    writer(params: WriterParams): Promise<ContractInteractionReturnType<WriterReturnType>>
}
