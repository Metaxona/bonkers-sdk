/** @category Logger */
export type LoggerDataType = string | number | object | Error | undefined | null | any
/** @category Logger */
export type LogType = 'log' | 'info' | 'debug' | 'warn' | 'error' | 'trace'
/** @category Logger */
export type LogCallBack = (logType: LogType, output: string) => void
/** @category Logger */
export type AsyncLogCallBack = (logType: LogType, output: string) => Promise<void>

/**
 * Logger Interface to tell which public functions the
 * logger must implement
 *
 * @category Logger
 */
export interface ILogger {
    level: LogLevel
    log(data: LoggerDataType[]): void
    info(data: LoggerDataType[]): void
    debug(data: LoggerDataType[]): void
    warn(data: LoggerDataType[]): void
    error(data: LoggerDataType[]): void
    trace(data: LoggerDataType[]): void
}

/**
 *
 *
 * @category Logger
 */
export enum LogLevel {
    DEBUG = 4,
    INFO = 3,
    WARN = 2,
    ERROR = 1,
    NONE = 0
}

/**
 * A Custom Wrapper for Console
 *
 * Features:
 * - Works like normal console.(log|trace|warn|debug|info|error)
 * - Can filter what will be logged on the console using LogLevel
 * - Global Output Processor using outputProcessor which allows one
 * to filter by type and process what to do with the output like
 * writing it to a file, database and more
 *
 * @category Logger
 */
export class Logger implements ILogger {
    private logger: typeof console
    level: LogLevel
    private outputProcessor: LogCallBack | AsyncLogCallBack

    constructor(level: LogLevel = LogLevel.INFO, outputProcessor?: LogCallBack | AsyncLogCallBack) {
        this.logger = console
        this.level = level

        const cb = (logType: LogType, output: string) => {
            return
        }

        this.outputProcessor = outputProcessor || cb
    }

    log(...data: LoggerDataType[]): void {
        const logType: LogType = 'log'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.INFO)) return
        this.logger.log(...parsed)
    }

    info(...data: LoggerDataType[]): void {
        const logType: LogType = 'info'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.INFO)) return
        this.logger.info(...parsed)
    }

    debug(...data: LoggerDataType[]): void {
        const logType: LogType = 'debug'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.DEBUG)) return
        this.logger.debug(...parsed)
    }

    warn(...data: LoggerDataType[]): void {
        const logType: LogType = 'warn'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.WARN)) return
        this.logger.warn(...parsed)
    }

    error(...data: LoggerDataType[]): void {
        const logType: LogType = 'error'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.ERROR)) return
        this.logger.error(...parsed)
    }

    trace(...data: LoggerDataType[]): void {
        const logType: LogType = 'trace'
        const parsed = logStringBuilder(logType, data)
        this.outputProcessor(logType, cleanupOutputBase(parsed[0]) + ' ' + prepareOutput(data))
        if (this.preventEmit(LogLevel.DEBUG)) return
        this.logger.trace(...parsed)
    }

    private preventEmit(requiredLevel: LogLevel): boolean {
        if (Number(this.level) < Number(requiredLevel)) return true
        return false
    }
}

function logStringBuilder(type: LogType, data: LoggerDataType[]): any[] {
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

function prepareOutput(data: LoggerDataType[]) {
    let finalString = ''

    for (const content of data) {
        finalString += JSON.stringify(content, JSONReplacer)
    }

    return finalString
}

function cleanupOutputBase(outputBase: string) {
    let _outputBase = outputBase

    const ansiCodes: { [key: string]: string } = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        blue: '\x1b[34m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        purple: '\x1b[35m'
    }

    for (const code of Object.values(ansiCodes)) {
        _outputBase = _outputBase.replace(code, '')
    }

    return _outputBase
}

function JSONReplacer(_: any, value: any) {
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

/**
 * A Ready Made Instance of Logger Class using the default setting
 *
 * this can be used as it by importing it and it is being used as the default
 * logger of the sdk
 *
 * @category Logger
 */
export const logger = new Logger()
