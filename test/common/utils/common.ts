import { mock } from '@wagmi/core'
import {
    Chain,
    createPublicClient,
    createTestClient,
    createWalletClient,
    http,
    publicActions,
    SwitchChainError,
    walletActions
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { anvil } from 'viem/chains'
import Controller from '../../../src/sdk/controller'
import BonkersSDK from '../../../src/sdk/sdk'
import Vault from '../../../src/sdk/vault'
import VaultFactory from '../../../src/sdk/vaultFactory'
import {
    CALLER_WALLET,
    DEPLOYER_PRIVATE_KEY,
    DEPLOYER_WALLET,
    OWNER_PRIVATE_KEY,
    OWNER_WALLET
} from './accounts'
import Erc20 from '../../../src/sdk/erc20'

export const mockConnector = mock({
    accounts: [
        DEPLOYER_WALLET,
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
    ],
    features: {
        reconnect: true
    }
})

export const mockConnectorCallerNonOwner = mock({
    accounts: [CALLER_WALLET],
    features: {
        reconnect: true
    }
})

export const mockConnectorNoAccount = mock({
    // @ts-ignore
    accounts: [],
    features: {
        reconnect: true
    }
})

export const mockConnectorAdminOnly = mock({
    accounts: [
        OWNER_WALLET,
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
    ],
    features: {
        reconnect: true
    }
})

export const mockConnectorNoConnect = mock({
    accounts: [
        DEPLOYER_WALLET,
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
    ],
    features: {
        connectError: new Error('Simulated Connect Error')
    }
})

export const mockConnectorNoSwitch = mock({
    accounts: [
        DEPLOYER_WALLET,
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
    ],
    features: {
        switchChainError: new SwitchChainError(new Error('Simulated Error'))
    }
})

export const mockConnectorNoReconnect = mock({
    accounts: [
        DEPLOYER_WALLET,
        '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
        '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
    ],
    features: {
        reconnect: false
    }
})

export const publicClient = createPublicClient({
    chain: anvil,
    transport: http()
})

export const walletClient = createWalletClient({
    chain: anvil,
    transport: http(),
    account: privateKeyToAccount(DEPLOYER_PRIVATE_KEY)
})

export const walletClientAdmin = createWalletClient({
    chain: anvil,
    transport: http(),
    account: privateKeyToAccount(OWNER_PRIVATE_KEY)
})

export const testClient = createTestClient({
    mode: 'anvil',
    chain: anvil,
    transport: http(),
    account: privateKeyToAccount(DEPLOYER_PRIVATE_KEY)
})
    .extend(publicActions)
    .extend(walletActions)

export const testClientNoAccount = createTestClient({
    mode: 'anvil',
    chain: anvil,
    transport: http()
})
    .extend(publicActions)
    .extend(walletActions)

export async function mine(amount: number = 1) {
    await testClient.mine({ blocks: amount })
}

export async function mineSandwich(fn: Promise<any>, amount: number = 1) {
    await testClient.mine({ blocks: amount })
    const data = await fn
    await testClient.mine({ blocks: amount })
    return data
}

export async function resetChainState() {
    await testClient.loadState({
        state: '0x1f8b08000000000000ffed56cd8a24370c7e973aefc17ff2cf1c9790cd218710c8292c8d2cc9b345babb9aaa9a30cbd0ef1eb9bb77c80cc3922575595837342ed9d227d9f2273d0d753fd15fc3ddd3707c38549987bbc13c9ae1dd40d378acb8c855f01f87eaade34196150fa78ba255c93d2ebbfd7818d7ab840af9dc7776eb4dae00be1624bc18e0b1b5911ef6ebe7675f4eb3fc3de39171fa266fbee2a5465d77f248b22cbbee9f1adf9de691a49fc44d7ed9a38bc39db929e8c76d933d9fdf0d48343d1cd7a5eb68608129951203a32393abf3b1e4ead9132542ef6cf15c0ac0e5aca763b7d2ede21e2f73b5e0acd822864ac5eac2175769e2ebb2ce97759af1be3bd9f11513d807c406c1c5c43571221f53f64565c9ea79aa2b11e3a6981a97cd92adf806c42d2938798ea0b34a066b83aa4673db12d35308c4cc356231a6a1ab9081d91535e3d9ba86c1155f694bcc20506a0839a4ea53819421e7e20c61caad3617c9d450207e05f305426aff6f68a0d1d8a87e67fd77263b9fb2f1909dce42836c2c5888c677576d768da166dd050e4cffa972506d6afe8d589329259564086cb68ec9a3b186121b5bc188619b7a6e53def27c8b69a9d416a53a0a2d278d0f444fb96427b65963456fb498b829668a8229181725b9081034a320358490a2c7caa6478e5836c52c0a64125b04a8442e1620c8156d6c9a589c6da906953bb6c4442392d006c7ca0b649b92820d1230b704519f8b33a8d7edcc9698cd97c651c02272ce2db64012b1e6ec92d3dcd114aec5b9b8d97d2a68d54ab3bb14b0ddabea75112a31fff9347c12e4bef2349c7096e3fa0b2e9fb62a23d3e120f3f26cd1325160c92c9480136af45021a61a893858646f5d005b4bc89a85d637d3efa871301c8a0fa93b2e47d1f237e2fcf95b2baf56dd557e9fa675abe856adb90bd23a4ec7e5d92e44e5fe6693d55c06c0d85af60124162d7a2debfdd790457943d39e90c9286739d72a888fbe06d71b825948c6d3ba6ce9eb7eba5fdeefa7e9b089c11fe3fb1e6fb791af3842bbb95fdf684b55fcc722fcbced65431b63ad9e30ebc2617cdc924b6e9cf886b15baffcb3c86f327fe80de9cb8eb9f7a61f5e797ded61df5f57fe25d537fd13ae7825d4f3cb37ae74f9f10ba7f5f9f9e3f91ff04beeac200c0000'
    })
}

export function resetServerChain(
    client: BonkersSDK | Controller | Vault | VaultFactory | Erc20,
    chain: Chain = anvil
) {
    client.useChain(chain.id)
}

export async function resetClientChain(
    client: BonkersSDK | Controller | Vault | VaultFactory | Erc20,
    chain: Chain = anvil
) {
    await client.switchChain(chain.id)
}

export async function resetClientConnection(
    client: BonkersSDK | Controller | Vault | VaultFactory | Erc20
) {
    await client.disconnect()
}
