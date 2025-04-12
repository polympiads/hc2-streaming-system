import { IncomingHttpHeaders } from "http";
import { Socket } from "socket.io"
import forwarded_parse from "forwarded-parse"

export class IpInfoDebug {
    private proxy: string | null;
    private client: string;

    constructor(proxy: string | null, client: string) {
        this.proxy = proxy;
        this.client = client;
    }

    toString() {
        if (this.proxy == null) {
            return this.client
        } else {
            return `${this.proxy} (original : ${this.client})`
        }
    }
}

export function get_client_ip_info(socket: Socket): IpInfoDebug {
    const ip = socket.handshake.address;
    const original_ip = try_extract_from_ip(socket.handshake.headers)
    if (original_ip == undefined) {
        return new IpInfoDebug(null, ip)
    } else {
        return new IpInfoDebug(ip, original_ip)
    }
}

function try_extract_from_ip(headers: IncomingHttpHeaders): string | undefined {
    const forwarded_header = headers["forwarded"];
    if (forwarded_header == undefined) {
        return undefined;
    }
    
    try {
        const forwarded = forwarded_parse(forwarded_header);
        if (forwarded.length == 0) {
            return undefined
        }

        const host = forwarded[0]["for"];
        if (host == undefined) {
            return undefined
        }

        return host
    } catch (err) {
        return undefined
    }
}
