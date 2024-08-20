import type { Config, IClientInteraction, Mode } from './common.js'
import type { ControllerParams, IController } from './controller.js'
import type { IVault, IVaultFactory, VaultFactoryParams, VaultParams } from './vault.js'

export * from './common.js'
export * from './controller.js'
export * from './vault.js'

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
}
