import { Address, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, mainnet, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { vaultAbi_0_0_1 } from '../../src/abi'
import Vault from '../../src/sdk/vault'
import { Receiver } from '../../src/types'
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
    prepareVault,
    RECEIVER_WALLET,
    requestToken,
    resetServerChain,
    testClient,
    TestVars,
    tokenBalanceOf,
    VAULT_ADMIN,
    VAULT_IMPLEMENTATION_ADDRESS,
    VAULT_PROJECT_NAME,
    VAULT_VERSION
} from '../common/utils'

describe('Vault Server Test', () => {
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
        expect(vars.serverVaultNoParams.contractAddress).to.be.undefined
        expect(vars.serverVaultNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new Vault({
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
                new Vault({
                    mode: 'server',
                    options: {
                        privateKey: DEPLOYER_PRIVATE_KEY,
                        chains: [anvil]
                    }
                })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(() => vars.serverVaultInstance.connectors()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connection', async () => {
        expect(() => vars.serverVaultInstance.connection()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.serverVaultInstance.connect(
                    vars.clientControllerInstance.connectors().at(0)!
                )
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Disconnect', async () => {
        expect(async () => await vars.serverVaultInstance.disconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Switch Chain', async () => {
        expect(
            async () => await vars.serverVaultInstance.switchChain(sepolia.id)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Use Chain', async () => {
        const { chainId, name } = vars.serverVaultInstance.chain()
        const { chainId: chainId2, name: name2 } = vars.serverVaultInstance.chain()
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

        vars.serverVaultInstance.useChain(sepolia.id)

        const { chainId: chainId5, name: name5 } = vars.serverVaultInstance.chain()
        const { chainId: chainId6, name: name6 } = vars.serverVaultInstance.chain()
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

        resetServerChain(vars.serverVaultInstance)
    })

    it('Chain', () => {
        const { chainId, name } = vars.serverVaultInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultInstance.reader({
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
                await vars.serverVaultInstance.write({
                    address: vars.vault,
                    abi: vaultAbi_0_0_1,
                    functionName: 'changeVaultOwner',
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
                    address: vars.vault,
                    abi: vaultAbi_0_0_1,
                    functionName: 'changeVaultOwner',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientControllerInstance.disconnect()
    })

    it('Get Contract Type', async () => {
        expect(await vars.serverVaultInstance.getContractType(vars.vault)).to.be.eq('VAULT')
        expect(
            async () => await vars.serverVaultInstance.getContractType(VAULT_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(await vars.serverVaultInstance.getContractVersion(vars.vault)).to.be.eq('0.0.1')
        expect(
            async () => await vars.serverVaultInstance.getContractVersion(VAULT_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.serverVaultInstance.getParams(anvil.id, vars.vault)

        expect(address).eq(vars.vault)
        expect(abi?.length).gt(0)

        expect(
            async () => await vars.serverVaultInstance.getParams(mainnet.id, vars.vault)
        ).rejects.toThrowError(
            new InvalidChainId(`Chain Id [${mainnet.id}] Does Not Exist On The Provided Chains`)
        )
    })

    it('Contract Type', async () => {
        expect(await vars.serverVaultInstance.contractType()).eq('VAULT')

        expect(async () => await vars.serverVaultNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverVaultInvalidAddress.contractType()).rejects.toThrow(
            'Failed To Execute Read on: contractType'
        )
    })

    it('Version', async () => {
        expect(await vars.serverVaultInstance.version()).eq('0.0.1')

        expect(async () => await vars.serverVaultNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverVaultInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.serverVaultInstance.implementationAddress()).to.be.eq(
            VAULT_IMPLEMENTATION_ADDRESS
        )
    })

    it('Get Vault Info', async () => {
        const vaultInfo = await vars.serverVaultInstance.getVaultInfo()

        expect(Number(vaultInfo.id)).to.be.eq(1)
        expect(vaultInfo.projectOwner).to.be.eq(VAULT_ADMIN)
        expect(vaultInfo.projectName).to.be.eq(VAULT_PROJECT_NAME)
        expect(vaultInfo.version).to.be.eq(VAULT_VERSION)
        expect(vaultInfo.deployer).to.be.eq(DEPLOYER_WALLET)

        expect(async () => await vars.serverVaultNoParams.getVaultInfo()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverVaultInvalidAddress.getVaultInfo()).rejects.toThrow(
            'Failed To Execute Read on: getVaultInfo'
        )
    })

    it('Reward Pool', async () => {
        expect(await vars.serverVaultInstance.rewardPool()).to.be.eq(0)

        await requestToken(vars.devToken, vars.vault, parseEther('100'))

        expect(await vars.serverVaultInstance.rewardPool()).to.be.eq(100)

        expect(async () => await vars.serverVaultNoParams.rewardPool()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )
        expect(async () => await vars.serverVaultInvalidAddress.rewardPool()).rejects.toThrow(
            'Failed To Execute Read on: rewardPool'
        )
    })

    it('Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.serverVaultInstance.controllerLimits(
            vars.controller
        )
        expect(quota).to.be.eq('0')
        expect(rewardAllowance).to.be.eq('0')

        expect(
            async () => await vars.serverVaultNoParams.controllerLimits(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.serverVaultInvalidAddress.controllerLimits(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: controllerLimits')
    })

    it('Default Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.serverVaultInstance.defaultControllerLimits()
        expect(quota).to.be.eq('100')
        expect(rewardAllowance).to.be.eq(parseEther(String(1 * 10 ** 5)).toString())

        expect(
            async () => await vars.serverVaultNoParams.defaultControllerLimits()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.serverVaultInvalidAddress.defaultControllerLimits()
        ).rejects.toThrow('Failed To Execute Read on: defaultControllerLimits')
    })

    it('Controller Limits Enabled', async () => {
        expect(await vars.serverVaultInstance.controllerLimitsEnabled()).to.be.false

        expect(
            async () => await vars.serverVaultNoParams.controllerLimitsEnabled()
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultInvalidAddress.controllerLimitsEnabled()
        ).rejects.toThrow('Failed To Execute Read on: controllerLimitsEnabled')
    })

    it('Toggle Controller Limits', async () => {
        expect(await vars.serverVaultInstance.controllerLimitsEnabled()).to.be.false

        await vars.serverVaultInstance.toggleControllerLimits()

        expect(await vars.serverVaultInstance.controllerLimitsEnabled()).to.be.true
        expect(async () => await vars.serverVaultNoParams.toggleControllerLimits()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        // expect(async()=>await vars.serverVaultInvalidAddress.toggleControllerLimits()).rejects.toThrow('Failed To Execute Write on: toggleControllerLimits')
    })

    it('Set Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.serverVaultInstance.controllerLimits(
            vars.controller
        )
        expect(quota).to.be.eq('0')
        expect(rewardAllowance).to.be.eq('0')

        await vars.serverVaultInstance.setControllerLimits(vars.controller, 100, parseEther('100'))

        const { quota: quota2, rewardAllowance: rewardAllowance2 } =
            await vars.serverVaultInstance.controllerLimits(vars.controller)

        expect(quota2).to.be.eq('100')
        expect(rewardAllowance2).to.be.eq(parseEther('100').toString())

        expect(
            async () =>
                await vars.serverVaultNoParams.setControllerLimits(
                    vars.controller,
                    100,
                    parseEther('100')
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () =>
                await vars.serverVaultInvalidAddress.setControllerLimits(
                    '0x0',
                    100,
                    parseEther('100')
                )
        ).rejects.toThrow('Failed To Execute Write on: setControllerLimits')
    })

    it('Set Default Controller Limits', async () => {
        const { quota, rewardAllowance } = await vars.serverVaultInstance.defaultControllerLimits()
        expect(quota).to.be.eq('100')
        expect(rewardAllowance).to.be.eq(parseEther(String(1 * 10 ** 5)).toString())

        await vars.serverVaultInstance.setDefaultControllerLimits(100, parseEther('100'))

        const { quota: quota2, rewardAllowance: rewardAllowance2 } =
            await vars.serverVaultInstance.defaultControllerLimits()

        expect(quota2).to.be.eq('100')
        expect(rewardAllowance2).to.be.eq(parseEther('100').toString())

        expect(
            async () =>
                await vars.serverVaultNoParams.setDefaultControllerLimits(100, parseEther('100'))
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.serverVaultInvalidAddress.setDefaultControllerLimits(
                    // @ts-ignore
                    'a',
                    parseEther('100')
                )
        ).rejects.toThrow('Failed To Execute Write on: setDefaultControllerLimits')
    })

    it('Withdraw Token', async () => {
        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(parseEther('100'))
        expect(await tokenBalanceOf(vars.devToken, VAULT_ADMIN)).to.be.eq(0n)

        expect(
            async () =>
                await vars.serverVaultNoParams.withdrawToken(vars.devToken, parseEther('100'))
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultInstance.withdrawToken(VAULT_ADMIN, parseEther('100'))
        ).rejects.toThrow('Failed To Execute Write on: withdrawToken')

        await vars.serverVaultInstance.withdrawToken(vars.devToken, parseEther('100'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, VAULT_ADMIN)).to.be.eq(parseEther('100'))
    })

    it('Reward', async () => {
        expect(async () => await vars.serverVaultInstance.reward(zeroAddress, 1)).rejects.toThrow(
            'Failed To Execute Write on: reward'
        )

        expect(async () => await vars.serverVaultNoParams.reward(zeroAddress, 1)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(0n)

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        await vars.serverVaultInstance.reward(RECEIVER_WALLET, parseEther('10'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))
    })

    it('Reward Batch', async () => {
        expect(
            async () =>
                await vars.serverVaultInstance.rewardBatch([{ receiver: zeroAddress, amount: 1 }])
        ).rejects.toThrow('Failed To Execute Write on: rewardBatch')

        expect(
            async () =>
                await vars.serverVaultNoParams.rewardBatch([{ receiver: zeroAddress, amount: 1 }])
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        const receivers: Receiver[] = Array(10).fill({
            amount: parseEther('1'),
            receiver: RECEIVER_WALLET
        })

        await vars.serverVaultInstance.rewardBatch(receivers)

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))
    })

    it('Update Reward Token', async () => {
        const vaultInfo = await vars.serverVaultInstance.getVaultInfo()

        expect(vaultInfo.rewardToken).to.be.eq(vars.devToken)

        await vars.serverVaultInstance.updateRewardToken(VAULT_ADMIN)

        const vaultInfo2 = await vars.serverVaultInstance.getVaultInfo()

        expect(vaultInfo2.rewardToken).to.be.eq(VAULT_ADMIN)

        expect(
            async () => await vars.serverVaultNoParams.updateRewardToken(VAULT_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            // @ts-ignore
            async () => await vars.serverVaultInvalidAddress.updateRewardToken('0x0')
        ).rejects.toThrow('Failed To Execute Write on: updateRewardToken')
    })

    it('Grant Permit', async () => {
        expect(async () => await vars.serverVaultNoParams.grantPermit(zeroAddress)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultInvalidAddress.grantPermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: grantPermit')

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.true
    })

    it('Revoke Permit', async () => {
        expect(
            async () => await vars.serverVaultNoParams.revokePermit(zeroAddress)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.serverVaultInvalidAddress.revokePermit('0x0')
        ).rejects.toThrow('Failed To Execute Write on: revokePermit')

        // expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.true

        await vars.serverVaultInstance.revokePermit(vars.controller)

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.false
    })

    it('Is Controller', async () => {
        expect(
            async () => await vars.serverVaultNoParams.isController(vars.controller)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverVaultInvalidAddress.isController(vars.controller)
        ).rejects.toThrow('Failed To Execute Read on: isController')

        // expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.false

        await vars.serverVaultInstance.grantPermit(vars.controller)

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.true
    })

    it('Change Vault Owner', async () => {
        expect(
            async () => await vars.serverVaultInstance.changeVaultOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeVaultOwner')

        expect(
            async () => await vars.serverVaultNoParams.changeVaultOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect((await vars.serverVaultInstance.getVaultInfo()).projectOwner).to.be.eq(VAULT_ADMIN)

        await vars.serverVaultInstance.changeVaultOwner(DEPLOYER_WALLET)

        expect((await vars.serverVaultInstance.getVaultInfo()).projectOwner).to.be.eq(
            DEPLOYER_WALLET
        )
    })

    it('Use New Vault', async () => {
        const vault = await prepareVault(vars.devToken)

        expect(vault).to.not.eq(vars.vault)

        const params = await vars.serverVaultInstance.getParams(anvil.id, vault as Address)

        vars.serverVaultInstance.useNewVault(anvil.id, params)

        expect(vars.serverVaultInstance.contractAddress).to.not.be.eq(vars.vault)

        expect(() =>
            vars.serverVaultInstance.useNewVault(anvil.id, { address: '0x0', abi: vaultAbi_0_0_1 })
        ).toThrow()

        vars.serverVaultInstance.useNewVault(anvil.id, { address: vars.vault, abi: vaultAbi_0_0_1 })
    })
})
