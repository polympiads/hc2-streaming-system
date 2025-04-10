
import { Socket } from "socket.io";
import { AuthClientToServerEvents, AuthResponseCode, AuthServerToClientEvents } from "./packets/session";
import { get_user, User, UserID } from "./users";
import { v4 as uuidv4 } from "uuid";

export type SessionID = string;

type Session = {
    session_id: SessionID;
    user_id: UserID;
    client_ip_address: string;
}

class SessionManager {
    private id_map: Map<SessionID, Session>;
    private user_to_session_id: Map<UserID, SessionID>;

    constructor() {
        this.id_map = new Map();
        this.user_to_session_id = new Map();
    }

    handle_user_connect(user_id: UserID, ip_address: string): Session | undefined {
        if (user_id == null) {
            return undefined
        }

        const current_id = this.user_to_session_id.get(user_id);
        if (current_id != undefined) {
            this.id_map.delete(current_id);
            this.user_to_session_id.delete(user_id);
        }

        let id;
        do {
            id = uuidv4();
        } while(this.id_map.has(id));

        let session: Session = {
            session_id: id,
            user_id,
            client_ip_address: ip_address
        };

        this.user_to_session_id.set(user_id, id);
        this.id_map.set(id, session)

        return session
    }

    validate_session(session_id: SessionID, ip_address: string): boolean {
        if (session_id == null) {
            return false;
        }

        const session = this.id_map.get(session_id);
        if (session == undefined) {
            return false;
        }

        return session.client_ip_address == ip_address;
    }
};

const SESSION_MANAGER = new SessionManager();

export function add_authentication_handlers (socket: Socket<AuthClientToServerEvents, AuthServerToClientEvents>) {
    let client_ip = socket.handshake.address;
    
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

        let session = SESSION_MANAGER.handle_user_connect(user.get_id(), client_ip);
        if (session == undefined) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
            });

            return;
        }

        socket.emit("onAuthenticate", { 
            code: AuthResponseCode.OK,
            session: session.session_id, 
        });
    })

    socket.on('bindSession', data => {
        if (data.session == null) {
            socket.emit("onSession", {
                success: false
            });

            return;
        }

        if (!SESSION_MANAGER.validate_session(data.session, client_ip)) {
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
