import { Address, getAddress } from 'viem'
import { anvil } from 'viem/chains'
import {
    CALLER_WALLET,
    clientConfig,
    clientConfig_NonOwner,
    prepareController,
    prepareERC20,
    prepareVault,
    prepareVaultFactory,
    serverConfig,
    serverConfig_NonOwner,
    VAULT_IMPLEMENTATION_ADDRESS
} from '.'
import { controllerAbi_0_0_1, vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 } from '../../../src/abi'
import Controller from '../../../src/sdk/controller'
import BonkersSDK from '../../../src/sdk/sdk'
import Vault from '../../../src/sdk/vault'
import VaultFactory from '../../../src/sdk/vaultFactory'
import { getParameters } from '../../../src/utils'

export async function clientAndContractSetup() {
    const devToken = getAddress((await prepareERC20()) as Address)
    const controller = getAddress((await prepareController()) as Address)
    const vault = getAddress((await prepareVault(devToken)) as Address)
    const vaultFactory = getAddress(
        (await prepareVaultFactory(devToken, VAULT_IMPLEMENTATION_ADDRESS)) as Address
    )

    console.log('DEV TOKEN', devToken)
    console.log('CONTROLLER', controller)
    console.log('VAULT', vault)
    console.log('VAULT FACTORY', vaultFactory)

    const params = await Promise.all([
        getParameters({ chain: anvil, address: controller, expectedType: 'CONTROLLER' }),
        getParameters({ chain: anvil, address: vault, expectedType: 'VAULT' }),
        getParameters({ chain: anvil, address: vaultFactory, expectedType: 'VAULT FACTORY' })
    ])

    const controllerParams = params[0]
    const vaultParams = params[1]
    const vaultFactoryParams = params[2]

    const clientBonkersSDKInstance = new BonkersSDK(clientConfig)
    const clientControllerInstance = new Controller(clientConfig, controllerParams)
    const clientVaultInstance = new Vault(clientConfig, vaultParams)
    const clientVaultFactoryInstance = new VaultFactory(clientConfig, vaultFactoryParams)

    const serverBonkersSDKInstance = new BonkersSDK(serverConfig)
    const serverControllerInstance = new Controller(serverConfig, controllerParams)
    const serverVaultInstance = new Vault(serverConfig, vaultParams)
    const serverVaultFactoryInstance = new VaultFactory(serverConfig, vaultFactoryParams)

    const clientControllerInvalidAddress = new Controller(clientConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: controllerAbi_0_0_1
    })
    const clientControllerNoParams = new Controller(clientConfig_NonOwner)

    const clientVaultInvalidAddress = new Vault(clientConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: vaultAbi_0_0_1
    })
    const clientVaultNoParams = new Vault(clientConfig_NonOwner)

    const clientVaultFactoryInvalidAddress = new VaultFactory(clientConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: vaultFactoryAbi_0_0_1
    })
    const clientVaultFactoryNoParams = new VaultFactory(clientConfig_NonOwner)

    const serverControllerInvalidAddress = new Controller(serverConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: controllerAbi_0_0_1
    })
    const serverControllerNoParams = new Controller(serverConfig_NonOwner)

    const serverVaultInvalidAddress = new Vault(serverConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: vaultAbi_0_0_1
    })
    const serverVaultNoParams = new Vault(serverConfig_NonOwner)

    const serverVaultFactoryInvalidAddress = new VaultFactory(serverConfig_NonOwner, {
        address: CALLER_WALLET,
        abi: vaultFactoryAbi_0_0_1
    })
    const serverVaultFactoryNoParams = new VaultFactory(serverConfig_NonOwner)

    return {
        devToken,
        controller,
        vault,
        vaultFactory,
        clientBonkersSDKInstance,
        clientControllerInstance,
        clientVaultInstance,
        clientVaultFactoryInstance,
        serverBonkersSDKInstance,
        serverControllerInstance,
        serverVaultInstance,
        serverVaultFactoryInstance,

        clientControllerInvalidAddress,
        clientControllerNoParams,
        clientVaultInvalidAddress,
        clientVaultNoParams,
        clientVaultFactoryInvalidAddress,
        clientVaultFactoryNoParams,

        serverControllerInvalidAddress,
        serverControllerNoParams,
        serverVaultInvalidAddress,
        serverVaultNoParams,
        serverVaultFactoryInvalidAddress,
        serverVaultFactoryNoParams
    }
}
