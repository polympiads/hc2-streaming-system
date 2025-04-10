
import { Socket } from "socket.io";
import { AuthClientToServerEvents, AuthResponseCode, AuthServerToClientEvents } from "./packets/session";
import { get_user, User, UserID } from "./users";
import { v4 as uuidv4 } from "uuid";
import { randomString } from "./utils";

const SESSION_LEN: number = 40;
export type SessionID = string;

type Session = {
    id: SessionID;
}

class SessionManager {
    private user_to_session_id: Map<UserID, SessionID>;

    constructor() {
        this.user_to_session_id = new Map();
    }

    handle_user_connect(user_id: UserID): Session | undefined {
        if (user_id == null) {
            return undefined
        }

        if (this.user_to_session_id.has(user_id)) {
            this.user_to_session_id.delete(user_id);
        }

        const id_set = new Set(this.user_to_session_id.values());
        let id;
        do {
            id = uuidv4();
        } while(id_set.has(id));
        this.user_to_session_id.set(user_id, id);

        return {
            id: id,
        }
    }

    validate_session(session_id: SessionID): boolean {
        if (session_id == null) {
            return false;
        }

        const id_set = new Set(this.user_to_session_id.values());
        return id_set.has(session_id);
    }
};

const SESSION_MANAGER = new SessionManager();

export function add_authentication_handlers (socket: Socket<AuthClientToServerEvents, AuthServerToClientEvents>) {
    socket.on('authenticate', data => {
        if (data.username == null || data.password == null) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
            });

            return;
        }
        
        let user: User | undefined = get_user(data.username);
        if (user == undefined) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadCredentials,
                session: null, 
            });

            return;
        }

        if (!user.validate_password(data.password)) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadCredentials,
                session: null, 
            });

            return;
        }

        let session = SESSION_MANAGER.handle_user_connect(user.get_id());
        if (session == undefined) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
            });

            return;
        }

        socket.emit("onAuthenticate", { 
            code: AuthResponseCode.OK,
            session: session.id, 
        });
    })

    socket.on('bindSession', data => {
        if (data.session == null) {
            socket.emit("onSession", {
                success: false
            });

            return;
        }

        if (!SESSION_MANAGER.validate_session(data.session)) {
            socket.emit("onSession", { 
                success: false
            });

            return;
        }

        socket.emit("onSession", { 
            success: true
        });
    })
}
