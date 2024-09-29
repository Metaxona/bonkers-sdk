import { erc20Abi, Hex, parseEther, zeroAddress } from 'viem'
import { anvil, sepolia } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { controllerAbi_0_0_1, vaultAbi_0_0_1, vaultFactoryAbi_0_0_1 } from '../../src/abi'
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
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    MULTICALL3_ADDRESS,
    OWNER_WALLET,
    resetClientChain,
    resetClientConnection,
    resetServerChain,
    testClient,
    TestVars,
    walletClient
} from '../common/utils'

describe('SDK Test', () => {
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
    })

    afterEach(async () => {})

    it('Connectors', async () => {
        expect(vars.clientBonkersSDKInstance.connectors().length).to.be.eq(6)
        vars.clientBonkersSDKInstance.connectors().forEach((item) => {
            expect(item.name).to.be.eq('Mock Connector')
        })

        expect(() => vars.serverBonkersSDKInstance.connectors()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )
    })

    it('Connection', async () => {
        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(0)!
        )

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        await vars.clientBonkersSDKInstance.disconnect()

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('disconnected')

        expect(() => vars.serverBonkersSDKInstance.connection()).toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Connect', async () => {
        expect(
            async () =>
                await vars.clientBonkersSDKInstance.connect(
                    vars.clientBonkersSDKInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        const connect = await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(0)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        expect(
            async () =>
                await vars.serverBonkersSDKInstance.connect(
                    vars.clientBonkersSDKInstance.connectors().at(0)!
                )
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Re-Connect', async () => {
        expect(
            async () =>
                await vars.clientBonkersSDKInstance.connect(
                    vars.clientBonkersSDKInstance.connectors().at(2)!
                )
        ).rejects.toThrow()

        const connect = await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(0)!
        )

        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(5)!
        )

        expect(connect.chainId).to.eq(anvil.id)
        expect(connect.accounts[0]).to.eq(DEPLOYER_WALLET)
        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        expect(async () => await vars.serverBonkersSDKInstance.reconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        const res = await vars.clientBonkersSDKInstance.reconnect()

        expect(res.length).to.eq(1)

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Disconnect', async () => {
        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(0)!
        )

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('connected')

        await vars.clientBonkersSDKInstance.disconnect()

        expect(vars.clientBonkersSDKInstance.connection()).to.eq('disconnected')

        expect(async () => await vars.serverBonkersSDKInstance.disconnect()).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Switch Chain', async () => {
        const { id, chainId, name, symbol } = vars.clientBonkersSDKInstance.chain()
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

        const switchR = await vars.clientBonkersSDKInstance.switchChain(sepolia.id)

        expect(switchR.id).to.be.eq(sepolia.id)
        expect(switchR.name).to.be.eq(sepolia.name)

        const {
            id: id5,
            chainId: chainId5,
            name: name5,
            symbol: symbol5
        } = vars.clientBonkersSDKInstance.chain()
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

        expect(
            async () => await vars.serverBonkersSDKInstance.switchChain(sepolia.id)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await resetClientChain(vars.clientBonkersSDKInstance)
    })

    it('Use Chain', async () => {
        expect(() => vars.clientBonkersSDKInstance.useChain(sepolia.id)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )

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

        vars.serverBonkersSDKInstance.useChain(sepolia.id)

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

        resetServerChain(vars.serverBonkersSDKInstance)
    })

    it('Chain', () => {
        const { id, chainId, name, symbol } = vars.clientBonkersSDKInstance.chain()

        expect(chainId).eq(anvil.id)
        expect(name).eq('Anvil')
        expect(id).eq(anvil.id)
        expect(symbol).eq(anvil.nativeCurrency.symbol)

        const {
            id: id2,
            chainId: chainId2,
            name: name2,
            symbol: symbol2
        } = vars.serverBonkersSDKInstance.chain()

        expect(chainId2).eq(anvil.id)
        expect(name2).eq('Anvil')
        expect(id2).eq(anvil.id)
        expect(symbol2).eq(anvil.nativeCurrency.symbol)
    })

    it('Chains', () => {
        const chains = vars.clientBonkersSDKInstance.chains()

        expect(chains.length).eq(3)

        const chains2 = vars.serverBonkersSDKInstance.chains()

        expect(chains2.length).eq(3)
    })

    it('Account', async () => {
        expect(vars.clientBonkersSDKInstance.account()).to.be.undefined

        const connector1 = vars.clientBonkersSDKInstance.connectors()[0]!
        await vars.clientBonkersSDKInstance.connect(connector1)

        expect(vars.clientBonkersSDKInstance.account()).to.be.eq(walletClient.account.address)

        await vars.clientBonkersSDKInstance.disconnect()

        expect(vars.clientBonkersSDKInstance.account()).to.be.undefined
    })

    it('Switch Account', async () => {
        const connector1 = vars.clientBonkersSDKInstance.connectors()[0]!
        const connector2 = vars.clientBonkersSDKInstance.connectors()[1]!

        await vars.clientBonkersSDKInstance.connect(connector1)

        expect(vars.clientBonkersSDKInstance.account()).toBeDefined()

        expect(vars.clientBonkersSDKInstance.account()).to.be.eq(DEPLOYER_WALLET)

        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('connected')

        await vars.clientBonkersSDKInstance.connect(connector2)

        expect(vars.clientBonkersSDKInstance.connection()).to.be.eq('connected')

        await vars.clientBonkersSDKInstance.switchAccount(connector2, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(vars.clientBonkersSDKInstance.account()).toBeDefined()

        expect(vars.clientBonkersSDKInstance.account()).to.be.eq(OWNER_WALLET)

        await vars.clientBonkersSDKInstance.switchAccount(connector1, (curr, prev) => {
            expect(curr).to.not.eq(prev)
        })

        expect(vars.clientBonkersSDKInstance.account()).toBeDefined()

        expect(vars.clientBonkersSDKInstance.account()).to.be.eq(DEPLOYER_WALLET)

        expect(
            async () => await vars.serverBonkersSDKInstance.switchAccount(connector2)
        ).rejects.toThrowError(
            new InvalidSDKMode('This function is only available on Client Mode/Environment')
        )

        await vars.clientBonkersSDKInstance.disconnect()
    })

    it('Use Account', async () => {
        expect(vars.serverBonkersSDKInstance.account()).to.be.eq(OWNER_WALLET)

        vars.serverBonkersSDKInstance.useAccount(DEPLOYER_PRIVATE_KEY)

        expect(() => vars.clientBonkersSDKInstance.useAccount(DEPLOYER_PRIVATE_KEY)).toThrowError(
            new InvalidSDKMode('This function is only available on Server Mode/Environment')
        )

        expect(vars.serverBonkersSDKInstance.account()).to.be.eq(DEPLOYER_WALLET)
    })

    it('Get Contract Type', async () => {
        expect(await vars.serverBonkersSDKInstance.getContractType(vars.controller)).to.be.eq(
            'CONTROLLER'
        )
        expect(
            async () => await vars.serverBonkersSDKInstance.getContractType(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractType('Can Not Find Contract Type From The Given Address')
        )
    })

    it('Get Contract Version', async () => {
        expect(await vars.serverBonkersSDKInstance.getContractVersion(vars.controller)).to.be.eq(
            '0.0.1'
        )
        expect(
            async () => await vars.serverBonkersSDKInstance.getContractVersion(CONTROLLER_ADMIN)
        ).rejects.toThrowError(
            new InvalidContractVersion('Can Not Find Version From The Given Address')
        )
    })

    it('Controller', async () => {
        expect(
            async () => await vars.serverBonkersSDKInstance.controller().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.clientBonkersSDKInstance.controller().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () =>
                await vars.serverBonkersSDKInstance
                    // @ts-ignore
                    .controller({ abi: controllerAbi_0_0_1 })
                    .contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))
        expect(
            async () =>
                await vars.clientBonkersSDKInstance
                    // @ts-ignore
                    .controller({ abi: controllerAbi_0_0_1 })
                    .contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))

        expect(
            await vars.clientBonkersSDKInstance
                .controller(
                    await vars.clientBonkersSDKInstance.getParams(
                        anvil.id,
                        vars.controller,
                        'CONTROLLER'
                    )
                )
                .contractType()
        ).to.be.eq('CONTROLLER')
        expect(
            await vars.serverBonkersSDKInstance
                .controller(
                    await vars.serverBonkersSDKInstance.getParams(
                        anvil.id,
                        vars.controller,
                        'CONTROLLER'
                    )
                )
                .contractType()
        ).to.be.eq('CONTROLLER')
    })

    it('Vault', async () => {
        expect(
            async () => await vars.serverBonkersSDKInstance.vault().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.clientBonkersSDKInstance.vault().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () =>
                // @ts-ignore
                await vars.serverBonkersSDKInstance.vault({ abi: vaultAbi_0_0_1 }).contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))
        expect(
            async () =>
                // @ts-ignore
                await vars.clientBonkersSDKInstance.vault({ abi: vaultAbi_0_0_1 }).contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))

        expect(
            await vars.clientBonkersSDKInstance
                .vault(await vars.clientBonkersSDKInstance.getParams(anvil.id, vars.vault, 'VAULT'))
                .contractType()
        ).to.be.eq('VAULT')
        expect(
            await vars.serverBonkersSDKInstance
                .vault(await vars.serverBonkersSDKInstance.getParams(anvil.id, vars.vault, 'VAULT'))
                .contractType()
        ).to.be.eq('VAULT')
    })

    it('Vault Factory', async () => {
        expect(
            async () => await vars.serverBonkersSDKInstance.vaultFactory().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () => await vars.clientBonkersSDKInstance.vaultFactory().contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Abi'))
        expect(
            async () =>
                await vars.serverBonkersSDKInstance
                    // @ts-ignore
                    .vaultFactory({ abi: vaultFactoryAbi_0_0_1 })
                    .contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))
        expect(
            async () =>
                await vars.clientBonkersSDKInstance
                    // @ts-ignore
                    .vaultFactory({ abi: vaultFactoryAbi_0_0_1 })
                    .contractType()
        ).rejects.toThrowError(new MissingRequiredParams('Contract Address'))

        expect(
            await vars.clientBonkersSDKInstance
                .vaultFactory(
                    await vars.clientBonkersSDKInstance.getParams(
                        anvil.id,
                        vars.vaultFactory,
                        'VAULT FACTORY'
                    )
                )
                .contractType()
        ).to.be.eq('VAULT FACTORY')
        expect(
            await vars.serverBonkersSDKInstance
                .vaultFactory(
                    await vars.serverBonkersSDKInstance.getParams(
                        anvil.id,
                        vars.vaultFactory,
                        'VAULT FACTORY'
                    )
                )
                .contractType()
        ).to.be.eq('VAULT FACTORY')
    })

    it('Erc20', async () => {
        expect(async () => await vars.serverBonkersSDKInstance.erc20().name()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        expect(async () => await vars.clientBonkersSDKInstance.erc20().name()).rejects.toThrowError(
            new MissingRequiredParams('Token Address')
        )

        expect(await vars.serverBonkersSDKInstance.erc20(vars.devToken).name()).to.be.eq('DevToken')
        expect(await vars.serverBonkersSDKInstance.erc20(vars.devToken).symbol()).to.be.eq('DEV')
        expect(await vars.serverBonkersSDKInstance.erc20(vars.devToken).decimals()).to.be.eq(18)
    })

    it('Get Params', async () => {
        expect(
            async () =>
                await vars.serverBonkersSDKInstance.getParams(1, vars.controller, 'CONTROLLER')
        ).rejects.toThrowError(
            new InvalidChainId(`Chain Id [1] Does Not Exist On The Provided Chains`)
        )

        expect(
            async () =>
                await vars.serverBonkersSDKInstance.getParams(anvil.id, vars.controller, 'VAULT')
        ).rejects.toThrowError(
            new InvalidContract(
                `Failed To Verify Contract Existence On ${anvil.name} Chain | Cause: Contract Type and Expected Contract Type Does Not Match`
            )
        )

        const clientControllerParams = await vars.serverBonkersSDKInstance.getParams(
            anvil.id,
            vars.controller,
            'CONTROLLER'
        )
        const serverControllerParams = await vars.clientBonkersSDKInstance.getParams(
            anvil.id,
            vars.controller,
            'CONTROLLER'
        )

        expect(clientControllerParams.address).to.be.eq(vars.controller)
        expect(clientControllerParams.abi).to.be.eq(controllerAbi_0_0_1)
        expect(serverControllerParams.address).to.be.eq(vars.controller)
        expect(serverControllerParams.abi).to.be.eq(controllerAbi_0_0_1)

        const clientVaultParams = await vars.serverBonkersSDKInstance.getParams(
            anvil.id,
            vars.vault,
            'VAULT'
        )
        const serverVaultParams = await vars.clientBonkersSDKInstance.getParams(
            anvil.id,
            vars.vault,
            'VAULT'
        )

        expect(clientVaultParams.address).to.be.eq(vars.vault)
        expect(clientVaultParams.abi).to.be.eq(vaultAbi_0_0_1)
        expect(serverVaultParams.address).to.be.eq(vars.vault)
        expect(serverVaultParams.abi).to.be.eq(vaultAbi_0_0_1)

        const clientVaultFactoryParams = await vars.serverBonkersSDKInstance.getParams(
            anvil.id,
            vars.vaultFactory,
            'VAULT FACTORY'
        )
        const serverVaultFactoryParams = await vars.clientBonkersSDKInstance.getParams(
            anvil.id,
            vars.vaultFactory,
            'VAULT FACTORY'
        )

        expect(clientVaultFactoryParams.address).to.be.eq(vars.vaultFactory)
        expect(clientVaultFactoryParams.abi).to.be.eq(vaultFactoryAbi_0_0_1)
        expect(serverVaultFactoryParams.address).to.be.eq(vars.vaultFactory)
        expect(serverVaultFactoryParams.abi).to.be.eq(vaultFactoryAbi_0_0_1)
    })

    it('On Client Mode', async () => {
        // @ts-ignore
        expect(vars.clientBonkersSDKInstance.onClientMode()).to.be.true

        // @ts-ignore
        expect(vars.serverBonkersSDKInstance.onClientMode()).to.be.false
    })

    it('On Server Mode', async () => {
        // @ts-ignore
        expect(vars.clientBonkersSDKInstance.onServerMode()).to.be.false

        // @ts-ignore
        expect(vars.serverBonkersSDKInstance.onServerMode()).to.be.true
    })

    it('Balance Of', async () => {
        expect(await vars.clientBonkersSDKInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        const connector1 = vars.clientBonkersSDKInstance.connectors()[0]!

        await vars.clientBonkersSDKInstance.connect(connector1)

        expect(await vars.clientBonkersSDKInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(
            async () => await vars.clientBonkersSDKInstance.balanceOf('0x')
        ).rejects.toThrowError()

        expect(await vars.serverBonkersSDKInstance.balanceOf(CALLER_WALLET)).to.be.eq(
            10000000000000000000000n
        )

        expect(
            async () => await vars.serverBonkersSDKInstance.balanceOf('0x')
        ).rejects.toThrowError()

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Reader', async () => {
        const contractType = await vars.serverBonkersSDKInstance.reader({
            address: vars.controller,
            abi: controllerAbi_0_0_1,
            functionName: 'contractType'
        })

        expect(contractType).to.be.eq('CONTROLLER')

        const connector1 = vars.clientBonkersSDKInstance.connectors()[0]!

        await vars.clientBonkersSDKInstance.connect(connector1)

        const contractType2 = await vars.clientBonkersSDKInstance.reader({
            address: vars.controller,
            abi: controllerAbi_0_0_1,
            functionName: 'contractType'
        })

        expect(contractType2).to.be.eq('CONTROLLER')

        await resetClientConnection(vars.clientBonkersSDKInstance)
    })

    it('Writer', async () => {
        expect(
            await vars.serverBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.serverBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('0'))

        await vars.serverBonkersSDKInstance.writer({
            address: vars.devToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [CALLER_WALLET, parseEther('1')]
        })

        expect(
            await vars.serverBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.serverBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('1'))

        await vars.serverBonkersSDKInstance.writer({
            address: vars.devToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [CALLER_WALLET, parseEther('2')]
        })

        expect(
            await vars.serverBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.serverBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('2'))

        const connector1 = vars.clientBonkersSDKInstance.connectors()[0]!

        await vars.clientBonkersSDKInstance.connect(connector1)

        expect(
            await vars.clientBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.clientBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('2'))

        await vars.clientBonkersSDKInstance.writer({
            address: vars.devToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [CALLER_WALLET, parseEther('3')]
        })

        expect(
            await vars.clientBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.clientBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('3'))

        await vars.clientBonkersSDKInstance.writer({
            address: vars.devToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [CALLER_WALLET, parseEther('4')]
        })

        expect(
            await vars.clientBonkersSDKInstance.reader({
                address: vars.devToken,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [vars.clientBonkersSDKInstance.account(), CALLER_WALLET]
            })
        ).to.be.eq(parseEther('4'))

        await vars.clientBonkersSDKInstance.disconnect()
    })

    it('Reader Error', async () => {
        expect(
            async () =>
                await vars.serverBonkersSDKInstance.reader({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'contractVersion'
                })
        ).rejects.toThrow()
    })

    it('Writer Error', async () => {
        expect(
            async () =>
                await vars.serverBonkersSDKInstance.writer({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientBonkersSDKInstance.connect(
            vars.clientBonkersSDKInstance.connectors().at(0)!
        )

        expect(
            async () =>
                await vars.clientBonkersSDKInstance.writer({
                    address: vars.controller,
                    abi: controllerAbi_0_0_1,
                    functionName: 'setMulticallAddress',
                    args: [zeroAddress]
                })
        ).rejects.toThrow()

        await vars.clientBonkersSDKInstance.disconnect()
    })
})
