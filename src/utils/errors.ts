export enum SDKErrorNames {
    UnknownError = 'UnknownError',
    ContractInteractionFailed = 'ContractInteractionFailed',
    ContractAbiNotFound = 'ContractAbiNotFound',
    ClientNotFound = 'ClientNotFound',
    MissingConfigRequirement = 'MissingConfigRequirement',
    MissingRequiredParams = 'MissingRequiredParams',
    InvalidSDKMode = 'InvalidSDKMode',
    InvalidContract = 'InvalidContract',
    InvalidContractVersion = 'InvalidContractVersion',
    InvalidContractType = 'InvalidContractType',
    InvalidChainId = 'InvalidChainId',
    InvalidClientType = 'InvalidClientType'
}

/** @category Errors */
export type ErrorOptions = { verbose?: boolean; wevm?: string }

/** @category Errors */
export class BaseError extends Error {
    /** Error thrown by wagmi or viem interactions */
    wevm: any

    constructor(message?: string, name?: string, options?: ErrorOptions) {
        super(message)
        this.name = name || this.constructor.name
        this.wevm = options?.wevm || ''

        if (!options?.verbose) {
            this.stack = 'Non Verbose Mode'
        }
    }
}

// COMMON

/** @category Errors */
export class UnknownError extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.UnknownError, options)
    }
}

/** @category Errors */
export class ContractInteractionFailed extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.ContractInteractionFailed, options)
    }
}

/** @category Errors */
export class ContractAbiNotFound extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.ContractAbiNotFound, options)
    }
}

/** @category Errors */
export class InvalidSDKMode extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidSDKMode, options)
    }
}

/** @category Errors */
export class InvalidChainId extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidChainId, options)
    }
}

/** @category Errors */
export class InvalidContract extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidContract, options)
    }
}

/** @category Errors */
export class InvalidContractVersion extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidContractVersion, options)
    }
}

/** @category Errors */
export class InvalidContractType extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidContractType, options)
    }
}

/** @category Errors */
export class MissingRequiredParams extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.MissingRequiredParams, options)
    }
}

/** @category Errors */
export class InvalidClientType extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.InvalidClientType, options)
    }
}

/** @category Errors */
export class ClientNotFound extends BaseError {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, SDKErrorNames.ClientNotFound, options)
    }
}
