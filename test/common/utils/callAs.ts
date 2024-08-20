import { Abi, Address, Chain, createWalletClient, Hex, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { anvil } from 'viem/chains'

export async function callAs(
    adminPrivateKey: Hex,
    params: { address: Address; abi: Abi; functionName: string; args: any[] },
    chain: Chain = anvil
) {
    const account = privateKeyToAccount(adminPrivateKey)

    const client = createWalletClient({
        chain: chain,
        transport: http(),
        account: account
    })

    await client.writeContract({
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args
    } as any)
}
