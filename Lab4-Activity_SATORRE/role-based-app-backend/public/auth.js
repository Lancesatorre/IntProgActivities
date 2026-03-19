(function (window) {
    const TOKEN_KEY = 'authToken';
    const USER_KEY = 'authUser';

    function parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (err) {
            return null;
        }
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getStoredUser() {
        const raw = sessionStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function setStoredUser(user) {
        if (user) {
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
            sessionStorage.removeItem(USER_KEY);
        }
    }

    function setSession(token, user) {
        if (token) {
            sessionStorage.setItem(TOKEN_KEY, token);
        } else {
            sessionStorage.removeItem(TOKEN_KEY);
        }
        setStoredUser(user);
    }

    function clearSession() {
        setSession(null, null);
    }

    function getAuthHeader() {
        const token = getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    window.Auth = {
        parseJwt,
        getToken,
        getStoredUser,
        setStoredUser,
        setSession,
        clearSession,
        getAuthHeader
    };
})(window);
