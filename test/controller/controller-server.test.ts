import {
    Address,
    encodeFunctionData,
    erc20Abi,
    Hex,
    hexToBigInt,
    padHex,
    parseEther,
    toHex,
    zeroAddress
} from 'viem'
import { anvil, mainnet, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { controllerAbi_0_0_1 } from '../../src/abi'
import Controller from '../../src/sdk/controller'
import { Call3, Call3Value, ControllerRole, Receiver, Result } from '../../src/types'
import {
    InvalidChainId,
    InvalidContract,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams
} from '../../src/utils'
import {
    CALLER_WALLET,
    clientAndContractSetup,
    CONTROLLER_ADMIN,
    CONTROLLER_FEE_RECEIVER,
    CONTROLLER_IMPLEMENTATION_ADDRESS,
    CONTROLLER_INITIAL_BOT,
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    MULTICALL3_ADDRESS,
    prepareController,
    RECEIVER_WALLET,
    requestToken,
    resetServerChain,
    testClient,
    TestVars,
    tokenBalanceOf
} from '../common/utils'

describe('Controller Server Test', () => {
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
        expect(vars.serverControllerNoParams.contractAddress).to.be.undefined
        expect(vars.serverControllerNoParams.contractAbi).to.be.undefined
        expect(vars.serverControllerInvalidAddress.contractAddress).to.be.not.eq(vars.controller)
        // expect(vars.serverControllerInvalidAddress.contractAddress).to.be.eq(CALLER_WALLET)
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new Controller({
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
                new Controller({
                    mode: 'server',
                    options: {
                        privateKey: DEPLOYER_PRIVATE_KEY,
                        chains: [anvil]
                    }
                })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(() => vars.serverControllerInstance.connectors()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connection', async () => {
        expect(() => vars.serverControllerInstance.connection()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.serverControllerInstance.connect(
                    vars.clientControllerInstance.connectors().at(0)!
                )
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Re-Connect', async () => {
        expect(async () => await vars.serverControllerInstance.reconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Disconnect', async () => {
        expect(async () => await vars.serverControllerInstance.disconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Switch Chain', async () => {
        expect(
            async () => await vars.serverControllerInstance.switchChain(sepolia.id)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Use Chain', async () => {
        const { id, chainId, name, symbol } = vars.serverControllerInstance.chain()
        const {
            id: id2,
            chainId: chainId2,
            name: name2,
            symbol: symbol2
        } = vars.serverVaultInstance.chain()
        const {
            id: id3,
            chainId: chainId3,
            name: name3,
            symbol: symbol3
        } = vars.serverVaultFactoryInstance.chain()
        const {
            id: id4,
            chainId: chainId4,
            name: name4,
            symbol: symbol4
        } = vars.serverBonkersSDKInstance.chain()

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

        vars.serverControllerInstance.useChain(sepolia.id)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.serverControllerInstance.chain()
        const {
            id: id6,
            chainId: chainId6,
            name: name6,
            symbol: symbol6
        } = vars.serverVaultInstance.chain()
        const {
            id: id7,
            chainId: chainId7,
            name: name7,
            symbol: symbol7
        } = vars.serverVaultFactoryInstance.chain()
        const {
            id: id8,
            chainId: chainId8,
            name: name8,
            symbol: symbol8
        } = vars.serverBonkersSDKInstance.chain()

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

        resetServerChain(vars.serverControllerInstance)
    })

    it('Chain', () => {
        const { id, chainId, name, symbol } = vars.serverControllerInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(id).eq(anvil.id)
        expect(symbol).eq(anvil.nativeCurrency.symbol)
    })

    it('Chains', () => {
        const chains = vars.clientControllerInstance.chains()

        expect(chains.length).eq(3)
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.reader({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'contractVersion'
                })
        ).rejects.toThrow()
    })

    it('Writer Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.write({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
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
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientControllerInstance.disconnect()
    })

    it('Get Contract Type', async () => {
        expect(await vars.serverControllerInstance.getContractType(vars.controller)).to.be.eq(
            'CONTROLLER'
        )
        expect(
            async () => await vars.serverControllerInstance.getContractType(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(await vars.serverControllerInstance.getContractVersion(vars.controller)).to.be.eq(
            '0.0.1'
        )
        expect(
            async () => await vars.serverControllerInstance.getContractVersion(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.serverControllerInstance.getParams(
            anvil.id,
            vars.controller
        )

        expect(address).eq(vars.controller)
        expect(abi?.length).gt(0)

        expect(
            async () => await vars.serverControllerInstance.getParams(mainnet.id, vars.controller)
        ).rejects.toThrowError(
            new InvalidChainId(`Chain Id [${mainnet.id}] Does Not Exist On The Provided Chains`)
        )
    })

    it('Contract Type', async () => {
        expect(await vars.serverControllerInstance.contractType()).eq('CONTROLLER')

        expect(async () => await vars.serverControllerNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverControllerInvalidAddress.contractType()
        ).rejects.toThrow('Failed To Execute Read on: contractType')
    })

    it('Version', async () => {
        expect(await vars.serverControllerInstance.version()).eq('0.0.1')

        expect(async () => await vars.serverControllerNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverControllerInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.serverControllerInstance.implementationAddress()).to.be.eq(
            CONTROLLER_IMPLEMENTATION_ADDRESS
        )
    })

    it('Multicall Address', async () => {
        expect(async () => await vars.serverControllerNoParams.multicallAddress()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.serverControllerInvalidAddress.multicallAddress()
        ).rejects.toThrow('Failed To Execute Read on: multicallAddress')

        const multicall3_address = await vars.serverControllerInstance.multicallAddress()

        expect(multicall3_address).eq(MULTICALL3_ADDRESS)
    })

    it('Fee Receiver', async () => {
        expect(async () => await vars.serverControllerNoParams.feeReceiver()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverControllerInvalidAddress.feeReceiver()).rejects.toThrow(
            'Failed To Execute Read on: feeReceiver'
        )

        expect(await vars.serverControllerInstance.feeReceiver()).eq(CONTROLLER_FEE_RECEIVER)
    })

    it('Owner', async () => {
        expect(async () => await vars.serverControllerNoParams.owner()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.serverControllerInvalidAddress.owner()).rejects.toThrow(
            'Failed To Execute Read on: owner'
        )

        expect(await vars.serverControllerInstance.owner()).eq(CONTROLLER_ADMIN)
    })

    it('Has Controller Role', async () => {
        expect(
            async () =>
                await vars.serverControllerInvalidAddress.hasControllerRole(
                    ControllerRole.BOT,
                    CONTROLLER_ADMIN
                )
        ).rejects.toThrow('Failed To Execute Read on: hasControllerRole')

        expect(
            async () =>
                await vars.serverControllerNoParams.hasControllerRole(
                    ControllerRole.BOT,
                    CONTROLLER_ADMIN
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.hasControllerRole(4, CONTROLLER_ADMIN)
        ).rejects.toThrow()

        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_ADMIN
            )
        ).to.be.true
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_ADMIN
            )
        ).to.be.true
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_ADMIN
            )
        ).to.be.true

        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.true
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.false
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.false

        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
    })

    it('Call', async () => {
        const callResult = await vars.serverControllerInstance.call(
            vars.devToken,
            encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        )

        expect(callResult.status).to.be.eq('success')
        expect(callResult.result).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        expect(hexToBigInt(callResult.result as Hex)).to.be.eq(parseEther('1000000000000'))

        expect(
            async () =>
                await vars.serverControllerInstance.call(
                    vars.devToken,
                    encodeFunctionData({
                        abi: erc20Abi,
                        functionName: 'transfer',
                        args: [CONTROLLER_FEE_RECEIVER, parseEther('1000000000000')]
                    })
                )
        ).rejects.toThrow()

        expect(
            async () =>
                await vars.serverControllerNoParams.call(
                    vars.devToken,
                    encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.serverControllerInvalidAddress.call(
                    vars.devToken,
                    encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
                )
        ).rejects.toThrow('Failed To Execute Write on: call')
    })

    it('Call Batch', async () => {
        const length = 5
        const calldata: Call3[] = Array(length).fill({
            target: vars.devToken,
            allowFailure: false,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        })

        const callResults = await vars.serverControllerInstance.callBatch(calldata)

        expect(callResults.status).to.be.eq('success')
        expect(callResults.result?.length).to.be.eq(length)

        callResults.result!.forEach((result: Result) => {
            expect(result.success).to.be.true
            expect(result.returnData).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        })

        expect(
            async () =>
                await vars.serverControllerInstance.callBatch([
                    {
                        target: vars.devToken,
                        allowFailure: false,
                        callData: encodeFunctionData({
                            abi: erc20Abi,
                            functionName: 'transfer',
                            args: [CONTROLLER_FEE_RECEIVER, parseEther('1000000000000')]
                        })
                    }
                ])
        ).rejects.toThrow()

        expect(
            async () => await vars.serverControllerInvalidAddress.callBatch(calldata)
        ).rejects.toThrow('Failed To Execute Write on: callBatch')

        expect(async () => await vars.serverControllerNoParams.callBatch(calldata)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )
    })

    it('Call Batch Value', async () => {
        const length = 5
        const calldata: Call3Value[] = Array(length).fill({
            target: vars.devToken,
            allowFailure: false,
            value: 0,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        })

        const callResults = await vars.serverControllerInstance.callBatchValue(calldata)

        callResults.result!.forEach((result: Result) => {
            expect(result.success).to.be.true
            expect(result.returnData).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        })

        expect(
            async () =>
                await vars.serverControllerInstance.callBatchValue([
                    {
                        target: vars.devToken,
                        allowFailure: false,
                        value: 0,
                        callData: encodeFunctionData({
                            abi: erc20Abi,
                            functionName: 'transfer',
                            args: [CONTROLLER_FEE_RECEIVER, parseEther('1000000000000')]
                        })
                    }
                ])
        ).rejects.toThrow()

        expect(
            async () => await vars.serverControllerInvalidAddress.callBatchValue(calldata)
        ).rejects.toThrow('Failed To Execute Write on: callBatchValue')

        expect(
            async () => await vars.serverControllerNoParams.callBatchValue(calldata)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
    })

    it('Transfer ERC20 Token', async () => {
        expect(
            async () =>
                await vars.serverControllerInstance.transferERC20Token(
                    CONTROLLER_ADMIN,
                    CONTROLLER_FEE_RECEIVER,
                    1
                )
        ).rejects.toThrow('Failed To Execute Write on: transferERC20Token')

        expect(
            async () =>
                await vars.serverControllerNoParams.transferERC20Token(
                    vars.devToken,
                    RECEIVER_WALLET,
                    parseEther('10')
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(0n)

        await requestToken(vars.devToken, vars.controller, parseEther('10'))

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(parseEther('10'))

        await vars.serverControllerInstance.transferERC20Token(
            vars.devToken,
            RECEIVER_WALLET,
            parseEther('10')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))
    })

    it('Add Controller Role', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverControllerInstance.addControllerRole(4, zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: addControllerRole')

        expect(
            async () =>
                await vars.serverControllerNoParams.addControllerRole(
                    ControllerRole.BOT,
                    zeroAddress
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        await vars.serverControllerInstance.addControllerRole(
            ControllerRole.BOT,
            CONTROLLER_FEE_RECEIVER
        )
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.true
    })

    it('Remove Controller Role', async () => {
        expect(
            // @ts-ignore
            async () => await vars.serverControllerInstance.removeControllerRole(4, zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: removeControllerRole')

        expect(
            async () =>
                await vars.serverControllerNoParams.removeControllerRole(
                    ControllerRole.BOT,
                    zeroAddress
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.true
        await vars.serverControllerInstance.removeControllerRole(
            ControllerRole.BOT,
            CONTROLLER_FEE_RECEIVER
        )
        expect(
            await vars.serverControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
    })

    it('Create Vault', async () => {
        expect(
            async () =>
                await vars.serverControllerInstance.createVault(
                    zeroAddress,
                    zeroAddress,
                    zeroAddress,
                    ''
                )
        ).rejects.toThrow('Failed To Execute Write on: createVault')
        expect(
            async () =>
                await vars.serverControllerNoParams.createVault(
                    zeroAddress,
                    zeroAddress,
                    zeroAddress,
                    ''
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        await vars.serverVaultFactoryInstance.grantPermit(vars.controller)

        const vault = await vars.serverControllerInstance.createVault(
            vars.vaultFactory,
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA'
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.serverVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq('METAXONA')
        expect(vaultInfo.rewardToken).to.be.eq(vars.devToken)
    })

    it('Vault Reward', async () => {
        expect(
            async () => await vars.serverControllerInstance.vaultReward(vars.vault, zeroAddress, 1)
        ).rejects.toThrow('Failed To Execute Write on: vaultReward')

        expect(
            async () => await vars.serverControllerNoParams.vaultReward(vars.vault, zeroAddress, 1)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.false
        await vars.serverVaultInstance.grantPermit(vars.controller)
        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.true

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        await vars.serverControllerInstance.vaultReward(
            vars.vault,
            RECEIVER_WALLET,
            parseEther('10')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))
    })

    it('Vault Reward Batch', async () => {
        expect(
            async () =>
                await vars.serverControllerInstance.vaultRewardBatch(vars.vault, [
                    { receiver: zeroAddress, amount: 1 }
                ])
        ).rejects.toThrow('Failed To Execute Write on: vaultRewardBatch')

        expect(
            async () =>
                await vars.serverControllerNoParams.vaultRewardBatch(vars.vault, [
                    { receiver: zeroAddress, amount: 1 }
                ])
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        await vars.serverVaultInstance.grantPermit(vars.controller)
        expect(await vars.serverVaultInstance.isController(vars.controller)).to.be.true

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        const receivers: Receiver[] = Array(10).fill({
            amount: parseEther('1'),
            receiver: RECEIVER_WALLET
        })

        await vars.serverControllerInstance.vaultRewardBatch(vars.vault, receivers)

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('30'))
    })

    it('Set Fee Receiver', async () => {
        expect(await vars.serverControllerInstance.feeReceiver()).to.be.eq(CONTROLLER_FEE_RECEIVER)

        await vars.serverControllerInstance.setFeeReceiver(CONTROLLER_ADMIN)
        expect(await vars.serverControllerInstance.feeReceiver()).to.be.eq(CONTROLLER_ADMIN)

        expect(
            async () => await vars.serverControllerInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.serverControllerNoParams.setFeeReceiver(CONTROLLER_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
    })

    it('Set Multicall Address', async () => {
        expect(await vars.serverControllerInstance.multicallAddress()).to.be.eq(MULTICALL3_ADDRESS)

        await vars.serverControllerInstance.setMulticallAddress(CONTROLLER_ADMIN)
        expect(await vars.serverControllerInstance.multicallAddress()).to.be.eq(CONTROLLER_ADMIN)

        expect(
            async () => await vars.serverControllerNoParams.setMulticallAddress(CONTROLLER_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.serverControllerInstance.setMulticallAddress(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setMulticallAddress')
    })

    it('Change Controller Owner', async () => {
        expect(
            async () => await vars.serverControllerInstance.changeControllerOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeControllerOwner')

        expect(
            async () => await vars.serverControllerNoParams.changeControllerOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.serverControllerInstance.owner()).to.be.eq(CONTROLLER_ADMIN)

        await vars.serverControllerInstance.changeControllerOwner(DEPLOYER_WALLET)

        expect(await vars.serverControllerInstance.owner()).to.be.eq(DEPLOYER_WALLET)
    })

    it('Use New Controller', async () => {
        const controller = await prepareController()

        expect(controller).to.not.eq(vars.controller)

        const params = await vars.serverControllerInstance.getParams(
            anvil.id,
            controller as Address
        )

        vars.serverControllerInstance.useNewController(anvil.id, params)

        expect(vars.serverControllerInstance.contractAddress).to.not.be.eq(vars.controller)

        expect(() =>
            vars.serverControllerInstance.useNewController(anvil.id, {
                address: zeroAddress,
                abi: controllerAbi_0_0_1
            })
        ).toThrow(new InvalidContract('Can Not Be Zero Address'))

        vars.serverControllerInstance.useNewController(anvil.id, {
            address: vars.controller,
            abi: controllerAbi_0_0_1
        })
    })

    it('Balance', async () => {
        expect(async () => await vars.serverControllerNoParams.balance()).rejects.toThrowError(
            new MissingRequiredParams('Contract Abi')
        )

        expect(await vars.serverControllerInstance.balance()).to.be.eq(0n)
    })

    it('Balance Of', async () => {
        expect(await vars.serverControllerInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(await vars.serverControllerInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(
            async () => await vars.serverControllerNoParams.balanceOf('0x')
        ).rejects.toThrowError()
    })
})
