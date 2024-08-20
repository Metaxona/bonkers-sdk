import { Address, createPublicClient, erc20Abi, http } from 'viem'
import { anvil } from 'viem/chains'
import { walletClient } from './common'

export async function requestToken(token: Address, receiver: Address, amount: bigint) {
    try {
        const client = createPublicClient({
            chain: anvil,
            transport: http()
        })

        const balance = await client.readContract({
            address: token,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [walletClient.account.address]
        })

        if (balance < amount) throw new Error('Insufficient Balance')

        await walletClient.writeContract({
            address: token,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [receiver, amount as any]
        })
    } catch (error) {
        console.error(error.name, error.message)
        throw error
    }
}

export async function tokenBalanceOf(token: Address, user: Address) {
    try {
        const client = createPublicClient({
            chain: anvil,
            transport: http()
        })

        const balance = await client.readContract({
            address: token,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [user]
        })

        return balance
    } catch (error) {
        console.error(error.name, error.message)
        throw error
    }
}
