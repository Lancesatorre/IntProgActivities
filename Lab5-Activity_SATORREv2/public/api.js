(function (window) {
    const API_BASE = '';
    const auth = window.Auth;

    async function request(path, { method = 'GET', headers = {}, body } = {}) {
        const response = await fetch(API_BASE + path, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(auth?.getAuthHeader?.() || {}),
                ...headers
            },
            body
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }
        return data;
    }

    const postJson = (path, payload, method = 'POST') => request(path, { method, body: JSON.stringify(payload) });

    const fetchDepartments = () => request('/api/departments');
    const fetchEmployees = () => request('/api/employees');
    const fetchAccounts = () => request('/api/users');
    const fetchUsers = () => request('/users');
    const fetchRequests = () => request('/api/requests');

    window.ApiClient = {
        request,
        postJson,
        fetchDepartments,
        fetchEmployees,
        fetchAccounts,
        fetchUsers,
        fetchRequests
    };
})(window);
