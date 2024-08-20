import { parseAbi } from 'viem'

/**
 * The Base Contract ABI used to check a contract's version and type
 * which is common in all Bonkers Contract
 *
 * @category Abi
 */
export default parseAbi([
    'function contractType() external view returns (string memory)',
    'function version() external view returns (string memory)'
])
