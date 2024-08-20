import { LoggerDataType, LogType } from '../../../src/utils'

export function logStringBuilder(type: LogType, data: LoggerDataType[]): any[] {
    const ansiCodes: { [key: string]: string } = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        blue: '\x1b[34m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        purple: '\x1b[35m'
    }

    const color: { [key: string]: string } = {
        log: ansiCodes.cyan,
        info: ansiCodes.green,
        debug: ansiCodes.blue,
        warn: ansiCodes.yellow,
        error: ansiCodes.red,
        trace: ansiCodes.yellow
    }

    const base = `${ansiCodes.purple}[${new Date().toUTCString()}] ${color[type]}[${type.toUpperCase()}] ${ansiCodes.reset} -`

    return [base, ...data]
}

export function cleanupOutputBase(outputBase: string) {
    const ansiCodes: { [key: string]: string } = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        blue: '\x1b[34m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        purple: '\x1b[35m'
    }

    Object.values(ansiCodes).forEach((code) => {
        outputBase = outputBase.replace(code, '')
    })

    return outputBase
}

export function JSONReplacer(_: any, value: any) {
    function isCircular(object: object) {
        try {
            JSON.stringify(object)
        } catch (error) {
            return true
        }
        return false
    }

    if (isCircular(value)) return '[Circular]'
    if (typeof value === 'function' || typeof value === 'bigint') return value.toString()
    if (Array.isArray(value) || value instanceof Map || value instanceof Set)
        return Array.from(value)
    return value
}
