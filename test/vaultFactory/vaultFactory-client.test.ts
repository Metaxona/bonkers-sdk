import { Address, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 } from '../../src/abi'
import Vault from '../../src/sdk/vault'
import VaultFactory from '../../src/sdk/vaultFactory'
import {
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams
} from '../../src/utils'
import {
    clientAndContractSetup,
    clientConfig,
    DEPLOYER_WALLET,
    generateNewImplementation,
    prepareVaultFactory,
    requestToken,
    resetClientChain,
    resetClientConnection,
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
    VAULT_VERSION,
    wagmiConfig
} from '../common/utils'
import vaultImplementation from '../contracts/0_0_1/VaultImplementation.sol/VaultImplementation.json'

describe('Vault Factory Client Test', () => {
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
        expect(vars.clientVaultFactoryNoParams.contractAddress).to.be.undefined
        expect(vars.clientVaultFactoryNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new VaultFactory({
                    // @ts-ignore
                    mode: 'random',
                    options: {
                        wagmiConfig: wagmiConfig
                    }
                })
        ).toThrow()

        expect(
            () => new VaultFactory({ mode: 'client', options: { wagmiConfig: wagmiConfig } })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(vars.clientVaultFactoryInstance.connectors().length).to.be.eq(5)
        vars.clientVaultFactoryInstance.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })
    })

    it('Connection', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(0)!
        )

        expect(vars.clientVaultFactoryInstance.connection()).to.eq('connected')

        await vars.clientVaultFactoryInstance.disconnect()

        expect(vars.clientVaultFactoryInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientVaultFactoryInstance.connect(
                    vars.clientVaultFactoryInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        const connect = await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(0)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientVaultFactoryInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Disconnect', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(0)!
        )

        expect(vars.clientVaultFactoryInstance.connection()).to.eq('connected')

        await vars.clientVaultFactoryInstance.disconnect()

        expect(vars.clientVaultFactoryInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Switch Chain', async () => {
        const { chainId, name } = vars.clientVaultFactoryInstance.chain()
        const { chainId: chainId2, name: name2 } = vars.clientVaultInstance.chain()
        const { chainId: chainId3, name: name3 } = vars.clientVaultFactoryInstance.chain()
        const { chainId: chainId4, name: name4 } = vars.clientBonkersSDKInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')

        expect(chainId2).eq(anvil.id)
        expect(name2).eq('Anvil')

        expect(chainId3).eq(anvil.id)
        expect(name3).eq('Anvil')

        expect(chainId4).eq(anvil.id)
        expect(name4).eq('Anvil')

        const switchR = await vars.clientVaultFactoryInstance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const { chainId: chainId5, name: name5 } = vars.clientVaultFactoryInstance.chain()
        const { chainId: chainId6, name: name6 } = vars.clientVaultInstance.chain()
        const { chainId: chainId7, name: name7 } = vars.clientVaultFactoryInstance.chain()
        const { chainId: chainId8, name: name8 } = vars.clientBonkersSDKInstance.chain()

        expect(chainId5).eq(sepolia.id)
        expect(name5).eq('Sepolia')

        expect(chainId6).eq(sepolia.id)
        expect(name6).eq('Sepolia')

        expect(chainId7).eq(sepolia.id)
        expect(name7).eq('Sepolia')

        expect(chainId8).eq(sepolia.id)
        expect(name8).eq('Sepolia')

        await resetClientChain(vars.clientVaultFactoryInstance)
    })

    it('Use Chain', async () => {
        expect(() => vars.clientVaultFactoryInstance.useChain(sepolia.id)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )
    })

    it('Chain', () => {
        const { chainId, name } = vars.clientVaultFactoryInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.reader({
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
                await vars.serverControllerInstance.write({
                    address: vars.vaultFactory,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(0)!
        )

        expect(
            async () =>
                // @ts-ignore
                await clientController.write({
                    address: vars.vaultFactory,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientVaultFactoryInstance.disconnect()
    })

    it('Get Contract Type', async () => {
        expect(await vars.clientVaultFactoryInstance.getContractType(vars.vaultFactory)).to.be.eq(
            'VAULT FACTORY'
        )
        expect(
            async () => await vars.clientVaultFactoryInstance.getContractType(VAULT_FACTORY_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(
            await vars.clientVaultFactoryInstance.getContractVersion(vars.vaultFactory)
        ).to.be.eq('0.0.1')
        expect(
            async () =>
                await vars.clientVaultFactoryInstance.getContractVersion(VAULT_FACTORY_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Use New Vault Factory', async () => {
        const vaultFactory = await prepareVaultFactory(vars.devToken, VAULT_IMPLEMENTATION_ADDRESS)

        expect(vaultFactory).to.not.eq(vars.vaultFactory)

        const params = await vars.clientVaultFactoryInstance.getParams(
            anvil.id,
            vaultFactory as Address
        )

        vars.clientVaultFactoryInstance.useNewVaultFactory(anvil.id, params)

        expect(vars.clientVaultFactoryInstance.contractAddress).to.not.be.eq(vars.vaultFactory)

        expect(() =>
            vars.clientVaultFactoryInstance.useNewVaultFactory(anvil.id, {
                address: '0x0',
                abi: vaultFactoryAbi_0_0_1
            })
        ).toThrow()

        vars.clientVaultFactoryInstance.useNewVaultFactory(anvil.id, {
            address: vars.vaultFactory,
            abi: vaultFactoryAbi_0_0_1
        })
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.clientVaultFactoryInstance.getParams(
            anvil.id,
            vars.vaultFactory
        )

        expect(address).eq(vars.vaultFactory)
        expect(abi?.length).gt(0)
    })

    it('Contract Type', async () => {
        expect(await vars.clientVaultFactoryInstance.contractType()).eq('VAULT FACTORY')

        expect(async () => await vars.clientVaultFactoryNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.contractType()
        ).rejects.toThrow('Failed To Execute Read on: contractType')
    })

    it('Version', async () => {
        expect(await vars.clientVaultFactoryInstance.version()).eq('0.0.1')

        expect(async () => await vars.clientVaultFactoryNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientVaultFactoryInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.clientVaultFactoryInstance.implementationAddress()).to.be.eq(
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
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

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

        expect(
            async () =>
                await vars.serverVaultFactoryInstance.createVault(
                    DEPLOYER_WALLET,
                    // @ts-ignore
                    '0x0',
                    VAULT_PROJECT_NAME,
                    true
                )
        ).rejects.toThrow('Failed To Execute Write on: createVault')

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

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Get Vault Info', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

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

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Update Vault Info', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
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

        const vaultContract = new Vault(clientConfig, {
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

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Update Implementation', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
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
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Set Fee Receiver', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(await vars.serverVaultFactoryInstance.feeReceiver()).to.be.eq(
            VAULT_FACTORY_FEE_RECEIVER
        )

        await vars.serverVaultFactoryInstance.setFeeReceiver(VAULT_FACTORY_ADMIN)
        expect(await vars.serverVaultFactoryInstance.feeReceiver()).to.be.eq(VAULT_FACTORY_ADMIN)

        expect(
            async () => await vars.serverVaultFactoryInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInvalidAddress.setFeeReceiver('0x0')
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.serverControllerNoParams.setFeeReceiver(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Set ERC20 Payment Token', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

        expect(await vars.serverVaultFactoryInstance.erc20PaymentToken()).to.be.eq(vars.devToken)

        await vars.serverVaultFactoryInstance.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
        expect(await vars.serverVaultFactoryInstance.erc20PaymentToken()).to.be.eq(
            VAULT_FACTORY_ADMIN
        )

        expect(
            async () => await vars.serverVaultFactoryInstance.setERC20PaymentToken(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setERC20PaymentToken')

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInvalidAddress.setERC20PaymentToken('0x0')
        ).rejects.toThrow('Failed To Execute Write on: setERC20PaymentToken')

        expect(
            async () =>
                await vars.serverVaultFactoryNoParams.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Update Creation Fee', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
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
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Grant Permit', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

        expect(
            async () => await vars.serverVaultFactoryNoParams.grantPermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInvalidAddress.grantPermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: grantPermit')

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Revoke Permit', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(
            async () => await vars.serverVaultFactoryNoParams.revokePermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultFactoryInvalidAddress.revokePermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: revokePermit')

        // expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true

        await vars.serverVaultFactoryInstance.revokePermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Is Controller', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(
            async () => await vars.serverVaultFactoryNoParams.isController(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultFactoryInvalidAddress.isController(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: isController')

        // expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultFactoryInstance.isController(vars.controller)).to.be.true
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Change Vault Factory Owner', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
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
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })
})
