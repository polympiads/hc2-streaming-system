
class AuthManager {
    constructor () {
        this.promises = [];
    }
    wait () {
        let resolve = undefined;
        const prom = new Promise((_resolve, _) => resolve = _resolve);
        this.promises.push(() => resolve())
        return prom
    }
    onSuccess () {
        for (let prom of this.promises)
            prom();
        this.promises = [];
    }
    getSession () {
        return getCookie("x-session");
    }
    getUsername () {
        return getCookie("x-username");
    }
    clearSession () {
        clearCookie("x-session");
        clearCookie("x-username");
    }

    authenticate (username, password) {
        setCookie("x-username", username);

        this.socket.emit("authenticate", { "username": username, "password": password })
    }

    onAuthenticate (payload) {
        if (payload.session === null) {
            this.clearSession();
            throw "Authentication failed";
        }

        setCookie("x-session", payload.session);

        this.onSuccess();
    }
    onSession (payload) {
        console.log(payload)
        if (payload.success) {
            this.onSuccess();
            return ;
        }

        this.clearSession();
        throw "Authentication failed";
    }
    tryBind () {
        const session = this.getSession();
        if (session === null || session === undefined) return ;

        this.socket.emit("bindSession", { "session": session });
    }

    bindSocket (socket) {
        this.socket = socket;
        this.tryBind();

        socket.on("onAuthenticate", payload => this.onAuthenticate(payload))
        socket.on("onSession", session => this.onSession(session))
    }
}

const AUTH_MANAGER = new AuthManager();

const authBindSocket = (socket) => AUTH_MANAGER.bindSocket(socket);
const authenticate   = (username, password) => AUTH_MANAGER.authenticate(username, password);
const authWait       = () => AUTH_MANAGER.wait();
const getUsername    = AUTH_MANAGER.getUsername;
