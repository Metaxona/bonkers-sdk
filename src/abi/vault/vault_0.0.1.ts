import type { Abi } from 'viem'

/**
 * The Official Vault v0.0.1 Contract ABI
 *
 * @category Abi
 */
export default [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    {
        type: 'function',
        name: 'CONTROLLER_ROLE',
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
        name: 'changeVaultOwner',
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
        name: 'controllerLimits',
        inputs: [{ name: 'controller', type: 'address', internalType: 'address' }],
        outputs: [
            { name: 'quota', type: 'uint256', internalType: 'uint256' },
            { name: 'allowance', type: 'uint256', internalType: 'uint256' }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'controllerLimitsEnabled',
        inputs: [],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'defaultControllerLimits',
        inputs: [],
        outputs: [
            { name: 'quota', type: 'uint256', internalType: 'uint256' },
            { name: 'allowance', type: 'uint256', internalType: 'uint256' }
        ],
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
        name: 'getVaultInfo',
        inputs: [],
        outputs: [
            {
                name: '',
                type: 'tuple',
                internalType: 'struct VaultInfo',
                components: [
                    { name: 'id', type: 'uint256', internalType: 'uint256' },
                    { name: 'version', type: 'string', internalType: 'string' },
                    { name: 'projectOwner', type: 'address', internalType: 'address' },
                    { name: 'projectName', type: 'string', internalType: 'string' },
                    { name: 'rewardToken', type: 'address', internalType: 'address' },
                    { name: 'createdAt', type: 'uint256', internalType: 'uint256' },
                    { name: 'deployer', type: 'address', internalType: 'address' }
                ]
            }
        ],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'grantPermit',
        inputs: [{ name: 'controller', type: 'address', internalType: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable'
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
            {
                name: '_vaultInfo',
                type: 'tuple',
                internalType: 'struct VaultInfo',
                components: [
                    { name: 'id', type: 'uint256', internalType: 'uint256' },
                    { name: 'version', type: 'string', internalType: 'string' },
                    { name: 'projectOwner', type: 'address', internalType: 'address' },
                    { name: 'projectName', type: 'string', internalType: 'string' },
                    { name: 'rewardToken', type: 'address', internalType: 'address' },
                    { name: 'createdAt', type: 'uint256', internalType: 'uint256' },
                    { name: 'deployer', type: 'address', internalType: 'address' }
                ]
            }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'isController',
        inputs: [{ name: 'controller', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
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
        name: 'revokePermit',
        inputs: [{ name: 'controller', type: 'address', internalType: 'address' }],
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
        name: 'reward',
        inputs: [
            { name: 'to', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'rewardBatch',
        inputs: [
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
        name: 'rewardPool',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'setControllerLimits',
        inputs: [
            { name: 'controller', type: 'address', internalType: 'address' },
            { name: 'quota', type: 'uint256', internalType: 'uint256' },
            { name: 'rewardAllowance', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'setDefaultControllerLimits',
        inputs: [
            { name: 'quota', type: 'uint256', internalType: 'uint256' },
            { name: 'rewardAllowance', type: 'uint256', internalType: 'uint256' }
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
        name: 'toggleControllerLimits',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'updateRewardToken',
        inputs: [{ name: 'newRewardToken', type: 'address', internalType: 'address' }],
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
        name: 'version',
        inputs: [],
        outputs: [{ name: '', type: 'string', internalType: 'string' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'withdrawToken',
        inputs: [
            { name: 'tokenAddress', type: 'address', internalType: 'address' },
            { name: 'amount', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'nonpayable'
    },
    {
        type: 'event',
        name: 'ControllerLimitsToggled',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            { name: 'enabled', type: 'bool', indexed: true, internalType: 'bool' }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ControllerLimitsUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: false,
                internalType: 'address'
            },
            {
                name: 'controller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'quota',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            },
            {
                name: 'maxRewardAmount',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ControllerPermissionGranted',
        inputs: [
            {
                name: 'permissionGiver',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'controller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ControllerPermissionRevoked',
        inputs: [
            {
                name: 'permissionGiver',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'controller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'DefaultControllerLimitsUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'quota',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            },
            {
                name: 'maxRewardAmount',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
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
        name: 'RewardTokenUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newRewardToken',
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
            { name: 'to', type: 'address', indexed: true, internalType: 'address' },
            {
                name: 'amount',
                type: 'uint256',
                indexed: true,
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
                name: 'tokenAddress',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'result',
                type: 'tuple[]',
                indexed: true,
                internalType: 'struct Result[]',
                components: [
                    { name: 'success', type: 'bool', internalType: 'bool' },
                    { name: 'returnData', type: 'bytes', internalType: 'bytes' }
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
        name: 'TokenWithdrawn',
        inputs: [
            {
                name: 'caller',
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
                name: 'amount',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
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
        name: 'VaultOwnerUpdated',
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
    { type: 'error', name: 'CanNotBeZeroAddress', inputs: [] },
    {
        type: 'error',
        name: 'ERC1967InvalidImplementation',
        inputs: [{ name: 'implementation', type: 'address', internalType: 'address' }]
    },
    { type: 'error', name: 'ERC1967NonPayable', inputs: [] },
    { type: 'error', name: 'FailedInnerCall', inputs: [] },
    { type: 'error', name: 'InsufficientRewardAllowance', inputs: [] },
    { type: 'error', name: 'InsufficientRewardQuota', inputs: [] },
    { type: 'error', name: 'InvalidInitialization', inputs: [] },
    { type: 'error', name: 'NoReceiversFound', inputs: [] },
    { type: 'error', name: 'NotInitializing', inputs: [] },
    { type: 'error', name: 'NotVaultOwner', inputs: [] },
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
