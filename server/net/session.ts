
import { Socket } from "socket.io";
import { AuthClientToServerEvents, AuthResponseCode, AuthServerToClientEvents } from "./packets/session";
import { get_user, User, UserID, Username } from "./users";
import { v4 as uuidv4 } from "uuid";
import { randomString } from "./utils";

const SECRET_LEN: number = 40;
export type Secret = string;
export type SessionID = string;

type Session = {
    id: SessionID;
    secret: Secret;
}

class SessionManager {
    private user_to_session_id: Map<UserID, SessionID>;
    private secret_map: Map<SessionID, Secret>;

    constructor() {
        this.secret_map = new Map();
        this.user_to_session_id = new Map();
    }

    handle_user_connect(user_id: UserID): Session | undefined {
        if (user_id == null) {
            return undefined
        }

        let id = this.user_to_session_id.get(user_id)
        if (id == undefined) {
            id = uuidv4();
            this.user_to_session_id.set(user_id, id);
        }
        const secret = randomString(SECRET_LEN);
        this.secret_map.set(id, secret);

        return {
            id: id,
            secret: secret
        }
    }

    validate_session(session_id: SessionID, secret: Secret): boolean {
        if (session_id == null || secret == null) {
            return false;
        }

        return this.secret_map.get(session_id) == secret;
    }
};

const SESSION_MANAGER = new SessionManager();

export function add_authentication_handlers (socket: Socket<AuthClientToServerEvents, AuthServerToClientEvents>) {
    socket.on('authenticate', data => {
        if (data.username == null || data.password == null) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
                secret: null
            });

            return;
        }
        
        let user: User | undefined = get_user(data.username);
        if (user == undefined) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadCredentials,
                session: null, 
                secret: null
            });

            return;
        }

        if (!user.validate_password(data.password)) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadCredentials,
                session: null, 
                secret: null
            });

            return;
        }

        let session = SESSION_MANAGER.handle_user_connect(user.get_id());
        if (session == undefined) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
                secret: null
            });

            return;
        }

        socket.emit("onAuthenticate", { 
            code: AuthResponseCode.OK,
            session: session.id, 
            secret: session.secret
        });
    })

    socket.on('bindSession', data => {
        if (data.secret == null || data.session == null) {
            socket.emit("onSession", {
                success: false
            });

            return;
        }

        if (!SESSION_MANAGER.validate_session(data.session, data.secret)) {
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
