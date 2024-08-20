import { Abi, Account, Address, encodeFunctionData, Hex } from 'viem'
import {
    CONTROLLER_ADMIN,
    CONTROLLER_FEE_RECEIVER,
    CONTROLLER_IMPLEMENTATION_ADDRESS,
    CONTROLLER_INITIAL_BOT,
    MOCK_CONTROLLER_IMPLEMENTATION_ADDRESS,
    MULTICALL3_ADDRESS,
    OWNER_WALLET,
    VAULT_ADMIN,
    VAULT_FACTORY_ADMIN,
    VAULT_FACTORY_CREATION_FEE,
    VAULT_FACTORY_ERC20_CREATION_FEE,
    VAULT_FACTORY_FEE_RECEIVER,
    VAULT_FACTORY_IMPLEMENTATION_ADDRESS,
    VAULT_IMPLEMENTATION_ADDRESS,
    VAULT_PROJECT_NAME,
    VAULT_PROJECT_OWNER,
    VAULT_VERSION
} from './accounts'
import { mine, testClient } from './common'

type Artifact = { abi: Abi; bytecode: { object: Hex }; deployedBytecode: { object: Hex } }

import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { logger } from '../../../src/utils'
import controllerImplementation from '../../contracts/0_0_1/ControllerImplementation.sol/ControllerImplementation.json'
import erc20 from '../../contracts/0_0_1/DevToken.sol/DevToken.json'
import proxy from '../../contracts/0_0_1/ERC1967Proxy.sol/ERC1967Proxy.json'
import multicall3 from '../../contracts/0_0_1/Multicall3.sol/Multicall3.json'
import vaultFactoryImplementation from '../../contracts/0_0_1/VaultFactoryImplementation.sol/VaultFactoryImplementation.json'
import vaultImplementation from '../../contracts/0_0_1/VaultImplementation.sol/VaultImplementation.json'
import controllerImplementation_0_0_1_mock from '../../contracts/mocks/ControllerImplementation.sol/ControllerImplementation.json'

export {
    controllerImplementation_0_0_1_mock as controllerImplementation_0_0_1_mock_artifacts,
    controllerImplementation as controllerImplementation_artifacts,
    erc20 as erc20_artifacts,
    multicall3 as multicall3_artifacts,
    proxy as proxy_artifacts,
    vaultFactoryImplementation as vaultFactoryImplementation_artifacts,
    vaultImplementation as vaultImplementation_artifacts
}

export async function prepareERC20() {
    await mine()
    const erc20Artifact = erc20 as unknown as Artifact

    const hash = await testClient.deployContract({
        abi: erc20Artifact.abi,
        bytecode: erc20Artifact.bytecode.object,
        account: testClient.account as Account,
        args: [OWNER_WALLET]
    } as any)

    await mine()

    const tx = await testClient.waitForTransactionReceipt({ hash })

    if (tx.status === 'reverted') throw new Error('ERC20 DEPLOYMENT FAILED')

    return tx.contractAddress
}

export async function prepareMulticall3() {
    try {
        await testClient.setCode({
            address: MULTICALL3_ADDRESS,
            bytecode: multicall3.deployedBytecode.object as Hex
        })
    } catch (error: any) {
        logger.error(error.name, error.message)
    }
}

export async function prepareImplementations() {
    try {
        await testClient.setCode({
            address: CONTROLLER_IMPLEMENTATION_ADDRESS,
            bytecode: controllerImplementation.deployedBytecode.object as Hex
        })
        await testClient.setCode({
            address: VAULT_IMPLEMENTATION_ADDRESS,
            bytecode: vaultImplementation.deployedBytecode.object as Hex
        })
        await testClient.setCode({
            address: VAULT_FACTORY_IMPLEMENTATION_ADDRESS,
            bytecode: vaultFactoryImplementation.deployedBytecode.object as Hex
        })
        await testClient.setCode({
            address: MOCK_CONTROLLER_IMPLEMENTATION_ADDRESS,
            bytecode: controllerImplementation_0_0_1_mock.deployedBytecode.object as Hex
        })
    } catch (error: any) {
        logger.error(error.name, error.message)
    }
}

export async function prepareController() {
    await mine()
    const controllerImplementationArtifact = controllerImplementation as unknown as Artifact
    const proxyArtifact = proxy as unknown as Artifact

    const hash = await testClient.deployContract({
        abi: proxyArtifact.abi,
        bytecode: proxyArtifact.bytecode.object,
        args: [
            CONTROLLER_IMPLEMENTATION_ADDRESS,
            encodeFunctionData({
                abi: controllerImplementationArtifact.abi,
                functionName: 'initialize',
                args: [CONTROLLER_ADMIN, CONTROLLER_FEE_RECEIVER, CONTROLLER_INITIAL_BOT]
            })
        ]
    } as any)

    await mine()
    const tx = await testClient.waitForTransactionReceipt({ hash: hash })

    if (tx.status === 'reverted') throw new Error('CONTROLLER PROXY DEPLOYMENT FAILED')

    return tx.contractAddress
}

export async function prepareVault(token: Address) {
    await mine()
    const vaultImplementationArtifact = vaultImplementation as unknown as Artifact
    const proxyArtifact = proxy as unknown as Artifact

    const hash = await testClient.deployContract({
        abi: proxyArtifact.abi,
        bytecode: proxyArtifact.bytecode.object,
        args: [
            VAULT_IMPLEMENTATION_ADDRESS,
            encodeFunctionData({
                abi: vaultImplementationArtifact.abi,
                functionName: 'initialize',
                args: [
                    VAULT_ADMIN,
                    {
                        id: 1,
                        version: VAULT_VERSION,
                        projectOwner: VAULT_PROJECT_OWNER,
                        projectName: VAULT_PROJECT_NAME,
                        rewardToken: token,
                        createdAt: Math.floor(Date.now() / 1000),
                        deployer: testClient.account.address
                    }
                ]
            })
        ]
    } as any)

    await mine()
    const tx = await testClient.waitForTransactionReceipt({ hash: hash })

    if (tx.status === 'reverted') throw new Error('VAULT PROXY DEPLOYMENT FAILED')

    return tx.contractAddress
}

export async function prepareVaultFactory(token: Address, vaultImplementationAddress: Address) {
    await mine()
    const proxyArtifact = proxy as unknown as Artifact
    const vaultFactoryImplementationArtifact = vaultFactoryImplementation as unknown as Artifact

    const hash = await testClient.deployContract({
        abi: proxyArtifact.abi,
        bytecode: proxyArtifact.bytecode.object,
        args: [
            VAULT_FACTORY_IMPLEMENTATION_ADDRESS,
            encodeFunctionData({
                abi: vaultFactoryImplementationArtifact.abi,
                functionName: 'initialize',
                args: [
                    VAULT_FACTORY_ADMIN,
                    vaultImplementationAddress,
                    VAULT_FACTORY_FEE_RECEIVER,
                    VAULT_FACTORY_CREATION_FEE,
                    token,
                    VAULT_FACTORY_ERC20_CREATION_FEE
                ]
            })
        ]
    } as any)

    await mine()
    const tx = await testClient.waitForTransactionReceipt({ hash: hash })

    if (tx.status === 'reverted') throw new Error('VAULT FACTORY PROXY DEPLOYMENT FAILED')

    return tx.contractAddress
}

export async function prepareMockController_0_0_1_mock() {
    await mine()
    const controllerImplementationArtifact =
        controllerImplementation_0_0_1_mock as unknown as Artifact
    const proxyArtifact = proxy as unknown as Artifact

    const hash = await testClient.deployContract({
        abi: proxyArtifact.abi,
        bytecode: proxyArtifact.bytecode.object,
        args: [
            MOCK_CONTROLLER_IMPLEMENTATION_ADDRESS,
            encodeFunctionData({
                abi: controllerImplementationArtifact.abi,
                functionName: 'initialize',
                args: [CONTROLLER_ADMIN, CONTROLLER_FEE_RECEIVER, CONTROLLER_INITIAL_BOT]
            })
        ]
    } as any)

    await mine()
    const tx = await testClient.waitForTransactionReceipt({ hash: hash })

    if (tx.status === 'reverted') throw new Error('MOCK CONTROLLER PROXY DEPLOYMENT FAILED')

    return tx.contractAddress
}

export async function generateNewImplementation(artifact: Artifact) {
    try {
        const implementationAddress = privateKeyToAddress(generatePrivateKey())
        console.log('NEW IMPLEMENTATION ADDRESS', implementationAddress)

        await testClient.setCode({
            address: implementationAddress,
            bytecode: artifact.deployedBytecode.object
        })

        // const hash = await testClient.deployContract({
        //     abi: artifact.abi,
        //     bytecode: artifact.bytecode.object
        // })

        // const tx = await testClient.waitForTransactionReceipt({hash})

        // return getAddress(tx.contractAddress as Address)

        return implementationAddress
    } catch (error) {
        console.error('GENERATING NEW IMPLEMENTATION FAILED')
        throw error
    }
}
