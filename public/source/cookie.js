
class CookieManager {
    constructor () {
        this.innerProperty = null;
    }

    load () {
        if (this.innerProperty !== null) return ;
        
        this.innerProperty = {};
        const array = document.cookie.split(";");
        for (let el of array) {
            el = el.trim();
            if (el == "") continue ;

            let [key, value] = el.split("=", 2);
            value = JSON.parse(atob(value.replaceAll("%", "=")))
            this.innerProperty[key] = value;
        }
    }

    getCookie (key) {
        this.load();
        return this.innerProperty[key];
    }
    setCookie (key, value) {
        this.load();
        this.innerProperty[key] = value;
        document.cookie = `${key}=${btoa(JSON.stringify(value)).replaceAll("=", "%")};`
    }
};

const COOKIE_MANAGER = new CookieManager();

const setCookie = (key, value) => COOKIE_MANAGER.setCookie(key, value);
const getCookie = (key)        => COOKIE_MANAGER.getCookie(key);

const clearCookie = (key) => {
    browser.cookies.remove(key);
}
