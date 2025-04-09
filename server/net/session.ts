
import { Socket } from "socket.io";

interface SocketSession {
    user: string;

    // Session properties (such as session uuid or secret)
    uuid   : string;
    secret : string;
};

function createBaseSession (username: string) {
    // TODO create a base session from a username
}

class SessionManager {
    registerSession (socket: Socket, session: SocketSession): boolean {
        // TODO
        return false;
    }
    getSession (uuid: string): SocketSession | null {
        // TODO
        return null;
    }
};

const SESSION_MANAGER = new SessionManager();

function add_authentication_handlers (socket: Socket) {

}
