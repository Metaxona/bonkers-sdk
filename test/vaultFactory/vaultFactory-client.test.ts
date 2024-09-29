import { Address, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 } from '../../src/abi'
import Vault from '../../src/sdk/vault'
import VaultFactory from '../../src/sdk/vaultFactory'
import {
    InvalidContract,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams
} from '../../src/utils'
import {
    CALLER_WALLET,
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
import { ClientConfig } from '../../src/types'
import { getBalance } from 'viem/actions'

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

    afterEach(async () => {
        await vars.clientVaultFactoryInstance.disconnect()
    })

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
        expect(vars.clientVaultFactoryInstance.connectors().length).to.be.eq(6)
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

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientVaultFactoryInstance.connect(
                    vars.clientVaultFactoryInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(0)!
        )

        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(5)!
        )

        const res = await vars.clientVaultFactoryInstance.reconnect()

        expect(res.length).to.eq(1)

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

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
        const { id, chainId, name, symbol } = vars.clientVaultFactoryInstance.chain()
        const {
            id: id2,
            chainId: chainId2,
            name: name2,
            symbol: symbol2
        } = vars.clientVaultInstance.chain()
        const {
            id: id3,
            chainId: chainId3,
            name: name3,
            symbol: symbol3
        } = vars.clientVaultFactoryInstance.chain()
        const {
            id: id4,
            chainId: chainId4,
            name: name4,
            symbol: symbol4
        } = vars.clientBonkersSDKInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(id).eq(anvil.id)
        expect(symbol).eq(anvil.nativeCurrency.symbol)

        expect(chainId2).eq(anvil.id)
        expect(name2).eq('Anvil')
        expect(id2).eq(anvil.id)
        expect(symbol2).eq(anvil.nativeCurrency.symbol)

        expect(chainId3).eq(anvil.id)
        expect(name3).eq('Anvil')
        expect(id3).eq(anvil.id)
        expect(symbol3).eq(anvil.nativeCurrency.symbol)

        expect(chainId4).eq(anvil.id)
        expect(name4).eq('Anvil')
        expect(id4).eq(anvil.id)
        expect(symbol4).eq(anvil.nativeCurrency.symbol)

        const switchR = await vars.clientVaultFactoryInstance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.clientVaultFactoryInstance.chain()
        const {
            id: id6,
            chainId: chainId6,
            name: name6,
            symbol: symbol6
        } = vars.clientVaultInstance.chain()
        const {
            id: id7,
            chainId: chainId7,
            name: name7,
            symbol: symbol7
        } = vars.clientVaultFactoryInstance.chain()
        const {
            id: id8,
            chainId: chainId8,
            name: name8,
            symbol: symbol8
        } = vars.clientBonkersSDKInstance.chain()

        expect(chainId5).eq(sepolia.id)
        expect(name5).eq('Sepolia')
        expect(id5).eq(sepolia.id)
        expect(symbol5).eq(sepolia.nativeCurrency.symbol)

        expect(chainId6).eq(sepolia.id)
        expect(name6).eq('Sepolia')
        expect(id6).eq(sepolia.id)
        expect(symbol6).eq(sepolia.nativeCurrency.symbol)

        expect(chainId7).eq(sepolia.id)
        expect(name7).eq('Sepolia')
        expect(id7).eq(sepolia.id)
        expect(symbol7).eq(sepolia.nativeCurrency.symbol)

        expect(chainId8).eq(sepolia.id)
        expect(name8).eq('Sepolia')
        expect(id8).eq(sepolia.id)
        expect(symbol8).eq(sepolia.nativeCurrency.symbol)

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

    it('Chains', () => {
        const chains = vars.clientVaultFactoryInstance.chains()

        expect(chains.length).eq(3)
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                await vars.clientControllerInstance.reader({
                    address: vars.vaultFactory,
                    abi: vaultFactoryAbi_0_0_1,
                    functionName: 'contractVersion'
                })
        ).rejects.toThrow()
    })

    it('Writer Error', async () => {
        expect(
            async () =>
                await vars.clientControllerInstance.writer({
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
                await vars.clientControllerInstance.writer({
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
                address: zeroAddress,
                abi: vaultFactoryAbi_0_0_1
            })
        ).toThrow(new InvalidContract('Can Not Be Zero Address'))

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
            async () => await vars.clientVaultFactoryNoParams.getImplementationDetails()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.getImplementationDetails()
        ).rejects.toThrow('Failed To Execute Read on: getImplementationDetails')

        const result = await vars.clientVaultFactoryInstance.getImplementationDetails()

        expect(result.implementationAddress).to.be.eq(VAULT_IMPLEMENTATION_ADDRESS)
        expect(result.contractType).to.be.eq('VAULT')
        expect(result.version).to.be.eq('0.0.1')
    })

    it('Creation Fee', async () => {
        expect(async () => await vars.clientVaultFactoryNoParams.creationFee()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.creationFee()
        ).rejects.toThrow('Failed To Execute Read on: creationFee')

        const result = await vars.clientVaultFactoryInstance.creationFee()

        expect(result.erc20Fee).to.be.eq(VAULT_FACTORY_ERC20_CREATION_FEE.toString())
        expect(result.ethFee).to.be.eq(VAULT_FACTORY_CREATION_FEE.toString())
    })

    it('Fee Receiver', async () => {
        expect(async () => await vars.clientVaultFactoryNoParams.feeReceiver()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.feeReceiver()
        ).rejects.toThrow('Failed To Execute Read on: feeReceiver')

        expect(await vars.clientVaultFactoryInstance.feeReceiver()).to.be.eq(
            VAULT_FACTORY_FEE_RECEIVER
        )
    })

    it('Total Vaults', async () => {
        expect(async () => await vars.clientVaultFactoryNoParams.totalVaults()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.totalVaults()
        ).rejects.toThrow('Failed To Execute Read on: totalVaults')

        expect(await vars.clientVaultFactoryInstance.totalVaults()).to.be.eq(0)
    })

    it('Owner', async () => {
        expect(async () => await vars.clientVaultFactoryNoParams.owner()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientVaultFactoryInvalidAddress.owner()).rejects.toThrow(
            'Failed To Execute Read on: owner'
        )

        expect(await vars.clientVaultFactoryInstance.owner()).to.be.eq(VAULT_FACTORY_ADMIN)
    })

    it('Erc20 Payment Token', async () => {
        expect(
            async () => await vars.clientVaultFactoryNoParams.erc20PaymentToken()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.erc20PaymentToken()
        ).rejects.toThrow('Failed To Execute Read on: erc20PaymentToken')

        expect(await vars.clientVaultFactoryInstance.erc20PaymentToken()).to.be.eq(vars.devToken)
    })

    it('Create Vault', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

        const totalBefore = await vars.clientVaultFactoryInstance.totalVaults()

        expect(
            async () =>
                await vars.clientVaultFactoryNoParams.createVault(
                    DEPLOYER_WALLET,
                    vars.devToken,
                    VAULT_PROJECT_NAME,
                    false
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.clientVaultFactoryInstance.createVault(
                    DEPLOYER_WALLET,
                    // @ts-ignore
                    zeroAddress,
                    VAULT_PROJECT_NAME,
                    true
                )
        ).rejects.toThrow('Failed To Execute Write on: createVault')

        const vault = await vars.clientVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            VAULT_PROJECT_NAME,
            false
        )

        const totalAfter = await vars.clientVaultFactoryInstance.totalVaults()

        expect(vault.result).toBeDefined()

        expect(totalBefore + 1).to.be.eq(totalAfter)

        const vaultInfo = await vars.clientVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq(VAULT_PROJECT_NAME)
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(vars.vaultFactory)

        const { erc20Fee } = await vars.clientVaultFactoryInstance.creationFee()

        await requestToken(
            vars.devToken,
            vars.clientVaultFactoryInstance.account() as Address,
            BigInt(erc20Fee)
        )

        const vault2 = await vars.clientVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA 2',
            true
        )

        const totalAfter2 = await vars.clientVaultFactoryInstance.totalVaults()

        expect(vault2.result).toBeDefined()

        expect(totalBefore + 2).to.be.eq(totalAfter2)

        const vaultInfo2 = await vars.clientVaultFactoryInstance.getVaultInfo(
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

        const vault = await vars.clientVaultFactoryInstance.createVault(
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA',
            false
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.clientVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq('METAXONA')
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(vars.vaultFactory)

        expect(
            async () => await vars.clientVaultFactoryNoParams.getVaultInfo(vault.result as Address)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.clientVaultFactoryInvalidAddress.getVaultInfo(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow('Failed To Execute Read on: getVaultInfo')

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Update Vault Info', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        const vault = await vars.clientVaultFactoryInstance.createVault(
            VAULT_ADMIN,
            vars.devToken,
            'METAXONA',
            false
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.clientVaultFactoryInstance.getVaultInfo(
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

        await vars.clientVaultFactoryInstance.updateVaultInfo(vault.result as Address)

        const vaultInfo2 = await vars.clientVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo2.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo2.projectName).to.be.eq('METAXONA')
        expect(vaultInfo2.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo2.deployer).to.be.eq(vars.vaultFactory)

        expect(
            async () =>
                await vars.clientVaultFactoryNoParams.updateVaultInfo(vault.result as Address)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInstance.updateVaultInfo(zeroAddress)
        ).rejects.toThrow()

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Update Implementation', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        const result = await vars.clientVaultFactoryInstance.getImplementationDetails()

        expect(result.implementationAddress).to.be.eq(VAULT_IMPLEMENTATION_ADDRESS)
        expect(result.contractType).to.be.eq('VAULT')
        expect(result.version).to.be.eq('0.0.1')

        const newImplementation = await generateNewImplementation(vaultImplementation as any)

        await vars.clientVaultFactoryInstance.updateImplementation(newImplementation as Address)

        const result2 = await vars.clientVaultFactoryInstance.getImplementationDetails()

        expect(result2.implementationAddress).to.be.eq(newImplementation)
        expect(result2.contractType).to.be.eq('VAULT')
        expect(result2.version).to.be.eq('0.0.1')

        expect(
            async () =>
                await vars.clientVaultFactoryNoParams.updateImplementation(
                    newImplementation as Address
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInstance.updateImplementation(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: updateImplementation')
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Set Fee Receiver', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(await vars.clientVaultFactoryInstance.feeReceiver()).to.be.eq(
            VAULT_FACTORY_FEE_RECEIVER
        )

        await vars.clientVaultFactoryInstance.setFeeReceiver(VAULT_FACTORY_ADMIN)
        expect(await vars.clientVaultFactoryInstance.feeReceiver()).to.be.eq(VAULT_FACTORY_ADMIN)

        expect(
            async () => await vars.clientVaultFactoryInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.clientVaultFactoryInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.clientControllerNoParams.setFeeReceiver(VAULT_FACTORY_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Set ERC20 Payment Token', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

        expect(await vars.clientVaultFactoryInstance.erc20PaymentToken()).to.be.eq(vars.devToken)

        await vars.clientVaultFactoryInstance.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
        expect(await vars.clientVaultFactoryInstance.erc20PaymentToken()).to.be.eq(
            VAULT_FACTORY_ADMIN
        )

        expect(
            // @ts-ignore
            async () => await vars.clientVaultFactoryInstance.setERC20PaymentToken('0x0')
        ).rejects.toThrow()

        expect(
            async () => await vars.clientVaultFactoryInstance.setERC20PaymentToken(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setERC20PaymentToken')

        expect(
            async () =>
                await vars.clientVaultFactoryNoParams.setERC20PaymentToken(VAULT_FACTORY_ADMIN)
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
            async () => await vars.clientVaultFactoryNoParams.updateCreationFee(ethFee, erc20Fee)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () => await vars.clientVaultFactoryInvalidAddress.updateCreationFee('a', erc20Fee)
        ).rejects.toThrow('Failed To Execute Write on: updateCreationFee')

        await vars.clientVaultFactoryInstance.updateCreationFee(ethFee, erc20Fee)

        const result = await vars.clientVaultFactoryInstance.creationFee()

        expect(result.erc20Fee).to.be.eq(erc20Fee.toString())
        expect(result.ethFee).to.be.eq(ethFee.toString())
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Grant Permit', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )

        expect(
            async () => await vars.clientVaultFactoryNoParams.grantPermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInstance.grantPermit(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: grantPermit')

        expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.true
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Revoke Permit', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(
            async () => await vars.clientVaultFactoryNoParams.revokePermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInstance.revokePermit(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: revokePermit')

        // expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.true

        await vars.clientVaultFactoryInstance.revokePermit(vars.controller)

        expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.false
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Is Controller', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(
            async () => await vars.clientVaultFactoryNoParams.isController(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultFactoryInvalidAddress.isController(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: isController')

        // expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultFactoryInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultFactoryInstance.isController(vars.controller)).to.be.true
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Change Vault Factory Owner', async () => {
        await vars.clientVaultFactoryInstance.connect(
            vars.clientVaultFactoryInstance.connectors().at(1)!
        )
        expect(
            async () => await vars.clientVaultFactoryInstance.changeVaultFactoryOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeVaultFactoryOwner')

        expect(
            async () =>
                await vars.clientVaultFactoryNoParams.changeVaultFactoryOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.clientVaultFactoryInstance.owner()).to.be.eq(VAULT_FACTORY_ADMIN)

        await vars.clientVaultFactoryInstance.changeVaultFactoryOwner(DEPLOYER_WALLET)

        expect(await vars.clientVaultFactoryInstance.owner()).to.be.eq(DEPLOYER_WALLET)
        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Balance', async () => {
        const initialBalance = await vars.clientVaultInstance.balanceOf(vars.vaultFactory)

        expect(async () => await vars.clientVaultFactoryNoParams.balance()).rejects.toThrowError(
            new MissingRequiredParams('Contract Abi')
        )

        expect(await vars.clientVaultFactoryInstance.balance()).to.be.eq(initialBalance)

        const connector1 = vars.clientVaultFactoryInstance.connectors()[0]!

        await vars.clientVaultFactoryInstance.connect(connector1)

        expect(await vars.clientVaultFactoryInstance.balance()).to.be.eq(initialBalance)

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })

    it('Balance Of', async () => {
        expect(await vars.clientVaultFactoryInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        const connector1 = vars.clientVaultFactoryInstance.connectors()[0]!

        await vars.clientVaultFactoryInstance.connect(connector1)

        expect(await vars.clientVaultFactoryInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(
            async () => await vars.clientVaultFactoryNoParams.balanceOf('0x')
        ).rejects.toThrowError()

        await resetClientConnection(vars.clientVaultFactoryInstance)
    })
})
