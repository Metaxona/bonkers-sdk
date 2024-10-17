import { signMessage, signTypedData } from '@wagmi/core'
import {
    type Account,
    type Address,
    getAddress,
    hashMessage,
    hashTypedData,
    type Hex,
    recoverMessageAddress,
    recoverTypedDataAddress,
    type SignableMessage,
    verifyMessage,
    verifyTypedData
} from 'viem'
import type { ClientType, Config, ISignature, Mode, TypedDataParams } from '../types/index.js'
import {
    ClientNotFound,
    type Logger,
    MissingRequiredParams,
    prepareConfig
} from '../utils/index.js'
import type { Clients } from './clients.js'

const CLASS_NAME = 'Signature'

/**
 *
 * @category Signature
 */
export default class Signature implements ISignature {
    readonly mode: Mode
    readonly config: Config

    /** @group Internal */
    protected logger: Logger

    /** @group Private */
    private clients: Clients

    message: SignableMessage | undefined
    typedData: TypedDataParams | undefined

    constructor(config: Config, clients: Clients) {
        this.config = prepareConfig(config)
        this.mode = this.config.mode
        this.logger = this.config.logger as Logger

        this.clients = clients

        this.logger.info({
            mode: this.mode,
            from: CLASS_NAME,
            status: 'Initialized'
        })
    }

    // TODO: Input Validation?
    setMessage(message: SignableMessage) {
        this.message = message
        return this
    }

    // TODO: Input Validation?
    setTypedData(param: TypedDataParams) {
        this.typedData = param
        return this
    }

    async signMessage() {
        try {
            this._requiredParamsPresent('message')
            this.checkClients()

            if (this.clients.clientsExist('wagmi') && this.onClient()) {
                return await signMessage(this.clients.wagmi, {
                    message: this.message as SignableMessage
                })
            }

            return await this.clients.walletClient.signMessage({
                message: this.message as SignableMessage,
                account: this.clients.walletClient.account as Account
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: signMessage`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: signMessage`, error.stack)
            throw error
        }
    }

    async signTypedData() {
        try {
            this._requiredParamsPresent('typedData')
            this.checkClients()

            if (this.clients.clientsExist('wagmi') && this.onClient()) {
                return await signTypedData(this.clients.wagmi, {
                    account: this.clients.account(this.config),
                    ...(this.typedData as TypedDataParams)
                })
            }

            return await this.clients.walletClient.signTypedData({
                ...(this.typedData as TypedDataParams),
                account: this.clients.walletClient.account as Account
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: signTypedData`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: signTypedData`, error.stack)
            throw error
        }
    }

    async verifyMessage(signature: Hex, signer?: Address) {
        try {
            this._requiredParamsPresent('message')

            return verifyMessage({
                address: signer
                    ? getAddress(signer)
                    : (this.clients.account(this.config) as Address),
                message: this.message as SignableMessage,
                signature: signature
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: verifyMessage`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: verifyMessage`, error.stack)
            throw error
        }
    }

    async verifyTypedData(signature: Hex, signer?: Address) {
        try {
            this._requiredParamsPresent('typedData')

            return verifyTypedData({
                ...(this?.typedData as TypedDataParams),
                signature: signature,
                address: signer
                    ? getAddress(signer)
                    : (this.clients.account(this.config) as Address)
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: verifyTypedData`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: verifyTypedData`, error.stack)
            throw error
        }
    }

    async recoverMessageAddress(signature: Hex) {
        try {
            this._requiredParamsPresent('message')

            return recoverMessageAddress({ message: this.message as SignableMessage, signature })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: recoverMessageAddress`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: recoverMessageAddress`, error.stack)
            throw error
        }
    }

    async recoverTypedDataAddress(signature: Hex) {
        try {
            this._requiredParamsPresent('typedData')

            return recoverTypedDataAddress({
                ...(this.typedData as TypedDataParams),
                signature: signature
            })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: recoverTypedDataAddress`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: recoverTypedDataAddress`, error.stack)
            throw error
        }
    }

    hashMessage() {
        try {
            this._requiredParamsPresent('message')

            return hashMessage(this.message as SignableMessage, 'hex')
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: hashMessage`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: hashMessage`, error.stack)
            throw error
        }
    }

    hashTypedData() {
        try {
            this._requiredParamsPresent('typedData')

            return hashTypedData({ ...(this.typedData as TypedDataParams) })
        } catch (error: any) {
            this.logger.error(
                `FROM: ${CLASS_NAME} Function: hashTypedData`,
                error.name,
                error.message
            )
            this.logger.trace(`FROM: ${CLASS_NAME} Function: hashTypedData`, error.stack)
            throw error
        }
    }

    private _requiredParamsPresent(forType: 'message' | 'typedData') {
        if (forType === 'message' && !this.message)
            throw new MissingRequiredParams('Message To Sign or Verify Missing')
        if (forType === 'typedData' && !this.typedData)
            throw new MissingRequiredParams('Typed Data To Sign or Verify Missing')
        return
    }

    private checkClients() {
        if (!this.clients) throw new ClientNotFound()
        if (
            (this.onClient() && !this.clients.clientsExist('wagmi')) ||
            (this.onServer() && !this.clients.clientsExist('viem'))
        )
            throw new ClientNotFound()
    }

    private onClient() {
        return this.config.mode === 'client'
    }

    private onServer() {
        return this.config.mode === 'server'
    }
}
