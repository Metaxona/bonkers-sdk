import { describe, expect, it } from 'vitest'
import { LogLevel, Logger } from '../../src/utils'
import { JSONReplacer, logStringBuilder } from '../common/utils'

describe('Logger Test', () => {
    it('Initialize', async () => {
        expect(new Logger().level).to.eq(LogLevel.INFO)
    })

    it('Output Processor', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('log')
            expect(output.includes('Hello')).to.be.true
        })

        log.log(string)
    })

    it('Log String Builder', async () => {
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

        const string = 'Hello'

        expect(logStringBuilder('log', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.log}[LOG] ${ansiCodes.reset} - ${string}`
        )
        expect(logStringBuilder('debug', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.debug}[DEBUG] ${ansiCodes.reset} - ${string}`
        )
        expect(logStringBuilder('info', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.info}[INFO] ${ansiCodes.reset} - ${string}`
        )
        expect(logStringBuilder('trace', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.trace}[TRACE] ${ansiCodes.reset} - ${string}`
        )
        expect(logStringBuilder('warn', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.warn}[WARN] ${ansiCodes.reset} - ${string}`
        )
        expect(logStringBuilder('error', [string]).join(' ')).to.eq(
            `${ansiCodes.purple}[${new Date().toUTCString()}] ${color.error}[ERROR] ${ansiCodes.reset} - ${string}`
        )
    })

    it('JSON Replacer', async () => {
        expect(
            JSON.stringify(
                {
                    map: new Map([
                        [1, 2],
                        [3, 4]
                    ])
                },
                JSONReplacer
            )
        ).to.be.eq(
            JSON.stringify({
                map: [
                    [1, 2],
                    [3, 4]
                ]
            })
        )
    })

    it('Error Levels', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(['log', 'info', 'debug', 'warn', 'error', 'trace'].includes(logType))
            expect(output.includes('Hello')).to.be.true
        })

        log.debug(string)
        log.info(string)
        log.log(string)
        log.warn(string)
        log.error(string)
        log.trace(string)

        const log2 = new Logger(LogLevel.NONE, (logType, output) => {
            expect(['log', 'info', 'debug', 'warn', 'error', 'trace'].includes(logType))
            expect(output.includes('Hello')).to.be.true
        })

        log2.debug(string)
        log2.info(string)
        log2.log(string)
        log2.warn(string)
        log2.error(string)
        log2.trace(string)
    })

    it('Log', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('log')
            expect(output.includes('Hello')).to.be.true
        })

        log.log(string)
    })

    it('Info', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('info')
            expect(output.includes('Hello')).to.be.true
        })

        log.info(string)
    })

    it('Debug', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('debug')
            expect(output.includes('Hello')).to.be.true
        })

        log.debug(string)
    })

    it('Warn', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('warn')
            expect(output.includes('Hello')).to.be.true
        })

        log.warn(string)
    })

    it('Error', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('error')
            expect(output.includes('Hello')).to.be.true
        })

        log.error(string)
    })

    it('Trace', async () => {
        const string = 'Hello'
        const log = new Logger(LogLevel.DEBUG, (logType, output) => {
            expect(logType).to.be.eq('trace')
            expect(output.includes('Hello')).to.be.true
        })

        log.trace(string)
    })
})
