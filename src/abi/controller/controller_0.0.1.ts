import type { Abi } from 'viem'

/**
 * The Official Controller v0.0.1 Contract ABI
 *
 * @category Abi
 */
export default [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        name: 'BOT_ROLE',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'CALLER_ROLE',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'DEFAULT_ADMIN_ROLE',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'ERC_TRANSFER_ROLE',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'UPGRADER_ROLE',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'UPGRADE_INTERFACE_VERSION',
        inputs: [],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'addControllerRole',
        inputs: [
            { name: 'role', type: 'uint8', internalType: 'enum ControllerRole' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'call',
        inputs: [
            { name: 'targetContract', type: 'address', internalType: 'address' },
            { name: 'callData', type: 'bytes', internalType: 'bytes' }
        ],
        outputs: [{ name: '', type: 'bytes', internalType: 'bytes' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'callBatch',
        inputs: [
            {
                name: 'calls',
                type: 'tuple[]',
                internalType: 'struct IMulticall3.Call3[]',
                components: [
                    { name: 'target', type: 'address', internalType: 'address' },
                    { name: 'allowFailure', type: 'bool', internalType: 'bool' },
                    { name: 'callData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                internalType: 'struct IMulticall3.Result[]',
                components: [
                    { name: 'success', type: 'bool', internalType: 'bool' },
                    { name: 'returnData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'callBatchValue',
        inputs: [
            {
                name: 'calls',
                type: 'tuple[]',
                internalType: 'struct IMulticall3.Call3Value[]',
                components: [
                    { name: 'target', type: 'address', internalType: 'address' },
                    { name: 'allowFailure', type: 'bool', internalType: 'bool' },
                    { name: 'value', type: 'uint256', internalType: 'uint256' },
                    { name: 'callData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        outputs: [
            {
                name: '',
                type: 'tuple[]',
                internalType: 'struct IMulticall3.Result[]',
                components: [
                    { name: 'success', type: 'bool', internalType: 'bool' },
                    { name: 'returnData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'changeControllerOwner',
        inputs: [{ name: 'newOwner', type: 'address', internalType: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'contractType',
        inputs: [],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'createVault',
        inputs: [
            { name: 'targetVaultFactory', type: 'address', internalType: 'address' },
            { name: 'projectOwner', type: 'address', internalType: 'address' },
            { name: 'rewardToken', type: 'address', internalType: 'address' },
            { name: 'projectName', type: 'string', internalType: 'string' }
        ],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'feeReceiver',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'getRoleAdmin',
        inputs: [{ name: 'role', type: 'bytes32', internalType: 'bytes32' }],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'grantRole',
        inputs: [
            { name: 'role', type: 'bytes32', internalType: 'bytes32' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'hasControllerRole',
        inputs: [
            { name: 'role', type: 'uint8', internalType: 'enum ControllerRole' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'hasRole',
        inputs: [
            { name: 'role', type: 'bytes32', internalType: 'bytes32' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'initialize',
        inputs: [
            { name: 'initialAdmin', type: 'address', internalType: 'address' },
            { name: '_feeReceiver', type: 'address', internalType: 'address' },
            { name: 'initialBot', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'multicallAddress',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'proxiableUUID',
        inputs: [],
        outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'removeControllerRole',
        inputs: [
            { name: 'role', type: 'uint8', internalType: 'enum ControllerRole' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'renounceRole',
        inputs: [
            { name: 'role', type: 'bytes32', internalType: 'bytes32' },
            { name: 'callerConfirmation', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'revokeRole',
        inputs: [
            { name: 'role', type: 'bytes32', internalType: 'bytes32' },
            { name: 'account', type: 'address', internalType: 'address' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'setFeeReceiver',
        inputs: [{ name: 'newFeeReceiver', type: 'address', internalType: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'setMulticallAddress',
        inputs: [
            {
                name: 'newMulticallContract',
                type: 'address',
                internalType: 'address'
            }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'supportsInterface',
        inputs: [{ name: 'interfaceId', type: 'bytes4', internalType: 'bytes4' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'transferERC20Token',
        inputs: [
            { name: 'tokenAddress', type: 'address', internalType: 'address' },
            { name: 'receiver', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'upgradeToAndCall',
        inputs: [
            { name: 'newImplementation', type: 'address', internalType: 'address' },
            { name: 'data', type: 'bytes', internalType: 'bytes' }
        ],
        outputs: [],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'vaultReward',
        inputs: [
            { name: 'targetVault', type: 'address', internalType: 'address' },
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'vaultRewardBatch',
        inputs: [
            { name: 'targetVault', type: 'address', internalType: 'address' },
            {
                name: 'receivers',
                type: 'tuple[]',
                internalType: 'struct Receiver[]',
                components: [
                    { name: 'receiver', type: 'address', internalType: 'address' },
                    { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
            }
        ],
        outputs: [
            {
                name: 'returnData',
                type: 'tuple[]',
                internalType: 'struct Result[]',
                components: [
                    { name: 'success', type: 'bool', internalType: 'bool' },
                    { name: 'returnData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'version',
        inputs: [],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'event',
        name: 'AddedControllerRole',
        inputs: [
            {
                name: 'role',
                type: 'uint8',
                indexed: true,
                internalType: 'enum ControllerRole'
            },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'CallBatchExecuted',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'calls',
                type: 'tuple[]',
                indexed: true,
                internalType: 'struct IMulticall3.Call3[]',
                components: [
                    { name: 'target', type: 'address', internalType: 'address' },
                    { name: 'allowFailure', type: 'bool', internalType: 'bool' },
                    { name: 'callData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'CallBatchValueExecuted',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'calls',
                type: 'tuple[]',
                indexed: true,
                internalType: 'struct IMulticall3.Call3Value[]',
                components: [
                    { name: 'target', type: 'address', internalType: 'address' },
                    { name: 'allowFailure', type: 'bool', internalType: 'bool' },
                    { name: 'value', type: 'uint256', internalType: 'uint256' },
                    { name: 'callData', type: 'bytes', internalType: 'bytes' }
                ]
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'CallExecuted',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'target',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            { name: 'callData', type: 'bytes', indexed: true, internalType: 'bytes' }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ControllerOwnerUpdated',
        inputs: [
            {
                name: 'previousOwner',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newOwner',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ERCTransferExecuted',
        inputs: [
            {
                name: 'ercType',
                type: 'string',
                indexed: false,
                internalType: 'string'
            },
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'receiver',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'tokenAddress',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'tokenId',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256'
            },
            {
                name: 'amount',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'FeeReceiverUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newFeeReceiver',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'Initialized',
        inputs: [
            {
                name: 'version',
                type: 'uint64',
                indexed: false,
                internalType: 'uint64'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'MulticallContractUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newMulticallContract',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'RemovedControllerRole',
        inputs: [
            {
                name: 'role',
                type: 'uint8',
                indexed: true,
                internalType: 'enum ControllerRole'
            },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'Rewarded',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'targetVault',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'receiver',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'amount',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'RewardedBatch',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'targetVault',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'receiverAmount',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            },
            {
                name: 'receivers',
                type: 'tuple[]',
                indexed: false,
                internalType: 'struct Receiver[]',
                components: [
                    { name: 'receiver', type: 'address', internalType: 'address' },
                    { name: 'amount', type: 'uint256', internalType: 'uint256' }
                ]
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'RoleAdminChanged',
        inputs: [
            { name: 'role', type: 'bytes32', indexed: true, internalType: 'bytes32' },
            {
                name: 'previousAdminRole',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32'
            },
            {
                name: 'newAdminRole',
                type: 'bytes32',
                indexed: true,
                internalType: 'bytes32'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'RoleGranted',
        inputs: [
            { name: 'role', type: 'bytes32', indexed: true, internalType: 'bytes32' },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'sender',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'RoleRevoked',
        inputs: [
            { name: 'role', type: 'bytes32', indexed: true, internalType: 'bytes32' },
            {
                name: 'account',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'sender',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'Upgraded',
        inputs: [
            {
                name: 'implementation',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'VaultCreated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'vault',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'factory',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'projectOwner',
                type: 'address',
                indexed: false,
                internalType: 'address'
            },
            {
                name: 'projectName',
                type: 'string',
                indexed: false,
                internalType: 'string'
            },
            {
                name: 'rewardToken',
                type: 'address',
                indexed: false,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    { type: 'error', name: 'AccessControlBadConfirmation', inputs: [] },
    {
        type: 'error',
        name: 'AccessControlUnauthorizedAccount',
        inputs: [
            { name: 'account', type: 'address', internalType: 'address' },
            { name: 'neededRole', type: 'bytes32', internalType: 'bytes32' }
        ]
    },
    {
        type: 'error',
        name: 'AddressEmptyCode',
        inputs: [{ name: 'target', type: 'address', internalType: 'address' }]
    },
    {
        type: 'error',
        name: 'AddressInsufficientBalance',
        inputs: [{ name: 'account', type: 'address', internalType: 'address' }]
    },
    { type: 'error', name: 'CallFailed', inputs: [] },
    { type: 'error', name: 'CanNotBeZeroAddress', inputs: [] },
    {
        type: 'error',
        name: 'ERC1967InvalidImplementation',
        inputs: [{ name: 'implementation', type: 'address', internalType: 'address' }]
    },
    { type: 'error', name: 'ERC1967NonPayable', inputs: [] },
    { type: 'error', name: 'FailedInnerCall', inputs: [] },
    { type: 'error', name: 'InvalidInitialization', inputs: [] },
    { type: 'error', name: 'NoReceiversFound', inputs: [] },
    { type: 'error', name: 'NotControllerOwner', inputs: [] },
    { type: 'error', name: 'NotInitializing', inputs: [] },
    { type: 'error', name: 'ReentrancyGuardReentrantCall', inputs: [] },
    {
        type: 'error',
        name: 'SafeERC20FailedOperation',
        inputs: [{ name: 'token', type: 'address', internalType: 'address' }]
    },
    { type: 'error', name: 'UUPSUnauthorizedCallContext', inputs: [] },
    {
        type: 'error',
        name: 'UUPSUnsupportedProxiableUUID',
        inputs: [{ name: 'slot', type: 'bytes32', internalType: 'bytes32' }]
    }
] as Abi
