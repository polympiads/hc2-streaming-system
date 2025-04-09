
class AuthManager {
    getSecret () {
        return getCookie("x-secret");
    }
    getSession () {
        return getCookie("x-session");
    }
    clearSession () {
        clearCookie("x-secret");
        clearCookie("x-session");
    }

    authenticate (username, password) {
        this.socket.emit("authenticate", { "username": username, "password": password })
    }

    onAuthenticate (payload) {
        if (payload.session === null
         || payload.secret  === null
        ) {
            this.clearSession();
            throw "Authentication failed";
        }

        setCookie("x-secret",  payload.secret);
        setCookie("x-session", payload.session);
    }
    onSession (payload) {
        if (payload.success) return ;

        this.clearSession();
        throw "Authentication failed";
    }
    challenge (challenge) {
        const session = this.getSession();
        const secret  = this.getSecret();
        if (session === null || session === undefined) throw "Missing session.";
        if (secret  === null || secret  === undefined) throw "Missing secret.";

        const crypto = new SubtleCrypto();
        const target = crypto.digest("SHA256", session + secret + challenge.suffix);

        this.socket.emit("onChallenge", { "hash": target });
    }
    tryBind () {
        const session = this.getSession();
        const secret  = this.getSecret();
        if (session === null || session === undefined) return ;
        if (secret  === null || secret  === undefined) return ;

        this.socket.emit("bindSession", { "session": session });
    }

    bindSocket (socket) {
        this.socket = socket;
        this.tryBind();

        socket.on("onAuthenticate", payload => this.onAuthenticate(payload))
        socket.on("onSession", session => this.onSession(session))
        socket.on("challenge", request => this.challenge(request))
    }
}

const AUTH_MANAGER = new AuthManager();

const authBindSocket = (socket) => AUTH_MANAGER.bindSocket(socket);
const authenticate   = (username, password) => AUTH_MANAGER.authenticate(username, password);
