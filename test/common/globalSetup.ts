import { mine, resetChainState } from './utils/common'
import { prepareImplementations, prepareMulticall3 } from './utils/prepareContracts'

export default async function setup() {
    await resetChainState()
    await prepareMulticall3()
    await prepareImplementations()
    await mine()
}

export async function teardown() {}
