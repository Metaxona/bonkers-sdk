import { Address, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, mainnet, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 } from '../../src/abi'
import Vault from '../../src/sdk/vault'
import VaultFactory from '../../src/sdk/vaultFactory'
import {
    InvalidChainId,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams
} from '../../src/utils'
import {
    clientAndContractSetup,
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    generateNewImplementation,
    prepareVaultFactory,
    requestToken,
    resetServerChain,
    serverConfig,
    testClient,
    TestVars,
    VAULT_ADMIN,
    VAULT_FACTORY_ADMIN,
    VAULT_FACTORY_CREATION_FEE,
    VAULT_FACTORY_ERC20_CREATION_FEE,
    VAULT_FACTORY_FEE_RECEIVER,
    VAULT_FACTORY_IMPLEMENTATION_ADDRESS,
    VAULT_IMPLEMENTATION_ADDRESS,
    VAULT_PROJECT_NAME,
    VAULT_VERSION
} from '../common/utils'
import vaultImplementation from '../contracts/0_0_1/VaultImplementation.sol/VaultImplementation.json'

describe('Vault Factory Server Test', () => {
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
        expect(vars.serverVaultFactoryNoParams.contractAddress).to.be.undefined
        expect(vars.serverVaultFactoryNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new VaultFactory({
                    // @ts-ignore
                    mode: 'random',
                    options: {
                        privateKey: DEPLOYER_PRIVATE_KEY,
                        chains: [anvil]
                    }
                })
        ).toThrow()

        expect(
            () =>
                new VaultFactory({
                    mode: 'server',
                    options: {
                        privateKey: DEPLOYER_PRIVATE_KEY,
                        chains: [anvil]
                    }
                })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(() => vars.serverVaultFactoryInstance.connectors()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connection', async () => {
        expect(() => vars.serverVaultFactoryInstance.connection()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.serverVaultFactoryInstance.connect(
                    vars.clientControllerInstance.connectors().at(0)!
                )
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Disconnect', async () => {
        expect(async () => await vars.serverVaultFactoryInstance.disconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Switch Chain', async () => {
        expect(
            async () => await vars.serverVaultFactoryInstance.switchChain(sepolia.id)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Use Chain', async () => {
        const { chainId, name } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId2, name: name2 } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId3, name: name3 } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId4, name: name4 } = vars.serverBonkersSDKInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')

        expect(chainId2).eq(anvil.id)
        expect(name2).eq('Anvil')

        expect(chainId3).eq(anvil.id)
        expect(name3).eq('Anvil')

        expect(chainId4).eq(anvil.id)
        expect(name4).eq('Anvil')

        vars.serverVaultFactoryInstance.useChain(sepolia.id)

        const { chainId: chainId5, name: name5 } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId6, name: name6 } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId7, name: name7 } = vars.serverVaultFactoryInstance.chain()
        const { chainId: chainId8, name: name8 } = vars.serverBonkersSDKInstance.chain()

        expect(chainId5).eq(sepolia.id)
        expect(name5).eq('Sepolia')

        expect(chainId6).eq(sepolia.id)
        expect(name6).eq('Sepolia')

        expect(chainId7).eq(sepolia.id)
        expect(name7).eq('Sepolia')

        expect(chainId8).eq(sepolia.id)
        expect(name8).eq('Sepolia')

        resetServerChain(vars.serverVaultFactoryInstance)
    })

    it('Chain', () => {
        const { chainId, name } = vars.serverVaultFactoryInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInstance.reader({
                    address: vars.vaultFactory,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'contractVersion'
                })
        ).rejects.toThrow()
    })

    it('Writer Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInstance.write({
                    address: vars.clientVaultFactoryInstance,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'changeVaultFactoryOwner',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(0)!
        )

        expect(
            async () =>
                // @ts-ignore
                await clientController.write({
                    address: vars.vaultFactory,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'changeVaultFactoryOwner',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientControllerInstance.disconnect()
    })

    it('Get Contract Type', async () => {
        expect(await vars.serverVaultFactoryInstance.getContractType(vars.vaultFactory)).to.be.eq(
            'VAULT FACTORY'
        )
        expect(
            async () => await vars.serverVaultFactoryInstance.getContractType(VAULT_FACTORY_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(
            await vars.serverVaultFactoryInstance.getContractVersion(vars.vaultFactory)
        ).to.be.eq('0.0.1')
        expect(
            async () =>
                await vars.serverVaultFactoryInstance.getContractVersion(VAULT_FACTORY_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Use New Vault Factory', async () => {
        expect(await vars.serverVaultFactoryInstance.implementationAddress()).to.be.eq(
            VAULT_FACTORY_IMPLEMENTATION_ADDRESS
        )

        const vault = await prepareVaultFactory(vars.devToken, VAULT_IMPLEMENTATION_ADDRESS)

        expect(vault).to.not.eq(vars.vaultFactory)

        const params = await vars.serverVaultFactoryInstance.getParams(anvil.id, vault as Address)

        vars.serverVaultFactoryInstance.useNewVaultFactory(anvil.id, params)

        expect(vars.serverVaultFactoryInstance.contractAddress).to.not.be.eq(vars.vaultFactory)

        expect(() =>
            vars.serverVaultFactoryInstance.useNewVaultFactory(anvil.id, {
                address: '0x0',
                abi: vaultFactoryAbi_0_0_1
            })
        ).toThrow()

        vars.serverVaultFactoryInstance.useNewVaultFactory(anvil.id, {
            address: vars.vaultFactory,
            abi: vaultFactoryAbi_0_0_1
        })
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.serverVaultFactoryInstance.getParams(
            anvil.id,
            vars.vaultFactory
        )

        expect(address).eq(vars.vaultFactory)
        expect(abi?.length).gt(0)

        expect(
            async () =>
                await vars.serverVaultFactoryInstance.getParams(mainnet.id, vars.vaultFactory)
        ).rejects.toThrowError(
            new InvalidChainId(`Chain Id [${mainnet.id}] Does Not Exist On The Provided Chains`)
        )
    })

    it('Contract Type', async () => {
        expect(await vars.serverVaultFactoryInstance.contractType()).eq('VAULT FACTORY')

        expect(async () => await vars.serverVaultFactoryNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.contractType()
        ).rejects.toThrow('Failed To Execute Read on: contractType')
    })

    it('Version', async () => {
        expect(await vars.serverVaultFactoryInstance.version()).eq('0.0.1')

        expect(async () => await vars.serverVaultFactoryNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverVaultFactoryInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.serverVaultFactoryInstance.implementationAddress()).to.be.eq(
            VAULT_FACTORY_IMPLEMENTATION_ADDRESS
        )
    })

    it('Get Implementation Details', async () => {
        expect(
            async () => await vars.serverVaultFactoryNoParams.getImplementationDetails()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.getImplementationDetails()
        ).rejects.toThrow('Failed To Execute Read on: getImplementationDetails')

        const result = await vars.serverVaultFactoryInstance.getImplementationDetails()

        expect(result.implementationAddress).to.be.eq(VAULT_IMPLEMENTATION_ADDRESS)
        expect(result.contractType).to.be.eq('VAULT')
        expect(result.version).to.be.eq('0.0.1')
    })

    it('Creation Fee', async () => {
        expect(async () => await vars.serverVaultFactoryNoParams.creationFee()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.creationFee()
        ).rejects.toThrow('Failed To Execute Read on: creationFee')

        const result = await vars.serverVaultFactoryInstance.creationFee()

        expect(result.erc20Fee).to.be.eq(VAULT_FACTORY_ERC20_CREATION_FEE.toString())
        expect(result.ethFee).to.be.eq(VAULT_FACTORY_CREATION_FEE.toString())
    })

    it('Fee Receiver', async () => {
        expect(async () => await vars.serverVaultFactoryNoParams.feeReceiver()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.feeReceiver()
        ).rejects.toThrow('Failed To Execute Read on: feeReceiver')

        expect(await vars.serverVaultFactoryInstance.feeReceiver()).to.be.eq(
            VAULT_FACTORY_FEE_RECEIVER
        )
    })

    it('Total Vaults', async () => {
        expect(async () => await vars.serverVaultFactoryNoParams.totalVaults()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.totalVaults()
        ).rejects.toThrow('Failed To Execute Read on: totalVaults')

        expect(await vars.serverVaultFactoryInstance.totalVaults()).to.be.eq(0)
    })

    it('Owner', async () => {
        expect(async () => await vars.serverVaultFactoryNoParams.owner()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverVaultFactoryInvalidAddress.owner()).rejects.toThrow(
            'Failed To Execute Read on: owner'
        )

        expect(await vars.serverVaultFactoryInstance.owner()).to.be.eq(VAULT_FACTORY_ADMIN)
    })

    it('Erc20 Payment Token', async () => {
        expect(
            async () => await vars.serverVaultFactoryNoParams.erc20PaymentToken()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.erc20PaymentToken()
        ).rejects.toThrow('Failed To Execute Read on: erc20PaymentToken')

        expect(await vars.serverVaultFactoryInstance.erc20PaymentToken()).to.be.eq(vars.devToken)
    })

    it('Create Vault', async () => {
        const totalBefore = await vars.serverVaultFactoryInstance.totalVaults()

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.createVault(
                    DEPLOYER_WALLET,
                    vars.devToken,
                    VAULT_PROJECT_NAME,
                    false
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        // expect(async()=>await vars.serverVaultFactoryInstance.createVault(
        //     DEPLOYER_WALLET,
        //     vars.devToken,
        //     VAULT_PROJECT_NAME,
        //     true
        // )).rejects.toThrow('Failed To Execute Write on: createVault')

        const vault = await vars.serverVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            VAULT_PROJECT_NAME,
            false
        )

        const totalAfter = await vars.serverVaultFactoryInstance.totalVaults()

        expect(vault.result).toBeDefined()

        expect(totalBefore + 1).to.be.eq(totalAfter)

        const vaultInfo = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq(VAULT_PROJECT_NAME)
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(vars.vaultFactory)

        const { erc20Fee } = await vars.serverVaultFactoryInstance.creationFee()

        await requestToken(
            vars.devToken,
            vars.serverVaultFactoryInstance.account() as Address,
            BigInt(erc20Fee)
        )

        const vault2 = await vars.serverVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA 2',
            true
        )

        const totalAfter2 = await vars.serverVaultFactoryInstance.totalVaults()

        expect(vault2.result).toBeDefined()

        expect(totalBefore + 2).to.be.eq(totalAfter2)

        const vaultInfo2 = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault2.result as Address
        )

        expect(vaultInfo2.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo2.projectName).to.be.eq('METAXONA 2')
        expect(vaultInfo2.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo2.deployer).to.be.eq(vars.vaultFactory)
    })

    it('Get Vault Info', async () => {
        const vault = await vars.serverVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA',
            false
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq('METAXONA')
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(vars.vaultFactory)

        expect(
            async () => await vars.serverVaultFactoryNoParams.getVaultInfo(vault.result as Address)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.serverVaultFactoryInvalidAddress.getVaultInfo(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow('Failed To Execute Read on: getVaultInfo')
    })

    it('Update Vault Info', async () => {
        const vault = await vars.serverVaultFactoryInstance.createVault(
            VAULT_ADMIN,
            vars.devToken,
            'METAXONA',
            false
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(VAULT_ADMIN)
        expect(vaultInfo.projectName).to.be.eq('METAXONA')
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(vars.vaultFactory)

        const vaultContract = new Vault(serverConfig, {
            address: vault.result as Address,
            abi: vaultAbi_0_0_1
        })

        await vaultContract.changeVaultOwner(DEPLOYER_WALLET)

        await vars.serverVaultFactoryInstance.updateVaultInfo(vault.result as Address)

        const vaultInfo2 = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo2.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo2.projectName).to.be.eq('METAXONA')
        expect(vaultInfo2.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo2.deployer).to.be.eq(vars.vaultFactory)

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.updateVaultInfo(vault.result as Address)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInvalidAddress.updateVaultInfo('0x0')
        ).rejects.toThrow('Failed To Execute Write on: updateVaultInfo')
    })

    it('Update Implementation', async () => {
        const result = await vars.serverVaultFactoryInstance.getImplementationDetails()

        expect(result.implementationAddress).to.be.eq(VAULT_IMPLEMENTATION_ADDRESS)
        expect(result.contractType).to.be.eq('VAULT')
        expect(result.version).to.be.eq('0.0.1')

        const newImplementation = await generateNewImplementation(vaultImplementation as any)

        await vars.serverVaultFactoryInstance.updateImplementation(newImplementation as Address)

        const result2 = await vars.serverVaultFactoryInstance.getImplementationDetails()

        expect(result2.implementationAddress).to.be.eq(newImplementation)
        expect(result2.contractType).to.be.eq('VAULT')
        expect(result2.version).to.be.eq('0.0.1')

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.updateImplementation(
                    newImplementation as Address
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () => await vars.serverVaultFactoryInstance.updateImplementation(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: updateImplementation')
    })

    it('Set Fee Receiver', async () => {
        expect(await vars.serverVaultFactoryInstance.feeReceiver()).to.be.eq(
            VAULT_FACTORY_FEE_RECEIVER
        )

        await vars.serverVaultFactoryInstance.setFeeReceiver(VAULT_FACTORY_ADMIN)
        expect(await vars.serverVaultFactoryInstance.feeReceiver()).to.be.eq(VAULT_FACTORY_ADMIN)

        expect(
            async () => await vars.serverVaultFactoryInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        // expect(
        //     async () => await vars.serverVaultFactoryInvalidAddress.setFeeReceiver(zeroAddress)
        // ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.serverControllerNoParams.setFeeReceiver(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
    })

    it('Set ERC20 Payment Token', async () => {
        expect(await vars.serverVaultFactoryInstance.erc20PaymentToken()).to.be.eq(vars.devToken)

        await vars.serverVaultFactoryInstance.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
        expect(await vars.serverVaultFactoryInstance.erc20PaymentToken()).to.be.eq(
            VAULT_FACTORY_ADMIN
        )

        expect(
            async () => await vars.serverVaultFactoryInstance.setERC20PaymentToken(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setERC20PaymentToken')

        // expect(
        //     async () => await vars.serverVaultFactoryInvalidAddress.setERC20PaymentToken(zeroAddress)
        // ).rejects.toThrow('Failed To Execute Write on: setERC20PaymentToken')

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
    })

    it('Update Creation Fee', async () => {
        const ethFee = parseEther('0.2')
        const erc20Fee = parseEther('10')

        expect(
            async () => await vars.serverVaultFactoryNoParams.updateCreationFee(ethFee, erc20Fee)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () => await vars.serverVaultFactoryInvalidAddress.updateCreationFee('a', erc20Fee)
        ).rejects.toThrow('Failed To Execute Write on: updateCreationFee')

        await vars.serverVaultFactoryInstance.updateCreationFee(ethFee, erc20Fee)

        const result = await vars.serverVaultFactoryInstance.creationFee()

        expect(result.erc20Fee).to.be.eq(erc20Fee.toString())
        expect(result.ethFee).to.be.eq(ethFee.toString())
    })

    it('Grant Permit', async () => {
        expect(
            async () => await vars.serverVaultFactoryNoParams.grantPermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        // expect(async () => await vars.serverVaultFactoryInvalidAddress.grantPermit(zeroAddress)).rejects.toThrow(
        //     'Failed To Execute Write on: grantPermit'
        // )

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true
    })

    it('Revoke Permit', async () => {
        expect(
            async () => await vars.serverVaultFactoryNoParams.revokePermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        // expect(async () => await vars.serverVaultFactoryInvalidAddress.revokePermit(zeroAddress)).rejects.toThrow(
        //     'Failed To Execute Write on: revokePermit'
        // )

        // expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true

        await vars.serverVaultFactoryInstance.revokePermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false
    })

    it('Is Controller', async () => {
        expect(
            async () => await vars.serverVaultFactoryNoParams.isController(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.isController(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: isController')

        // expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true
    })

    it('Change Vault Factory Owner', async () => {
        expect(
            async () => await vars.serverVaultFactoryInstance.changeVaultFactoryOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeVaultFactoryOwner')

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.changeVaultFactoryOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.serverVaultFactoryInstance.owner()).to.be.eq(VAULT_FACTORY_ADMIN)

        await vars.serverVaultFactoryInstance.changeVaultFactoryOwner(DEPLOYER_WALLET)

        expect(await vars.serverVaultFactoryInstance.owner()).to.be.eq(DEPLOYER_WALLET)
    })
})
