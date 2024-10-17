/**
 * A Helper function to encode a string to a base64 string
 *
 * @category Utils
 *
 * @param str string to encode
 * @param urlSafe whether to convert it to a url safe base64 string or not
 * @returns
 */
export function base64Encode(str: string, urlSafe = false) {
    if ([null, undefined, ''].includes(str))
        throw new Error('Input Can Not Be an Empty String, Null, or Undefined')
    const encoder = new TextEncoder()
    const encoded = encoder.encode(String(str))
    const base64String = btoa(
        String.fromCharCode.apply(null, new Uint8Array(encoded) as unknown as number[])
    )
    if (urlSafe) {
        return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }
    return base64String
}

/**
 * A Helper function to encode a string to a base64 string
 *
 * @category Utils
 *
 * @param base64String a base64 encoded string
 * @returns
 */
export function base64Decode(base64String: string) {
    if ([null, undefined, ''].includes(base64String))
        throw new Error('Input Can Not Be an Empty String, Null, or Undefined')
    const uint8Array = new Uint8Array(
        atob(String(base64String).replace(/\-/g, '+').replace(/_/g, '/').replace(/=/g, ''))
            .split('')
            .map((char) => char.charCodeAt(0))
    )
    return new TextDecoder().decode(uint8Array)
}
