
import { Socket } from "socket.io";
import { AuthClientToServerEvents, AuthResponseCode, AuthServerToClientEvents } from "./packets/session";
import { get_user, get_user_by_name, User, UserID, UserType } from "./users";
import { v4 as uuidv4 } from "uuid";
import { add_rtc_handlers } from "./rtc";
import { get_client_ip_info, IpInfoDebug } from "./ip";
import assert from "node:assert";

export type SessionID = string;

type Session = {
    session_id: SessionID;
    user_id: UserID;
    ip_info: IpInfoDebug
}

class SessionManager {
    id_map: Map<SessionID, Session>;
    user_to_session_id: Map<UserID, SessionID>;

    constructor() {
        this.id_map = new Map();
        this.user_to_session_id = new Map();
    }

    handle_user_connect(user_id: UserID, ip_info: IpInfoDebug): Session | undefined {
        if (user_id == null) {
            return undefined
        }

        const current_id = this.user_to_session_id.get(user_id);
        if (current_id != undefined) {
            this.revoke_session(current_id);
            this.user_to_session_id.delete(user_id);
        }

        let id;
        do {
            id = uuidv4();
        } while(this.id_map.has(id));

        let session: Session = {
            session_id: id,
            user_id,
            ip_info
        };

        const user = get_user(user_id);
        console.log(`User ${user?.get_name()} is logged in on ip ${ip_info}.`)

        this.user_to_session_id.set(user_id, id);
        this.id_map.set(id, session)

        return session
    }

    revoke_session(session_id: SessionID): boolean {
        const session = this.id_map.get(session_id);
        if (session != undefined) {
            const user = get_user(session.user_id);
            console.log(`Revoking session for user ${user?.get_name()}`)
        }

        return this.id_map.delete(session_id)
    }

    revoke_session_for_user(user_id: UserID): boolean {
        const session = this.user_to_session_id.get(user_id);
        if (session == undefined) {
            return false;
        }

        this.revoke_session(session);

        return true;
    }

    get_session(session_id: SessionID): Session | undefined {
        return this.id_map.get(session_id)
    }

    get_session_for_user(user_id: UserID): Session | undefined {
        const session = this.user_to_session_id.get(user_id);
        if (session == undefined) {
            return undefined;
        }

        return this.id_map.get(session)
    }

    validate_session(session_id: SessionID): boolean {
        if (session_id == null) {
            return false;
        }

        const session = this.id_map.get(session_id);
        return session != undefined
    }
};

const SESSION_MANAGER = new SessionManager();

export const validate_session = (session_id: SessionID) => SESSION_MANAGER.validate_session(session_id)
export function validate_session_admin(session_id: SessionID): boolean {
    const session = SESSION_MANAGER.get_session(session_id);
    if (session == undefined) {
        return false;
    }

    const user = get_user(session.user_id);
    if (user == undefined) {
        return false;
    }

    return user.get_type() == UserType.Admin;
}

export const revoke_session = (session_id: SessionID) => SESSION_MANAGER.revoke_session(session_id)
export const revoke_session_for_user = (user_id: UserID) => SESSION_MANAGER.revoke_session_for_user(user_id)
export const get_session_for_user = (user_id: UserID) => SESSION_MANAGER.get_session_for_user(user_id)

export function add_authentication_handlers (socket: Socket<AuthClientToServerEvents, AuthServerToClientEvents>) {
    socket.on('authenticate', data => {
        const ip_info = get_client_ip_info(socket);

        if (data.username == null || data.password == null) {
            socket.emit("onAuthenticate", { 
                code: AuthResponseCode.BadRequest,
                session: null, 
            });

            return;
        }
        
        let user: User | undefined = get_user_by_name(data.username);
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

        let session = SESSION_MANAGER.handle_user_connect(user.get_id(), ip_info);
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

        add_rtc_handlers(socket);
    })

    socket.on('bindSession', data => {
        const ip_info = get_client_ip_info(socket);

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

        const session = SESSION_MANAGER.get_session(data.session);
        assert(session != undefined);
        const user = get_user(session.user_id);
        if (user == undefined) {
            console.log("WARNING : session is bound to undefined user. Revoking immediately.");
            revoke_session(data.session);

            socket.emit("onSession", { 
                success: false
            });

            return;
        }
        console.log(`Session ${data.session} has been rebound for user ${user.get_name()} with ip ${ip_info}`)

        socket.emit("onSession", { 
            success: true
        });

        add_rtc_handlers(socket);
    })
}


