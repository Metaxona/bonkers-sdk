import { erc20Abi, erc20Abi_bytes32, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { controllerAbi_0_0_1 } from '../../src/abi'
import Erc20 from '../../src/sdk/erc20'
import { InvalidSDKMode, MissingRequiredParams } from '../../src/utils'
import {
    CALLER_WALLET,
    clientAndContractSetup,
    DEPLOYER_WALLET,
    OWNER_PRIVATE_KEY,
    OWNER_WALLET,
    RECEIVER2_WALLET,
    requestToken,
    resetClientChain,
    resetClientConnection,
    testClient,
    TestVars,
    wagmiConfig,
    walletClient
} from '../common/utils'

describe('Erc20 Client Test', () => {
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
        expect(vars.clientErc20NoParams.tokenAddress).to.be.undefined
        // expect(vars.clientErc20NoParams.tokenAbi).to.be.undefined
    })

    afterEach(async () => {
        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Initialize', async () => {
        expect(
            () =>
                new Erc20({
                    // @ts-ignore
                    mode: 'random',
                    options: {
                        wagmiConfig: wagmiConfig
                    }
                })
        ).toThrow()

        expect(
            () => new Erc20({ mode: 'client', options: { wagmiConfig: wagmiConfig } })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(vars.clientErc20Instance.connectors().length).to.be.eq(6)
        vars.clientErc20Instance.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })
    })

    it('Connection', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(vars.clientErc20Instance.connection()).to.eq('connected')

        await vars.clientErc20Instance.disconnect()

        expect(vars.clientErc20Instance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(2)!)
        ).rejects.toThrow()

        const connect = await vars.clientErc20Instance.connect(
            vars.clientErc20Instance.connectors().at(0)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientErc20Instance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(2)!)
        ).rejects.toThrow()

        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(5)!)

        const res = await vars.clientErc20Instance.reconnect()

        expect(res.length).to.eq(1)

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Disconnect', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(vars.clientErc20Instance.connection()).to.eq('connected')

        await vars.clientErc20Instance.disconnect()

        expect(vars.clientErc20Instance.connection()).to.eq('disconnected')

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Switch Chain', async () => {
        const { id, chainId, name, symbol } = vars.clientErc20Instance.chain()
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

        const switchR = await vars.clientErc20Instance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.clientErc20Instance.chain()
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

        await resetClientChain(vars.clientErc20Instance)
        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Use Chain', async () => {
        expect(() => vars.clientErc20Instance.useChain(sepolia.id)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )
    })

    it('Chain', () => {
        const { id, chainId, name, symbol } = vars.clientErc20Instance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(id).eq(anvil.id)
        expect(symbol).eq(anvil.nativeCurrency.symbol)
    })

    it('Chains', () => {
        const chains = vars.clientErc20Instance.chains()

        expect(chains.length).eq(3)
    })

    it('Switch Account', async () => {
        const connector1 = vars.clientErc20Instance.connectors()[0]!
        const connector2 = vars.clientErc20Instance.connectors()[1]!

        await vars.clientErc20Instance.connect(connector1)

        expect(vars.clientErc20Instance.account()).toBeDefined()

        expect(vars.clientErc20Instance.account()).to.be.eq(DEPLOYER_WALLET)

        expect(vars.clientErc20Instance.connection()).to.be.eq('connected')

        await vars.clientErc20Instance.connect(connector2)

        expect(vars.clientErc20Instance.connection()).to.be.eq('connected')

        await vars.clientErc20Instance.switchAccount(connector2, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(vars.clientErc20Instance.account()).toBeDefined()

        expect(vars.clientErc20Instance.account()).to.be.eq(OWNER_WALLET)

        await vars.clientErc20Instance.switchAccount(connector1, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(vars.clientErc20Instance.account()).toBeDefined()

        expect(vars.clientErc20Instance.account()).to.be.eq(DEPLOYER_WALLET)

        expect(
            async () => await vars.serverErc20Instance.switchAccount(connector2)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await vars.clientErc20Instance.disconnect()
        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Use Account', async () => {
        vars.serverErc20Instance.useAccount(OWNER_PRIVATE_KEY)

        expect(() => vars.clientErc20Instance.useAccount(OWNER_PRIVATE_KEY)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )

        expect(vars.serverErc20Instance.account()).to.be.eq(OWNER_WALLET)
    })

    it('Account', async () => {
        expect(vars.clientErc20Instance.account()).to.be.undefined

        const connector1 = vars.clientErc20Instance.connectors()[0]!
        await vars.clientErc20Instance.connect(connector1)

        expect(vars.clientErc20Instance.account()).to.be.eq(walletClient.account.address)

        await vars.clientErc20Instance.disconnect()

        expect(vars.clientErc20Instance.account()).to.be.undefined
        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Reader', async () => {
        const contractType = await vars.serverErc20Instance.reader({
            address: vars.controller,
            abi: controllerAbi_0_0_1,
            functionName: 'contractType'
        })

        expect(contractType).to.be.eq('CONTROLLER')

        const connector1 = vars.clientErc20Instance.connectors()[0]!

        await vars.clientErc20Instance.connect(connector1)

        const contractType2 = await vars.clientErc20Instance.reader({
            address: vars.controller,
            abi: controllerAbi_0_0_1,
            functionName: 'contractType'
        })

        expect(contractType2).to.be.eq('CONTROLLER')

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                // @ts-ignore
                await vars.serverErc20Instance.reader({
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
                await vars.serverErc20Instance.write({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(
            async () =>
                // @ts-ignore
                await vars.clientErc20Instance.write({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientErc20Instance.disconnect()
    })

    it('Use Token', async () => {
        expect(vars.clientErc20Instance.tokenAddress).to.be.eq(vars.devToken)
        expect(vars.clientErc20Instance.useToken(CALLER_WALLET).tokenAddress).to.be.eq(
            CALLER_WALLET
        )
        expect(vars.clientErc20Instance.useToken(vars.devToken).tokenAddress).to.be.eq(
            vars.devToken
        )
    })

    it('Use Abi', async () => {
        expect(vars.clientErc20Instance.tokenAbi).to.be.eq(erc20Abi)
        expect(vars.clientErc20Instance.useAbi(erc20Abi_bytes32).tokenAbi).to.be.eq(
            erc20Abi_bytes32
        )
        expect(vars.clientErc20Instance.useAbi(erc20Abi).tokenAbi).to.be.eq(erc20Abi)
    })

    it('Name', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(await vars.clientErc20Instance.name()).to.be.eq('DevToken')

        expect(async () => await vars.clientErc20NoParams.name()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Symbol', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(await vars.clientErc20Instance.symbol()).to.be.eq('DEV')

        expect(async () => await vars.clientErc20NoParams.symbol()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Decimals', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(await vars.clientErc20Instance.decimals()).to.be.eq(18)

        expect(async () => await vars.clientErc20NoParams.decimals()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Total Supply', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        const result = await vars.clientErc20Instance.totalSupply()
        expect(result).to.be.eq(parseEther('1000000000000'))

        expect(async () => await vars.clientErc20NoParams.totalSupply()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        await resetClientConnection(vars.clientErc20Instance)
    })

    it('Balance Of', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)

        expect(await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(parseEther('0'))
        expect(
            async () => await vars.clientErc20NoParams.balanceOf(RECEIVER2_WALLET)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))
    })

    it('Allowance', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(1)!)

        expect(await vars.clientErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            parseEther('0')
        )
        expect(
            async () => await vars.clientErc20NoParams.allowance(OWNER_WALLET, RECEIVER2_WALLET)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))
    })

    it('Approve', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(1)!)

        const amount = parseEther('1')

        expect(
            async () => await vars.clientErc20NoParams.approve(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        expect(
            async () => await vars.clientErc20InvalidAddress.approve(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError()

        expect(await vars.clientErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            parseEther('0')
        )

        const { status } = await vars.clientErc20Instance.approve(RECEIVER2_WALLET, amount)

        expect(status).to.eq('success')

        expect(await vars.clientErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            amount
        )

        await vars.clientErc20Instance.approve(RECEIVER2_WALLET, 0)
    })

    it('Transfer', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(1)!)

        const amount = parseEther('1')

        await requestToken(vars.devToken, OWNER_WALLET, amount)

        const ownerBalance = await vars.clientErc20Instance.balanceOf(OWNER_WALLET)

        expect(ownerBalance).to.be.eq(amount)

        expect(await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(parseEther('0'))

        expect(
            async () => await vars.clientErc20NoParams.transfer(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        const { status } = await vars.clientErc20Instance.transfer(RECEIVER2_WALLET, amount)

        expect(status).to.eq('success')

        expect(await vars.clientErc20Instance.balanceOf(OWNER_WALLET)).to.be.eq(
            ownerBalance - amount
        )

        expect(await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(amount)
    })

    it('Transfer From', async () => {
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)
        await vars.clientErc20Instance.connect(vars.clientErc20Instance.connectors().at(1)!)

        const amount = parseEther('1')

        await requestToken(vars.devToken, OWNER_WALLET, amount)

        const ownerBalance = await vars.clientErc20Instance.balanceOf(OWNER_WALLET)
        const receiverBalance = await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)

        expect(ownerBalance).to.be.eq(amount)

        expect(await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(receiverBalance)

        expect(
            async () =>
                await vars.clientErc20NoParams.transferFrom(OWNER_WALLET, RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        await vars.clientErc20Instance.approve(DEPLOYER_WALLET, amount)

        await vars.clientErc20Instance.switchAccount(vars.clientErc20Instance.connectors().at(0)!)

        const { status } = await vars.clientErc20Instance.transferFrom(
            OWNER_WALLET,
            RECEIVER2_WALLET,
            amount
        )

        expect(status).to.eq('success')

        expect(await vars.clientErc20Instance.allowance(OWNER_WALLET, DEPLOYER_WALLET)).to.be.eq(
            parseEther('0')
        )

        expect(await vars.clientErc20Instance.balanceOf(OWNER_WALLET)).to.be.eq(
            ownerBalance - amount
        )

        expect(await vars.clientErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(
            receiverBalance + amount
        )
    })
})
