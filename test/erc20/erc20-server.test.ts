import { erc20Abi, erc20Abi_bytes32, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { controllerAbi_0_0_1 } from '../../src/abi'
import Erc20 from '../../src/sdk/erc20'
import { InvalidSDKMode, MissingRequiredParams } from '../../src/utils'
import {
    CALLER_PRIVATE_KEY,
    CALLER_WALLET,
    clientAndContractSetup,
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    OWNER_PRIVATE_KEY,
    OWNER_WALLET,
    RECEIVER2_PRIVATE_KEY,
    RECEIVER2_WALLET,
    requestToken,
    resetServerChain,
    testClient,
    TestVars
} from '../common/utils'

describe('Erc20 Server Test', () => {
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
        expect(vars.serverErc20NoParams.tokenAddress).to.be.undefined
        expect(vars.serverErc20InvalidAddress.tokenAddress).to.be.not.eq(vars.devToken)
    })

    afterEach(async () => {
        vars.serverErc20Instance.useAccount(OWNER_PRIVATE_KEY)
    })

    it('Initialize', async () => {
        expect(
            () =>
                new Erc20({
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
                new Erc20({
                    mode: 'server',
                    options: {
                        privateKey: DEPLOYER_PRIVATE_KEY,
                        chains: [anvil]
                    }
                })
        ).not.toThrow()
    })

    it('Connectors', async () => {
        expect(() => vars.serverErc20Instance.connectors()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connection', async () => {
        expect(() => vars.serverErc20Instance.connection()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.serverErc20Instance.connect(vars.clientErc20Instance.connectors().at(0)!)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Re-Connect', async () => {
        expect(async () => await vars.serverErc20Instance.reconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Disconnect', async () => {
        expect(async () => await vars.serverErc20Instance.disconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Switch Chain', async () => {
        expect(
            async () => await vars.serverErc20Instance.switchChain(sepolia.id)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Use Chain', async () => {
        const { id, chainId, name, symbol } = vars.serverErc20Instance.chain()
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

        vars.serverErc20Instance.useChain(sepolia.id)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.serverErc20Instance.chain()
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

        resetServerChain(vars.serverErc20Instance)
    })

    it('Chain', () => {
        const { id, chainId, name, symbol } = vars.serverErc20Instance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(id).eq(anvil.id)
        expect(symbol).eq(anvil.nativeCurrency.symbol)
    })

    it('Chains', () => {
        const chains = vars.clientErc20Instance.chains()

        expect(chains.length).eq(3)
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
        expect(vars.serverErc20Instance.tokenAddress).to.be.eq(vars.devToken)
        expect(vars.serverErc20Instance.useToken(RECEIVER2_WALLET).tokenAddress).to.be.eq(
            RECEIVER2_WALLET
        )
        expect(vars.serverErc20Instance.useToken(vars.devToken).tokenAddress).to.be.eq(
            vars.devToken
        )
    })

    it('Use Abi', async () => {
        expect(vars.serverErc20Instance.tokenAbi).to.be.eq(erc20Abi)
        expect(vars.serverErc20Instance.useAbi(erc20Abi_bytes32).tokenAbi).to.be.eq(
            erc20Abi_bytes32
        )
        expect(vars.serverErc20Instance.useAbi(erc20Abi).tokenAbi).to.be.eq(erc20Abi)
    })

    it('Name', async () => {
        expect(await vars.serverErc20Instance.name()).to.be.eq('DevToken')

        expect(async () => await vars.serverErc20NoParams.name()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )
    })

    it('Symbol', async () => {
        expect(await vars.serverErc20Instance.symbol()).to.be.eq('DEV')

        expect(async () => await vars.serverErc20NoParams.symbol()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )
    })

    it('Decimals', async () => {
        expect(await vars.serverErc20Instance.decimals()).to.be.eq(18)

        expect(async () => await vars.serverErc20NoParams.decimals()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )
    })

    it('Total Supply', async () => {
        const result = await vars.serverErc20Instance.totalSupply()
        expect(result).to.be.eq(parseEther('1000000000000'))

        expect(async () => await vars.serverErc20NoParams.totalSupply()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )
    })

    it('Balance Of', async () => {
        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(parseEther('0'))
        expect(
            async () => await vars.serverErc20NoParams.balanceOf(RECEIVER2_WALLET)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))
    })

    it('Allowance', async () => {
        expect(await vars.serverErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            parseEther('0')
        )
        expect(
            async () => await vars.serverErc20NoParams.allowance(OWNER_WALLET, RECEIVER2_WALLET)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))
    })

    it('Approve', async () => {
        const amount = parseEther('1')

        expect(
            async () => await vars.serverErc20NoParams.approve(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        expect(
            async () => await vars.serverErc20InvalidAddress.approve(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError()

        expect(await vars.serverErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            parseEther('0')
        )

        const { status } = await vars.serverErc20Instance.approve(RECEIVER2_WALLET, amount)

        expect(status).to.eq('success')

        expect(await vars.serverErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            amount
        )

        await vars.serverErc20Instance.approve(RECEIVER2_WALLET, 0)
    })

    it('Transfer', async () => {
        const amount = parseEther('1')

        await requestToken(vars.devToken, OWNER_WALLET, amount)

        const ownerBalance = await vars.serverErc20Instance.balanceOf(OWNER_WALLET)

        expect(ownerBalance).to.be.eq(amount)

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(parseEther('0'))

        expect(
            async () => await vars.serverErc20NoParams.transfer(RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        const { status } = await vars.serverErc20Instance
            .useAccount(OWNER_PRIVATE_KEY)
            .transfer(RECEIVER2_WALLET, amount)

        expect(status).to.eq('success')

        expect(await vars.serverErc20Instance.balanceOf(OWNER_WALLET)).to.be.eq(
            ownerBalance - amount
        )

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(amount)

        const { status: newStatus } = await vars.serverErc20Instance
            .useAccount(RECEIVER2_PRIVATE_KEY)
            .transfer(DEPLOYER_WALLET, amount)

        expect(newStatus).to.eq('success')

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(parseEther('0'))
    })

    it('Transfer From', async () => {
        const amount = parseEther('1')

        await requestToken(vars.devToken, OWNER_WALLET, amount)

        const ownerBalance = await vars.serverErc20Instance.balanceOf(OWNER_WALLET)
        const receiverBalance = await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)

        expect(ownerBalance).to.be.eq(amount)

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(receiverBalance)

        expect(
            async () =>
                await vars.serverErc20NoParams.transferFrom(OWNER_WALLET, RECEIVER2_WALLET, amount)
        ).rejects.toThrowError(new MissingRequiredParams('Token Address'))

        await vars.serverErc20Instance.approve(RECEIVER2_WALLET, amount)

        const { status } = await vars.serverErc20Instance
            .useAccount(RECEIVER2_PRIVATE_KEY)
            .transferFrom(OWNER_WALLET, RECEIVER2_WALLET, amount)

        expect(status).to.eq('success')

        expect(await vars.serverErc20Instance.allowance(OWNER_WALLET, RECEIVER2_WALLET)).to.be.eq(
            parseEther('0')
        )

        expect(await vars.serverErc20Instance.balanceOf(OWNER_WALLET)).to.be.eq(
            ownerBalance - amount
        )

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(
            receiverBalance + amount
        )

        const { status: newStatus } = await vars.serverErc20Instance
            .useAccount(RECEIVER2_PRIVATE_KEY)
            .transfer(DEPLOYER_WALLET, amount)

        expect(newStatus).to.eq('success')

        expect(await vars.serverErc20Instance.balanceOf(RECEIVER2_WALLET)).to.be.eq(receiverBalance)
    })
})
