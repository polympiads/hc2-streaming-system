import crypto from "crypto"
import forwarded_parse from 'forwarded-parse'
import { IncomingHttpHeaders } from "http"

export function sha256(input: string): string {
    return crypto.createHash('sha256').update(input).digest("hex")
}

export function randomString(size: number): string {
    return crypto.randomBytes(size).toString("hex")
}
