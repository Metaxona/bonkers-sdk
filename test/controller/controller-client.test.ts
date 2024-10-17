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
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { controllerAbi_0_0_1 } from '../../src/abi'
import Controller from '../../src/sdk/controller'
import { Call3, Call3Value, ControllerRole, Receiver, Result } from '../../src/types'
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
    CONTROLLER_ADMIN,
    CONTROLLER_FEE_RECEIVER,
    CONTROLLER_IMPLEMENTATION_ADDRESS,
    CONTROLLER_INITIAL_BOT,
    DEPLOYER_WALLET,
    MULTICALL3_ADDRESS,
    prepareController,
    RECEIVER_WALLET,
    requestToken,
    resetClientChain,
    resetClientConnection,
    testClient,
    TestVars,
    tokenBalanceOf,
    wagmiConfig
} from '../common/utils'

describe('Controller Client Test', () => {
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
        expect(vars.clientControllerNoParams.contractAddress).to.be.undefined
        expect(vars.clientControllerNoParams.contractAbi).to.be.undefined
    })

    afterEach(async () => {})

    it('Initialize', async () => {
        expect(
            () =>
                new Controller({
                    // @ts-ignore
                    mode: 'random',
                    options: {
                        wagmiConfig: wagmiConfig
                    }
                })
        ).toThrow()

        expect(
            () => new Controller({ mode: 'client', options: { wagmiConfig: wagmiConfig } })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(vars.clientControllerInstance.connectors().length).to.be.eq(6)
        vars.clientControllerInstance.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })
    })

    it('Connection', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(0)!
        )

        expect(vars.clientControllerInstance.connection()).to.eq('connected')

        await vars.clientControllerInstance.disconnect()

        expect(vars.clientControllerInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientControllerInstance.connect(
                    vars.clientControllerInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        const connect = await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(0)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientControllerInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientControllerInstance.connect(
                    vars.clientControllerInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(0)!
        )

        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(5)!
        )

        const res = await vars.clientControllerInstance.reconnect()

        expect(res.length).to.eq(1)

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Disconnect', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(0)!
        )

        expect(vars.clientControllerInstance.connection()).to.eq('connected')

        await vars.clientControllerInstance.disconnect()

        expect(vars.clientControllerInstance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Switch Chain', async () => {
        const { id, chainId, name, symbol } = vars.clientControllerInstance.chain()
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

        const switchR = await vars.clientControllerInstance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.clientControllerInstance.chain()
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

        await resetClientChain(vars.clientControllerInstance)
    })

    it('Use Chain', async () => {
        expect(() => vars.clientControllerInstance.useChain(sepolia.id)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )
    })

    it('Chain', () => {
        const { id, chainId, name, symbol } = vars.clientControllerInstance.chain()

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
        expect(await vars.clientControllerInstance.getContractType(vars.controller)).to.be.eq(
            'CONTROLLER'
        )
        expect(
            async () => await vars.clientControllerInstance.getContractType(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(await vars.clientControllerInstance.getContractVersion(vars.controller)).to.be.eq(
            '0.0.1'
        )
        expect(
            async () => await vars.clientControllerInstance.getContractVersion(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Use New Controller', async () => {
        const controller = await prepareController()

        expect(controller).to.not.eq(vars.controller)

        const params = await vars.clientControllerInstance.getParams(
            anvil.id,
            controller as Address
        )

        vars.clientControllerInstance.useNewController(anvil.id, params)

        expect(vars.clientControllerInstance.contractAddress).to.not.be.eq(vars.controller)

        expect(() =>
            vars.clientControllerInstance.useNewController(anvil.id, {
                address: zeroAddress,
                abi: controllerAbi_0_0_1
            })
        ).toThrow(new InvalidContract('Can Not Be Zero Address'))

        vars.clientControllerInstance.useNewController(anvil.id, {
            address: vars.controller,
            abi: controllerAbi_0_0_1
        })
    })

    it('Use New Contract', async () => {
        const controller = await prepareController()

        expect(controller).to.not.eq(vars.controller)

        const params = await vars.clientControllerInstance.getParams(
            anvil.id,
            controller as Address
        )

        vars.clientControllerInstance.useNewContract(anvil.id, params)

        expect(vars.clientControllerInstance.contractAddress).to.not.be.eq(vars.controller)

        expect(() =>
            vars.clientControllerInstance.useNewContract(anvil.id, {
                address: zeroAddress,
                abi: controllerAbi_0_0_1
            })
        ).toThrow(new InvalidContract('Can Not Be Zero Address'))

        vars.clientControllerInstance.useNewContract(anvil.id, {
            address: vars.controller,
            abi: controllerAbi_0_0_1
        })
    })

    it('Get Params', async () => {
        const { address, abi } = await vars.clientControllerInstance.getParams(
            anvil.id,
            vars.controller
        )

        expect(address).eq(vars.controller)
        expect(abi?.length).gt(0)
    })

    it('Contract Type', async () => {
        expect(await vars.clientControllerInstance.contractType()).eq('CONTROLLER')

        expect(async () => await vars.clientControllerNoParams.contractType()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientControllerInvalidAddress.contractType()
        ).rejects.toThrow('Failed To Execute Read on: contractType')
    })

    it('Version', async () => {
        expect(await vars.clientControllerInstance.version()).eq('0.0.1')

        expect(async () => await vars.clientControllerNoParams.version()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientControllerInvalidAddress.version()).rejects.toThrow(
            'Failed To Execute Read on: version'
        )
    })

    it('implementationAddress', async () => {
        expect(await vars.clientControllerInstance.implementationAddress()).to.be.eq(
            CONTROLLER_IMPLEMENTATION_ADDRESS
        )
    })

    it('Multicall Address', async () => {
        expect(async () => await vars.clientControllerNoParams.multicallAddress()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(
            async () => await vars.clientControllerInvalidAddress.multicallAddress()
        ).rejects.toThrow('Failed To Execute Read on: multicallAddress')

        const multicall3_address = await vars.clientControllerInstance.multicallAddress()

        expect(multicall3_address).eq(MULTICALL3_ADDRESS)
    })

    it('Fee Receiver', async () => {
        expect(async () => await vars.clientControllerNoParams.feeReceiver()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientControllerInvalidAddress.feeReceiver()).rejects.toThrow(
            'Failed To Execute Read on: feeReceiver'
        )

        expect(await vars.clientControllerInstance.feeReceiver()).eq(CONTROLLER_FEE_RECEIVER)
    })

    it('Owner', async () => {
        expect(async () => await vars.clientControllerNoParams.owner()).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )

        expect(async () => await vars.clientControllerInvalidAddress.owner()).rejects.toThrow(
            'Failed To Execute Read on: owner'
        )

        expect(await vars.clientControllerInstance.owner()).eq(CONTROLLER_ADMIN)
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
                await vars.clientControllerNoParams.hasControllerRole(
                    ControllerRole.BOT,
                    CONTROLLER_ADMIN
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                // @ts-ignore
                await vars.clientControllerInstance.hasControllerRole(4, CONTROLLER_ADMIN)
        ).rejects.toThrow()

        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_ADMIN
            )
        ).to.be.true
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_ADMIN
            )
        ).to.be.true
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_ADMIN
            )
        ).to.be.true

        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.true
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.false
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_INITIAL_BOT
            )
        ).to.be.false

        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.CALLER,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.ERC,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
    })

    it('Call', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        const callResult = await vars.clientControllerInstance.call(
            vars.devToken,
            encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        )

        expect(callResult.status).to.be.eq('success')
        expect(callResult.result).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        expect(hexToBigInt(callResult.result as Hex)).to.be.eq(parseEther('1000000000000'))

        expect(
            async () =>
                await vars.clientControllerInstance.call(
                    vars.devToken,
                    encodeFunctionData({
                        abi: erc20Abi,
                        functionName: 'transfer',
                        args: [CONTROLLER_FEE_RECEIVER, parseEther('1000000000000')]
                    })
                )
        ).rejects.toThrow()

        await resetClientConnection(vars.clientControllerInstance)

        expect(
            async () =>
                await vars.clientControllerNoParams.call(
                    vars.devToken,
                    encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () =>
                await vars.clientControllerInvalidAddress.call(
                    vars.devToken,
                    encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
                )
        ).rejects.toThrow('Failed To Execute Write on: call')
    })

    it('Call Batch', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        const length = 5
        const calldata: Call3[] = Array(length).fill({
            target: vars.devToken,
            allowFailure: false,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        })

        const callResults = await vars.clientControllerInstance.callBatch(calldata)

        expect(callResults.status).to.be.eq('success')
        expect(callResults.result?.length).to.be.eq(length)

        callResults.result!.forEach((result: Result) => {
            expect(result.success).to.be.true
            expect(result.returnData).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        })

        expect(
            async () =>
                await vars.clientControllerInstance.callBatch([
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
            async () => await vars.clientControllerInvalidAddress.callBatch(calldata)
        ).rejects.toThrow('Failed To Execute Write on: callBatch')

        await resetClientConnection(vars.clientControllerInstance)

        expect(async () => await vars.clientControllerNoParams.callBatch(calldata)).rejects.toThrow(
            new MissingRequiredParams('Contract Abi')
        )
    })

    it('Call Batch Value', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )
        const length = 5
        const calldata: Call3Value[] = Array(length).fill({
            target: vars.devToken,
            allowFailure: false,
            value: 0,
            callData: encodeFunctionData({ abi: erc20Abi, functionName: 'totalSupply' })
        })

        const callResults = await vars.clientControllerInstance.callBatchValue(calldata)

        callResults.result!.forEach((result: Result) => {
            expect(result.success).to.be.true
            expect(result.returnData).to.be.eq(padHex(toHex(parseEther('1000000000000'))))
        })

        expect(
            async () =>
                await vars.clientControllerInstance.callBatchValue([
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
            async () => await vars.clientControllerInvalidAddress.callBatchValue(calldata)
        ).rejects.toThrow('Failed To Execute Write on: callBatchValue')

        await resetClientConnection(vars.clientControllerInstance)

        expect(
            async () => await vars.clientControllerNoParams.callBatchValue(calldata)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))
    })

    it('Transfer ERC20 Token', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () =>
                await vars.clientControllerInstance.transferERC20Token(
                    CONTROLLER_ADMIN,
                    CONTROLLER_FEE_RECEIVER,
                    1
                )
        ).rejects.toThrow('Failed To Execute Write on: transferERC20Token')

        expect(
            async () =>
                await vars.clientControllerNoParams.transferERC20Token(
                    vars.devToken,
                    RECEIVER_WALLET,
                    parseEther('10')
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(0n)

        await requestToken(vars.devToken, vars.controller, parseEther('10'))

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(parseEther('10'))

        await vars.clientControllerInstance.transferERC20Token(
            vars.devToken,
            RECEIVER_WALLET,
            parseEther('10')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.controller)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Add Controller Role', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () =>
                // @ts-ignore
                await vars.clientControllerInstance.addControllerRole(4, zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: addControllerRole')

        expect(
            async () =>
                await vars.clientControllerNoParams.addControllerRole(
                    ControllerRole.BOT,
                    zeroAddress
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false
        await vars.clientControllerInstance.addControllerRole(
            ControllerRole.BOT,
            CONTROLLER_FEE_RECEIVER
        )
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.true

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Remove Controller Role', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            // @ts-ignore
            async () => await vars.clientControllerInstance.removeControllerRole(4, zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: removeControllerRole')

        expect(
            async () =>
                await vars.clientControllerNoParams.removeControllerRole(
                    ControllerRole.BOT,
                    zeroAddress
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.true
        await vars.clientControllerInstance.removeControllerRole(
            ControllerRole.BOT,
            CONTROLLER_FEE_RECEIVER
        )
        expect(
            await vars.clientControllerInstance.hasControllerRole(
                ControllerRole.BOT,
                CONTROLLER_FEE_RECEIVER
            )
        ).to.be.false

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Create Vault', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () =>
                await vars.clientControllerInstance.createVault(
                    zeroAddress,
                    zeroAddress,
                    zeroAddress,
                    ''
                )
        ).rejects.toThrow('Failed To Execute Write on: createVault')

        expect(
            async () =>
                await vars.clientControllerNoParams.createVault(
                    zeroAddress,
                    zeroAddress,
                    zeroAddress,
                    ''
                )
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        await vars.clientVaultFactoryInstance.grantPermit(vars.controller)

        const vault = await vars.clientControllerInstance.createVault(
            vars.vaultFactory,
            DEPLOYER_WALLET,
            vars.devToken,
            'METAXONA'
        )

        expect(vault.result).toBeDefined()

        const vaultInfo = await vars.clientVaultFactoryInstance.getVaultInfo(
            vault.result as Address
        )

        expect(vaultInfo.projectOwner).to.be.eq(DEPLOYER_WALLET)
        expect(vaultInfo.projectName).to.be.eq('METAXONA')
        expect(vaultInfo.rewardToken).to.be.eq(vars.devToken)

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Vault Reward', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () => await vars.clientControllerInstance.vaultReward(vars.vault, zeroAddress, 1)
        ).rejects.toThrow('Failed To Execute Write on: vaultReward')

        expect(
            async () => await vars.clientControllerNoParams.vaultReward(vars.vault, zeroAddress, 1)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.false
        await vars.clientVaultInstance.grantPermit(vars.controller)
        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.true

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('10'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        await vars.clientControllerInstance.vaultReward(
            vars.vault,
            RECEIVER_WALLET,
            parseEther('10')
        )

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Vault Reward Batch', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () =>
                await vars.clientControllerInstance.vaultRewardBatch(vars.vault, [
                    { receiver: zeroAddress, amount: 1 }
                ])
        ).rejects.toThrow('Failed To Execute Write on: vaultRewardBatch')

        expect(
            async () => await vars.clientControllerNoParams.vaultReward(vars.vault, zeroAddress, 1)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        await vars.clientVaultInstance.grantPermit(vars.controller)
        expect(await vars.clientVaultInstance.isController(vars.controller)).to.be.true

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('20'))

        await requestToken(vars.devToken, vars.vault, parseEther('10'))

        const receivers: Receiver[] = Array(10).fill({
            amount: parseEther('1'),
            receiver: RECEIVER_WALLET
        })

        await vars.clientControllerInstance.vaultRewardBatch(vars.vault, receivers)

        expect(await tokenBalanceOf(vars.devToken, vars.vault)).to.be.eq(0n)
        expect(await tokenBalanceOf(vars.devToken, RECEIVER_WALLET)).to.be.eq(parseEther('30'))

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Set Fee Receiver', async () => {
        expect(
            async () => await vars.clientControllerInstance.setFeeReceiver(CONTROLLER_ADMIN)
        ).rejects.toThrow()

        expect(await vars.clientControllerInstance.feeReceiver()).to.be.eq(CONTROLLER_FEE_RECEIVER)

        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        await vars.clientControllerInstance.setFeeReceiver(CONTROLLER_ADMIN)

        expect(await vars.clientControllerInstance.feeReceiver()).to.be.eq(CONTROLLER_ADMIN)

        expect(
            async () => await vars.clientControllerInstance.setFeeReceiver(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setFeeReceiver')

        expect(
            async () => await vars.clientControllerNoParams.setFeeReceiver(CONTROLLER_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Set Multicall Address', async () => {
        expect(
            async () => await vars.clientControllerInstance.setMulticallAddress(CONTROLLER_ADMIN)
        ).rejects.toThrow()

        expect(await vars.clientControllerInstance.multicallAddress()).to.be.eq(MULTICALL3_ADDRESS)

        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        await vars.clientControllerInstance.setMulticallAddress(CONTROLLER_ADMIN)

        expect(await vars.clientControllerInstance.multicallAddress()).to.be.eq(CONTROLLER_ADMIN)

        expect(
            async () => await vars.clientControllerNoParams.setMulticallAddress(CONTROLLER_ADMIN)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(
            async () => await vars.clientControllerInstance.setMulticallAddress(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: setMulticallAddress')

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Change Controller Owner', async () => {
        await vars.clientControllerInstance.connect(
            vars.clientControllerInstance.connectors().at(1)!
        )

        expect(
            async () => await vars.clientControllerInstance.changeControllerOwner(zeroAddress)
        ).rejects.toThrow('Failed To Execute Write on: changeControllerOwner')

        expect(
            async () => await vars.clientControllerNoParams.changeControllerOwner(DEPLOYER_WALLET)
        ).rejects.toThrow(new MissingRequiredParams('Contract Abi'))

        expect(await vars.clientControllerInstance.owner()).to.be.eq(CONTROLLER_ADMIN)

        await vars.clientControllerInstance.changeControllerOwner(DEPLOYER_WALLET)

        expect(await vars.clientControllerInstance.owner()).to.be.eq(DEPLOYER_WALLET)

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Balance', async () => {
        expect(async () => await vars.clientControllerNoParams.balance()).rejects.toThrowError(
            new MissingRequiredParams('Contract Abi')
        )

        expect(await vars.clientControllerInstance.balance()).to.be.eq(0n)

        const connector1 = vars.clientControllerInstance.connectors()[0]!

        await vars.clientControllerInstance.connect(connector1)

        expect(await vars.clientControllerInstance.balance()).to.be.eq(0n)

        await resetClientConnection(vars.clientControllerInstance)
    })

    it('Balance Of', async () => {
        expect(await vars.clientControllerInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        const connector1 = vars.clientControllerInstance.connectors()[0]!

        await vars.clientControllerInstance.connect(connector1)

        expect(await vars.clientControllerInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(
            async () => await vars.clientControllerNoParams.balanceOf('0x')
        ).rejects.toThrowError()

        await resetClientConnection(vars.clientControllerInstance)
    })
})
