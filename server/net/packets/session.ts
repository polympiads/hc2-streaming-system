
export interface AuthRequest {
    username: string;
    password: string;
};

export interface AuthResponse {
    session : string | null;
    secret  : string | null;
};

export interface SessionRequest {
    session : string;
};
export interface SessionResponse {
    success : boolean;
};

export interface ChallengeRequest {
    suffix : string;
};
export interface ChallengeResponse {
    hash : string;
};

export interface AuthClientToServerEvents {
    authenticate : (request: AuthRequest) => void;
    bindSession  : (request: SessionRequest) => void;
    onChallenge  : (response: ChallengeResponse) => void;
};

export interface AuthServerToClientEvents {
    onAuthenticate : (response: AuthResponse) => void;
    onSession      : (response: SessionResponse) => void;
    challenge      : (request: ChallengeRequest) => void;
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
