# bonkers-sdk

## 0.2.0

### Minor Changes

- Deprecated

  - useNew(Controller|Vault|VaultFactory), use `useNewContract` instead

  Added

  - Signatures
    - (Message | Typed Data) Signing
    - (Message | Typed Data) verification
    - (Message | Typed Data) Signer Recovery
  - Signatures Tests
  - Signatures Documentation and Examples
  - Base64 encoding and decoding utils
  - useNewContract function to replace useNew(Controller|Vault|VaultFactory)

  Updated

  - Logger visibility from internal/protected to readonly
  - censor utility function tests
  - controller|vault|vaultFactory tests

## 0.1.0

### Minor Changes

- #### Deprecated

  - chainId on chain output

  #### Added

  - Reconnect
  - Native Token Balance Checker
  - Balance to check native balance of [controller, vault, vault factory]
  - Chains which returns an array of chains being used
  - getContractVersion and getContractType at the SDK class level
  - reader and writer in sdk class level
  - Erc20 Class for easier erc20 token interactions
  - erc20Abi and erc20Abi_bytes32 from viem
  - Optional transport param for getParameters and getImplementation
  - New function getTransportFromConfig used in getParameters allowing it to use the same transport the sdk is using instead of relying on the default transport resulting in errors when being rate limited
  - Zero Address check on useNew[ContractType] function to prevent zero address from being used
  - getAddress for converting evm address to their checksum counterpart
  - getAddress on addresses on contract functions to make sure they are using checksum addresses

  #### Updated

  - chain output
  - useNew[ContractType] now return `this` allowing it to be chained after being used
  - reader and writer visibility from protected to public allowing access to them which grants more extensive functionality to the sdk
  - Some types
  - Docs
  - Contract version type from string to ContractVersion
  - Release github action to delete dev dependencies using npm pkg delete to exclude it on the released package
  - transport type on server config
  - Tests for the updated getParameters
  - Tests for the updated functions using getAddress
  - rewardPool output from number and formatted by the tokens decimal to unformatted bigint to reduce the amount of request being sent each time rewardPool is called
  - vulnerable packages by running `npm audit fix` and `pnpm audit --fix`

  #### Removed

  - anything related to tsup

## 0.0.6

### Patch Changes

- Fixed mode aware chain bug on clients

## 0.0.5

### Patch Changes

- Migrated Build from TSUP to TSC

  Reason being, tsc does not bundle external dependencies causing exports to not be included resulting in missing imports specially the viem chains exports which allows sdk users to import chains from viem without needing to install it separately from the sdk

## 0.0.4

### Patch Changes

- v0.0.4 release is the same as the unpublished 0.0.2 which was unpublished by mistake

## 0.0.3

### Patch Changes

- Package Unpublished v0.0.1, v0.0.2, v0.0.3

## 0.0.2

### Patch Changes

- Excluded Source Files from the npm package

## 0.0.1

### Patch Changes

- Initial Release
