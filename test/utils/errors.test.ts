import { describe, expect, it } from 'vitest'
import {
    BaseError,
    ClientNotFound,
    ContractAbiNotFound,
    ContractInteractionFailed,
    InvalidChainId,
    InvalidClientType,
    InvalidContract,
    InvalidContractType,
    InvalidContractVersion,
    InvalidSDKMode,
    MissingRequiredParams,
    UnknownError
} from '../../src/utils'

describe('Errors Test', () => {
    it('BaseError', async () => {
        expect(() => {
            throw new BaseError()
        }).to.throw()
    })

    it('UnknownError', async () => {
        expect(() => {
            throw new UnknownError()
        }).to.throw()
    })

    it('ContractInteractionFailed', async () => {
        expect(() => {
            throw new ContractInteractionFailed()
        }).to.throw()
    })

    it('ContractAbiNotFound', async () => {
        expect(() => {
            throw new ContractAbiNotFound()
        }).to.throw()
    })

    it('ClientNotFound', async () => {
        expect(() => {
            throw new ClientNotFound()
        }).to.throw()
    })

    it('MissingRequiredParams', async () => {
        expect(() => {
            throw new MissingRequiredParams()
        }).to.throw()
    })

    it('InvalidSDKMode', async () => {
        expect(() => {
            throw new InvalidSDKMode()
        }).to.throw()
    })

    it('InvalidContract', async () => {
        expect(() => {
            throw new InvalidContract()
        }).to.throw()
    })

    it('InvalidContractVersion', async () => {
        expect(() => {
            throw new InvalidContractVersion()
        }).to.throw()
    })

    it('InvalidContractType', async () => {
        expect(() => {
            throw new InvalidContractType()
        }).to.throw()
    })

    it('InvalidChainId', async () => {
        expect(() => {
            throw new InvalidChainId()
        }).to.throw()
    })

    it('InvalidClientType', async () => {
        expect(() => {
            throw new InvalidClientType()
        }).to.throw()
    })
})
