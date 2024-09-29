import { Address } from 'viem'
import Controller from '../../../src/sdk/controller'
import BonkersSDK from '../../../src/sdk/sdk'
import Vault from '../../../src/sdk/vault'
import VaultFactory from '../../../src/sdk/vaultFactory'
import Erc20 from '../../../src/sdk/erc20'

export type TestVars = {
    devToken: Address
    controller: Address
    vault: Address
    vaultFactory: Address
    clientBonkersSDKInstance: BonkersSDK
    clientControllerInstance: Controller
    clientVaultInstance: Vault
    clientVaultFactoryInstance: VaultFactory
    serverBonkersSDKInstance: BonkersSDK
    serverControllerInstance: Controller
    serverVaultInstance: Vault
    serverVaultFactoryInstance: VaultFactory

    clientControllerInvalidAddress: Controller
    clientControllerNoParams: Controller
    clientVaultInvalidAddress: Vault
    clientVaultNoParams: Vault
    clientVaultFactoryInvalidAddress: VaultFactory
    clientVaultFactoryNoParams: VaultFactory

    serverControllerInvalidAddress: Controller
    serverControllerNoParams: Controller
    serverVaultInvalidAddress: Vault
    serverVaultNoParams: Vault
    serverVaultFactoryInvalidAddress: VaultFactory
    serverVaultFactoryNoParams: VaultFactory

    clientErc20Instance: Erc20
    serverErc20Instance: Erc20
    clientErc20InvalidAddress: Erc20
    clientErc20NoParams: Erc20
    serverErc20InvalidAddress: Erc20
    serverErc20NoParams: Erc20
}
