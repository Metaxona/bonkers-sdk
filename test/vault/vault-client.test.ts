import { Address, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vaultAbi_0_0_1 } from '../../src/abi'
import Vault from '../../src/sdk/vault'
import { Receiver } from '../../src/types'
import {
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams
} from '../../src/utils'
import {
    clientAndContractSetup,
    DEPLOYER_WALLET,
    prepareVault,
    RECEIVER_WALLET,
    requestToken,
    resetClientChain,
    resetClientConnection,
    testClient,
    TestVars,
    tokenBalanceOf,
    VAULT_ADMIN,
    VAULT_IMPLEMENTATION_ADDRESS,
    VAULT_PROJECT_NAME,
    VAULT_VERSION,
    wagmiConfig
} from '../common/utils'

describe('Vault Client Test', () => {
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
        expect(vars.clientVaultNoParams.contractAddress).to.be.undefined
        expect(vars.clientVaultNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new Vault({
                    // @ts-ignore
                    mode: 'random',
                    options: {
                        wagmiConfig: wagmiConfig
                    }
                })
        ).toThrow()

        expect(
            () => new Vault({ mode: 'client', options: { wagmiConfig: wagmiConfig } })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(vars.clientVaultInstance.connectors().length).to.be.eq(5)
        vars.clientVaultInstance.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })
    })

    it('Connection', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(0)!)

        expect(vars.clientVaultInstance.connection()).to.eq('connected')

        await vars.clientVaultInstance.disconnect()

        expect(vars.clientVaultInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(2)!)
        ).rejects.toThrow()

        const connect = await vars.clientVaultInstance.connect(
            vars.clientVaultInstance.connectors().at(0)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientVaultInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Disconnect', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(0)!)

        expect(vars.clientVaultInstance.connection()).to.eq('connected')

        await vars.clientVaultInstance.disconnect()

        expect(vars.clientVaultInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Switch Chain', async () => {
        const { chainId, name } = vars.clientVaultInstance.chain()
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

        const switchR = await vars.clientVaultInstance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const { chainId: chainId5, name: name5 } = vars.clientVaultInstance.chain()
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

        await resetClientChain(vars.clientVaultInstance)
    })

    it('Use Chain', async () => {
        expect(() => vars.clientVaultInstance.useChain(sepolia.id)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )
    })

    it('Chain', () => {
        const { chainId, name } = vars.clientVaultInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.reader({
                    address: vars.vault,
                    abi: vaultAbi_0_0_1,
                    functionName: 'contractVersion'
                })
        ).rejects.toThrow()
    })

    it('Writer Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.write({
                    address: vars.vault,
                    abi: vaultAbi_0_0_1,
                    functionName: 'changeVaultOwner',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(0)!)

        expect(
            async () =>
                // @ts-ignore
                await clientController.write({
                    address: vars.vault,
                    abi: vaultAbi_0_0_1,
                    functionName: 'changeVaultOwner',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientVaultInstance.disconnect()
    })

    it('Get Contract Type', async () => {
        expect(await vars.clientVaultInstance.getContractType(vars.vault)).to.be.eq('VAULT')
        expect(
            async () => await vars.clientVaultInstance.getContractType(VAULT_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(await vars.clientVaultInstance.getContractVersion(vars.vault)).to.be.eq('0.0.1')
        expect(
            async () => await vars.clientVaultInstance.getContractVersion(VAULT_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Use New Vault', async () => {
        const vault = await prepareVault(vars.devToken)

        expect(vault).to.not.eq(vars.vault)

        const params = await vars.clientVaultInstance.getParams(anvil.id, vault as Address)

        vars.clientVaultInstance.useNewVault(anvil.id, params)

        expect(vars.clientVaultInstance.contractAddress).to.not.be.eq(vars.vault)

        expect(() =>
            vars.clientVaultInstance.useNewVault(anvil.id, { address: '0x0', abi: vaultAbi_0_0_1 })
        ).toThrow()

        vars.clientVaultInstance.useNewVault(anvil.id, { address: vars.vault, abi: vaultAbi_0_0_1 })
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.clientVaultInstance.getParams(anvil.id, vars.vault)

        expect(address).eq(vars.vault)
        expect(abi?.length).gt(0)
    })

    it('Contract Type', async () => {
        expect(await vars.clientVaultInstance.contractType()).eq('VAULT')

        expect(async () => await vars.clientVaultNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientVaultInvalidAddress.contractType()).rejects.toThrow(
            'Failed To Execute Read on: contractType'
        )
    })

    it('Version', async () => {
        expect(await vars.clientVaultInstance.version()).eq('0.0.1')

        expect(async () => await vars.clientVaultNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientVaultInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.clientVaultInstance.implementationAddress()).to.be.eq(
            VAULT_IMPLEMENTATION_ADDRESS
        )
    })

    it('Get Vault Info', async () => {
        const vaultInfo = await vars.clientVaultInstance.getVaultInfo()

        expect(Number(vaultInfo.id)).to.be.eq(1)
        expect(vaultInfo.projectOwner).to.be.eq(VAULT_ADMIN)
        expect(vaultInfo.projectName).to.be.eq(VAULT_PROJECT_NAME)
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(DEPLOYER_WALLET)

        expect(async () => await vars.clientVaultNoParams.getVaultInfo()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientVaultInvalidAddress.getVaultInfo()).rejects.toThrow(
            'Failed To Execute Read on: getVaultInfo'
        )
    })

    it('Reward Pool', async () => {
        expect(await vars.clientVaultInstance.rewardPool()).to.be.eq(0)

        await requestToken(vars.devToken, vars.vault, parseEther('100'))

        expect(await vars.clientVaultInstance.rewardPool()).to.be.eq(100)

        expect(async () => await vars.clientVaultNoParams.rewardPool()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )
        expect(async () => await vars.clientVaultInvalidAddress.rewardPool()).rejects.toThrow(
            'Failed To Execute Read on: rewardPool'
        )
    })

    it('Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.clientVaultInstance.controllerLimits(
            vars.controller
        )
        expect(quota).to.be.eq('0')
        expect(rewardAllowance).to.be.eq('0')

        expect(
            async () => await vars.clientVaultNoParams.controllerLimits(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.clientVaultInvalidAddress.controllerLimits(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: controllerLimits')
    })

    it('Default Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.clientVaultInstance.defaultControllerLimits()
        expect(quota).to.be.eq('100')
        expect(rewardAllowance).to.be.eq(parseEther(String(1 * 10 ** 5)).toString())

        expect(
            async () => await vars.clientVaultNoParams.defaultControllerLimits()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.clientVaultInvalidAddress.defaultControllerLimits()
        ).rejects.toThrow('Failed To Execute Read on: defaultControllerLimits')
    })

    it('Controller Limits Enabled', async () => {
        expect(await vars.clientVaultInstance.controllerLimitsEnabled()).to.be.false

        expect(
            async () => await vars.clientVaultNoParams.controllerLimitsEnabled()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultInvalidAddress.controllerLimitsEnabled()
        ).rejects.toThrow('Failed To Execute Read on: controllerLimitsEnabled')
    })

    it('Toggle Controller Limits', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(await vars.clientVaultInstance.controllerLimitsEnabled()).to.be.false

        await vars.clientVaultInstance.toggleControllerLimits()

        expect(await vars.clientVaultInstance.controllerLimitsEnabled()).to.be.true
        expect(async () => await vars.clientVaultNoParams.toggleControllerLimits()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientVaultInvalidAddress.toggleControllerLimits()
        ).rejects.toThrow('Failed To Execute Write on: toggleControllerLimits')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Set Controller Limits', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        const { quota, rewardAllowance } = await vars.clientVaultInstance.controllerLimits(
            vars.controller
        )
        expect(quota).to.be.eq('0')
        expect(rewardAllowance).to.be.eq('0')

        await vars.clientVaultInstance.setControllerLimits(vars.controller, 100, parseEther('100'))

        const { quota: quota2, rewardAllowance: rewardAllowance2 } =
            await vars.clientVaultInstance.controllerLimits(vars.controller)

        expect(quota2).to.be.eq('100')
        expect(rewardAllowance2).to.be.eq(parseEther('100').toString())

        expect(
            async () =>
                await vars.clientVaultNoParams.setControllerLimits(
                    vars.controller,
                    100,
                    parseEther('100')
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.clientVaultInvalidAddress.setControllerLimits(
                    vars.controller,
                    100,
                    parseEther('100')
                )
        ).rejects.toThrow('Failed To Execute Write on: setControllerLimits')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Set Default Controller Limits', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        const { quota, rewardAllowance } = await vars.clientVaultInstance.defaultControllerLimits()
        expect(quota).to.be.eq('100')
        expect(rewardAllowance).to.be.eq(parseEther(String(1 * 10 ** 5)).toString())

        await vars.clientVaultInstance.setDefaultControllerLimits(100, parseEther('100'))

        const { quota: quota2, rewardAllowance: rewardAllowance2 } =
            await vars.clientVaultInstance.defaultControllerLimits()

        expect(quota2).to.be.eq('100')
        expect(rewardAllowance2).to.be.eq(parseEther('100').toString())

        expect(
            async () =>
                await vars.clientVaultNoParams.setDefaultControllerLimits(100, parseEther('100'))
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.clientVaultInvalidAddress.setDefaultControllerLimits(
                    100,
                    parseEther('100')
                )
        ).rejects.toThrow('Failed To Execute Write on: setDefaultControllerLimits')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Withdraw Token', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(parseEther('100'))
        expect(await tokenBalanceOf(vars.devToken, VAULT_ADMIN)).to.be.eq(0n)

        expect(
            async () =>
                await vars.clientVaultNoParams.withdrawToken(vars.devToken, parseEther('100'))
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultInstance.withdrawToken(VAULT_ADMIN, parseEther('100'))
        ).rejects.toThrow('Failed To Execute Write on: withdrawToken')

        await vars.clientVaultInstance.withdrawToken(vars.devToken, parseEther('100'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, VAULT_ADMIN)).to.be.eq(parseEther('100'))

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Reward', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(async () => await vars.clientVaultInstance.reward(zeroAddress, 1)).rejects.toThrow(
            'Failed To Execute Write on: reward'
        )

        expect(async () => await vars.clientVaultNoParams.reward(zeroAddress, 1)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(0n)

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        await vars.clientVaultInstance.reward(RECEIVER_WALLET, parseEther('10'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Reward Batch', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(
            async () =>
                await vars.clientVaultInstance.rewardBatch([{ receiver: zeroAddress, amount: 1 }])
        ).rejects.toThrow('Failed To Execute Write on: rewardBatch')

        expect(
            async () =>
                await vars.clientVaultNoParams.rewardBatch([{ receiver: zeroAddress, amount: 1 }])
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        const receivers: Receiver[] = Array(10).fill({
            amount: parseEther('1'),
            receiver: RECEIVER_WALLET
        })

        await vars.clientVaultInstance.rewardBatch(receivers)

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Update Reward Token', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        const vaultInfo = await vars.clientVaultInstance.getVaultInfo()

        expect(vaultInfo.rewardToken).to.be.eq(vars.devToken)

        await vars.clientVaultInstance.updateRewardToken(VAULT_ADMIN)

        const vaultInfo2 = await vars.clientVaultInstance.getVaultInfo()

        expect(vaultInfo2.rewardToken).to.be.eq(VAULT_ADMIN)

        expect(
            async () => await vars.clientVaultNoParams.updateRewardToken(VAULT_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () => await vars.clientVaultInstance.updateRewardToken('0x0')
        ).rejects.toThrow('Failed To Execute Write on: updateRewardToken')

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Grant Permit', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(async () => await vars.clientVaultNoParams.grantPermit(zeroAddress)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () =>
                // @ts-ignore
                await vars.clientVaultInvalidAddress.grantPermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: grantPermit')

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.true

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Revoke Permit', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(
            async () => await vars.clientVaultNoParams.revokePermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.clientVaultInvalidAddress.revokePermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: revokePermit')

        // expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.true

        await vars.clientVaultInstance.revokePermit(vars.controller)

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.false

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Is Controller', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(
            async () => await vars.clientVaultNoParams.isController(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientVaultInvalidAddress.isController(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: isController')

        // expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.false

        await vars.clientVaultInstance.grantPermit(vars.controller)

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.true

        await resetClientConnection(vars.clientVaultInstance)
    })

    it('Change Vault Owner', async () => {
        await vars.clientVaultInstance.connect(vars.clientVaultInstance.connectors().at(1)!)

        expect(
            async () => await vars.clientVaultInstance.changeVaultOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeVaultOwner')

        expect(
            async () => await vars.clientVaultNoParams.changeVaultOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect((await vars.clientVaultInstance.getVaultInfo()).projectOwner).to.be.eq(VAULT_ADMIN)

        await vars.clientVaultInstance.changeVaultOwner(DEPLOYER_WALLET)

        expect((await vars.clientVaultInstance.getVaultInfo()).projectOwner).to.be.eq(
            DEPLOYER_WALLET
        )

        await resetClientConnection(vars.clientVaultInstance)
    })
})
