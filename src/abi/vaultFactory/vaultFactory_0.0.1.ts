import type { Abi } from 'viem'

/**
 * The Official Vault Factory v0.0.1 Contract ABI
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
        name: 'changeVaultFactoryOwner',
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
            { name: 'projectOwner', type: 'address', internalType: 'address' },
            { name: 'rewardToken', type: 'address', internalType: 'address' },
            { name: 'projectName', type: 'string', internalType: 'string' },
            { name: 'useTokenForPayment', type: 'bool', internalType: 'bool' }
        ],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'payable'
    },
    {
        type: 'function',
        name: 'creationFee',
        inputs: [],
        outputs: [
            { name: 'ethFee', type: 'uint256', internalType: 'uint256' },
            { name: 'erc20Fee', type: 'uint256', internalType: 'uint256' }
        ],
        stateMutability: 'pure'
    },
    {
        type: 'function',
        name: 'erc20PaymentToken',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view'
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
        name: 'getImplementationDetails',
        inputs: [],
        outputs: [
            {
                name: 'implementationAddress',
                type: 'address',
                internalType: 'address'
            },
            { name: '', type: 'string', internalType: 'string' },
            { name: '', type: 'string', internalType: 'string' }
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
        inputs: [{ name: 'vaultAddress', type: 'address', internalType: 'address' }],
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
            { name: 'vaultImplementation', type: 'address', internalType: 'address' },
            { name: '_feeReceiver', type: 'address', internalType: 'address' },
            { name: '_creationFee', type: 'uint256', internalType: 'uint256' },
            { name: '_erc20PaymentToken', type: 'address', internalType: 'address' },
            { name: 'erc20CreationFee', type: 'uint256', internalType: 'uint256' }
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
        name: 'setERC20PaymentToken',
        inputs: [
            {
                name: 'newERC20PaymentToken',
                type: 'address',
                internalType: 'address'
            }
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
        name: 'supportsInterface',
        inputs: [{ name: 'interfaceId', type: 'bytes4', internalType: 'bytes4' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'totalVaults',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view'
    },
    {
        type: 'function',
        name: 'updateCreationFee',
        inputs: [
            { name: 'newCreationFee', type: 'uint256', internalType: 'uint256' },
            { name: 'newERC20CreationFee', type: 'uint256', internalType: 'uint256' }
        ],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'updateImplementation',
        inputs: [{ name: 'newImplementation', type: 'address', internalType: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable'
    },
    {
        type: 'function',
        name: 'updateVaultInfo',
        inputs: [{ name: 'vault', type: 'address', internalType: 'address' }],
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
        name: 'CreationFeeUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'oldCreationFee',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256'
            },
            {
                name: 'newCreationFee',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            },
            {
                name: 'oldERC20CreationFee',
                type: 'uint256',
                indexed: false,
                internalType: 'uint256'
            },
            {
                name: 'newERC20CreationFee',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'ERC20PaymentTokenUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'oldToken',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newToken',
                type: 'address',
                indexed: true,
                internalType: 'address'
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
                name: 'oldFeeReceiver',
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
                name: 'createdAt',
                type: 'uint256',
                indexed: true,
                internalType: 'uint256'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'VaultFactoryOwnerUpdated',
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
        name: 'VaultImplementationUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'oldImplementation',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newImplementation',
                type: 'address',
                indexed: true,
                internalType: 'address'
            }
        ],
        anonymous: false
    },
    {
        type: 'event',
        name: 'VaultInfoUpdated',
        inputs: [
            {
                name: 'caller',
                type: 'address',
                indexed: true,
                internalType: 'address'
            },
            {
                name: 'newInfo',
                type: 'tuple',
                indexed: true,
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
    { type: 'error', name: 'InvalidCreationFee', inputs: [] },
    { type: 'error', name: 'InvalidInitialization', inputs: [] },
    { type: 'error', name: 'NotInitializing', inputs: [] },
    { type: 'error', name: 'NotVaultFactoryOwner', inputs: [] },
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
    },
    {
        type: 'error',
        name: 'UnauthorizedAccess',
        inputs: [{ name: 'account', type: 'address', internalType: 'address' }]
    },
    {
        type: 'error',
        name: 'VaultNotDeployedByFactory',
        inputs: [{ name: 'factory', type: 'address', internalType: 'address' }]
    },
    { type: 'error', name: 'VaultNotFound', inputs: [] }
] as Abi
