import { Secret, SessionID } from "../session";

export interface AuthRequest {
    username: string;
    password: string;
};

export interface AuthResponse {
    code: AuthResponseCode;
    session : SessionID | null;
    secret  : Secret | null;
};

export enum AuthResponseCode {
    OK,
    BadCredentials,
    BadRequest
}

export interface SessionRequest {
    session : SessionID;

    // TODO : wtf is this
    secret: Secret;
};
export interface SessionResponse {
    success : boolean;
};

export interface AuthClientToServerEvents {
    authenticate : (request: AuthRequest) => void;
    bindSession  : (request: SessionRequest) => void;
};

export interface AuthServerToClientEvents {
    onAuthenticate : (response: AuthResponse) => void;
    onSession      : (response: SessionResponse) => void;
};

/**
 * Authentication
 * 
 * Username / Password
 *  - authenticate (cts)
 *  - onAuthenticate (stc)
 * 
 * Session UUID (reconnect)
 *  - bindSession (cts)
 *  - challenge (stc)
 *  - onChallenge (cts)
 *  - onSession (stc)
 * 
 * Challenge should take SHA256 of (session UUID + secret + suffix).
 */
