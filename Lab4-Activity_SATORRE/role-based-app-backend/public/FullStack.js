const routeMap = {
    '#/': 'home-page',
    '#': 'home-page',
    '': 'home-page',
    '#/home': 'home-page',
    '#/login': 'login-page',
    '#/register': 'register-page',
    '#/verify': 'verify-page',
    '#/profile': 'profile-page',
    '#/employees': 'employees-page',
    '#/departments': 'departments-page',
    '#/accounts': 'accounts-page',
    '#/requests': 'requests-page'
};

const api = window.ApiClient;
const auth = window.Auth;
const postJson = (...args) => api.postJson(...args);

if (!api || !auth) {
    throw new Error('ApiClient or Auth not found. Load auth.js and api.js before FullStack.js.');
}

// DOM Elements - will be initialized in DOMContentLoaded
let sections, toastContainer, loggedOutNav, loggedInNav, adminLinks, userDropdownToggle, userDropdownMenu, navUserName, profileNameEl, profileEmailEl, profileRoleEl, editProfileBtn, editProfileContainer, editProfileForm, editProfileFirst, editProfileLast, editProfilePassword, cancelEditProfileBtn, showAddEmployeeBtn, employeeFormContainer, employeeForm, cancelEmployeeBtn, employeesTableBody, employeeViewModal, showAddDepartmentBtn, departmentFormContainer, departmentForm, cancelDepartmentBtn, departmentsTableBody, departmentEditModal, departmentEditForm, showAddAccountBtn, accountFormContainer, accountForm, cancelAccountBtn, accountsTableBody, accountViewModal, showNewRequestBtn, requestModal, closeModalBtn, requestForm, requestsTable, requestsTableBody, requestsEmptyState, itemsContainer, empDeptSelect, navRequestsLabel, navRequestsLink, requestsPageTitle;

let currentUser = null, departments = [], employees = [], accounts = [], requests = [], requestItemsWrapper = null, addRequestItemButton = null, editingRequestId = null, editingAccountId = null, accountFormOriginal = null, editingEmployeeId = null;

function showSection(targetId) {
    sections.forEach(section => {
        section.style.display = section.id === targetId ? 'block' : 'none';
    });
}

function handleHashChange() {
    const hash = window.location.hash || '#/';
    const targetSection = routeMap[hash] || 'home-page';
    showSection(targetSection);
}

function showToast(message, variant = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${variant}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 2800);
}

function renderEmployees() {
    if (!employeesTableBody) return;
    employeesTableBody.innerHTML = employees.map(emp => `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${emp.id}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${emp.first} ${emp.last}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${emp.position}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${emp.dept}</td><td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap;"><button class="edit-emp-btn" data-emp-id="${emp.id}" style="padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; background: #5a67d8; color: white;">Edit</button><button class="delete-emp-btn" data-emp-id="${emp.id}" style="padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; background: #A30000; color: white; margin-left: 6px;">Delete</button></td></tr>`).join('');
}

function renderDepartments() {
    if (!departmentsTableBody) return;
    departmentsTableBody.innerHTML = departments.map(dept => `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${dept.name}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${dept.description}</td><td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap;"><button class="edit-dept-btn" data-dept-name="${dept.name}" style="padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; background: #5a67d8; color: white;">Edit</button><button class="delete-dept-btn" data-dept-name="${dept.name}" style="padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; background: #A30000; color: white; margin-left: 6px;">Delete</button></td></tr>`).join('');
}

function renderAccounts() {
    if (!accountsTableBody) return;
    accountsTableBody.innerHTML = accounts.map(account => `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${account.first} ${account.last}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${account.email}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${account.role}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${account.verified ? 'Yes' : 'No'}</td><td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; white-space: nowrap;"><button class="edit-acc-btn" data-acc-id="${account.id}" style="padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; background: #5a67d8; color: white;">Edit</button><button class="delete-acc-btn" data-acc-id="${account.id}" style="padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; background: #A30000; color: white; margin-left: 6px;">Delete</button></td></tr>`).join('');
}

function renderRequests() {
    if (!requestsTableBody || !requestsTable || !requestsEmptyState) return;
    if (!requests.length) {
        requestsEmptyState.style.display = 'block';
        requestsTable.style.display = 'none';
        return;
    }
    requestsEmptyState.style.display = 'none';
    requestsTable.style.display = 'table';

    const isAdmin = currentUser && currentUser.role === 'admin';

    requestsTableBody.innerHTML = requests.map(req => {
        const isApproved = (req.status || '').toLowerCase() === 'approved';
        const actions = isAdmin
            ? (isApproved
                ? '<span style="color:#2E8B57;font-weight:bold;">Approved</span>'
                : `<button class="approve-req-btn" data-req-id="${req.id}" style="padding:6px 12px;border:none;border-radius:4px;cursor:pointer;background:#2E8B57;color:white;">Approve</button>`)
            : (isApproved
                ? '<span style="color:#2E8B57;font-weight:bold;">Approved</span>'
                : `<button class="edit-req-btn" data-req-id="${req.id}" style="padding:6px 12px;border:none;border-radius:4px;cursor:pointer;background:#5a67d8;color:white;">Edit</button><button class="delete-req-btn" data-req-id="${req.id}" style="padding:6px 12px;border:none;border-radius:4px;cursor:pointer;background:#A30000;color:white;margin-left:6px;">Delete</button>`);

        return `<tr><td style="padding: 12px; border-bottom: 1px solid #eee;">${req.type}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${req.itemsCount}</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${req.status}</td><td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap;">${actions}</td></tr>`;
    }).join('');
}

function updateDepartmentOptions() {
    if (!empDeptSelect) return;
    empDeptSelect.innerHTML = departments.map(dept => `<option value="${dept.name}">${dept.name}</option>`).join('');
}

function ensureRequestItemsControls() {
    if (!itemsContainer || requestItemsWrapper) return;
    requestItemsWrapper = document.createElement('div');
    requestItemsWrapper.className = 'request-items-wrapper';
    requestItemsWrapper.style.display = 'flex';
    requestItemsWrapper.style.flexDirection = 'column';
    requestItemsWrapper.style.gap = '6px';

    addRequestItemButton = document.createElement('button');
    addRequestItemButton.type = 'button';
    addRequestItemButton.textContent = '+ Add another item';
    addRequestItemButton.style.background = 'none';
    addRequestItemButton.style.color = '#2E8B57';
    addRequestItemButton.style.border = '1px solid #2E8B57';
    addRequestItemButton.style.padding = '6px 10px';
    addRequestItemButton.style.borderRadius = '5px';
    addRequestItemButton.style.cursor = 'pointer';

    addRequestItemButton.addEventListener('click', () => addRequestItemField());

    itemsContainer.appendChild(requestItemsWrapper);
    itemsContainer.appendChild(addRequestItemButton);
}

function addRequestItemField(value = '') {
    if (!requestItemsWrapper) return;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '6px';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Item description';
    input.style.flex = '1';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.style.padding = '8px';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.style.border = 'none';
    removeBtn.style.background = '#A30000';
    removeBtn.style.color = 'white';
    removeBtn.style.borderRadius = '4px';
    removeBtn.style.padding = '6px 10px';
    removeBtn.style.cursor = 'pointer';

    removeBtn.addEventListener('click', () => wrapper.remove());

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    requestItemsWrapper.appendChild(wrapper);
}

function resetRequestItems() {
    if (!requestItemsWrapper) return;
    requestItemsWrapper.innerHTML = '';
    addRequestItemField('Equipment Item 1');
}

function setAccountSubmitEnabled(enabled) {
    const submitBtn = accountForm?.querySelector('button[type="submit"]');
    if (!submitBtn) return;
    submitBtn.disabled = !enabled;
    submitBtn.style.opacity = enabled ? '1' : '0.6';
    submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
}

function isAccountFormDirty() {
    if (!editingAccountId) return true; // new account: allow submit when fields are filled by validation
    if (!accountFormOriginal) return true;
    const first = document.getElementById('acc-first')?.value.trim() || '';
    const last = document.getElementById('acc-last')?.value.trim() || '';
    const email = document.getElementById('acc-email')?.value.trim() || '';
    const role = document.getElementById('acc-role')?.value || '';
    const verified = !!document.getElementById('acc-verified')?.checked;
    const password = document.getElementById('acc-password')?.value || '';

    if (password) return true; // any password entered counts as a change

    return (
        first !== (accountFormOriginal.first || '') ||
        last !== (accountFormOriginal.last || '') ||
        email !== (accountFormOriginal.email || '') ||
        role !== (accountFormOriginal.role || '') ||
        verified !== !!accountFormOriginal.verified
    );
}

function updateAccountSubmitState() {
    setAccountSubmitEnabled(isAccountFormDirty());
}

function toggleRequestModal(show) {
    if (!requestModal) return;
    requestModal.style.display = show ? 'flex' : 'none';
    if (show) {
        requestForm?.reset();
        document.getElementById('req-type').value = 'Equipment';
        ensureRequestItemsControls();
        if (editingRequestId) {
            const req = requests.find(r => r.id === editingRequestId);
            if (req) {
                requestItemsWrapper.innerHTML = '';
                resetRequestItems();
                (req.items || []).forEach(item => addRequestItemField(item));
                if (!req.items || !req.items.length) addRequestItemField('Equipment Item 1');
                document.getElementById('req-type').value = req.type || 'Equipment';
            }
        } else {
            resetRequestItems();
        }
    } else {
        editingRequestId = null;
    }
}

function normalizeDateInput(value) {
    const raw = (value || '').trim();
    if (!raw) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw; // already ISO-like
    const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
        const [, mm, dd, yyyy] = match;
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    return '';
}

function renderProfile(user) {
    const emptyValue = '—';
    if (profileNameEl) {
        profileNameEl.textContent = user ? `${user.first || ''} ${user.last || ''}`.trim() : 'Guest';
    }
    if (profileEmailEl) {
        profileEmailEl.textContent = user ? user.email : emptyValue;
    }
    if (profileRoleEl) {
        profileRoleEl.textContent = user ? (user.role || 'user') : 'none';
    }
    if (editProfileFirst) {
        editProfileFirst.value = user ? user.first || '' : '';
    }
    if (editProfileLast) {
        editProfileLast.value = user ? user.last || '' : '';
    }
    if (editProfilePassword) {
        editProfilePassword.value = '';
    }
}

function setAuthState(isAuthenticated, user = {}) {
    if (loggedOutNav) {
        loggedOutNav.style.display = isAuthenticated ? 'none' : 'flex';
    }
    if (loggedInNav) {
        loggedInNav.style.display = isAuthenticated ? 'flex' : 'none';
    }
    if (adminLinks) {
        adminLinks.style.display = isAuthenticated && user.role === 'admin' ? 'block' : 'none';
    }
    if (navUserName) {
        navUserName.textContent = isAuthenticated ? `${user.first || ''} ${user.last || ''}`.trim() : '';
    }
    if (!isAuthenticated && userDropdownMenu) {
        userDropdownMenu.style.display = 'none';
    }

    currentUser = isAuthenticated ? user : null;
    if (navRequestsLabel) {
        navRequestsLabel.textContent = isAuthenticated && user.role === 'admin' ? 'Requests' : 'My Requests';
    }
    
    // Control request creation buttons visibility based on role
    const isAdmin = isAuthenticated && user.role === 'admin';
    if (showNewRequestBtn) {
        showNewRequestBtn.style.display = isAdmin ? 'none' : 'block';
    }
    if (requestsPageTitle) {
        requestsPageTitle.textContent = isAdmin ? 'All Requests' : 'My Requests';
    }
    
    renderProfile(currentUser);

    if (!isAuthenticated && !['#/login', '#/register', '#/verify'].includes(window.location.hash)) {
        window.location.hash = '#/';
    }
}

async function loadDepartments() {
    try {
        const data = await api.fetchDepartments();
        departments = data.departments || [];
        renderDepartments();
        updateDepartmentOptions();
    } catch (err) {
        console.error(err);
    }
}

async function loadEmployees() {
    try {
        const data = await api.fetchEmployees();
        employees = data.employees || [];
        renderEmployees();
    } catch (err) {
        console.error(err);
    }
}

async function loadAccounts() {
    try {
        const data = await api.fetchAccounts();
        accounts = data.users || [];
        renderAccounts();
    } catch (err) {
        console.error(err);
    }
}

async function loadRequests() {
    if (!currentUser) {
        requests = [];
        renderRequests();
        return;
    }
    try {
        const data = await api.fetchRequests();
        const all = data.requests || [];
        if (currentUser && currentUser.role !== 'admin') {
            // Show this user's requests, plus legacy ones that lack createdBy
            requests = all.filter(r => (r.createdBy && r.createdBy === currentUser.email) || !r.createdBy || r.createdBy === 'unknown');
        } else {
            requests = all;
        }
        renderRequests();
    } catch (err) {
        console.error(err);
    }
}

function loadAllAdminData() {
    Promise.allSettled([loadDepartments(), loadEmployees(), loadAccounts(), loadRequests()]);
}

function checkAuthToken() {
    const token = auth.getToken();
    if (!token) {
        auth.clearSession();
        setAuthState(false);
        return;
    }

    const decoded = auth.parseJwt(token);
    if (!decoded) {
        auth.clearSession();
        setAuthState(false);
        return;
    }

    const savedUser = auth.getStoredUser();
    setAuthState(true, savedUser || decoded);
    loadAllAdminData();
}

function hideContainer(container) {
    if (container) {
        container.style.display = 'none';
    }
}

// Event delegation for table buttons and modal handlers
function setupModalHandlers() {
    // Edit Employee button - event delegation
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-emp-btn')) {
            const empId = event.target.getAttribute('data-emp-id');
            const emp = employees.find(e => e.id === empId);
            if (emp && employeeFormContainer) {
                editingEmployeeId = emp.id;
                employeeForm?.reset();
                document.getElementById('emp-id').value = emp.id;
                document.getElementById('emp-id').disabled = true;
                document.getElementById('emp-email').value = emp.email || '';
                document.getElementById('emp-position').value = emp.position || '';
                document.getElementById('emp-dept').value = emp.dept || '';
                document.getElementById('emp-hire-date').value = emp.hireDate || '';
                employeeFormContainer.style.display = 'block';
            }
        }
    });

    // Delete Employee button - event delegation
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-emp-btn')) {
            const empId = event.target.getAttribute('data-emp-id');
            if (!confirm('Delete this employee?')) return;
            try {
                await postJson(`/api/employees/${encodeURIComponent(empId)}`, {}, 'DELETE');
                showToast('Employee deleted', 'success');
                await loadEmployees();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    // Edit Department button - event delegation
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-dept-btn')) {
            const deptName = event.target.getAttribute('data-dept-name');
            const dept = departments.find(d => d.name === deptName);
            if (dept && departmentEditModal) {
                document.getElementById('dept-edit-name').value = dept.name;
                document.getElementById('dept-edit-desc').value = dept.description;
                departmentEditModal.style.display = 'flex';
                departmentEditModal.dataset.originalName = deptName;
            }
        }
    });

    // Delete Department button - event delegation
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-dept-btn')) {
            const deptName = event.target.getAttribute('data-dept-name');
            if (!confirm('Delete this department?')) return;
            try {
                await postJson('/api/departments/' + encodeURIComponent(deptName), {}, 'DELETE');
                showToast('Department deleted', 'success');
                await loadDepartments();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    // Close Department Modal - event delegation
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-dept-modal')) {
            if (departmentEditModal) {
                departmentEditModal.style.display = 'none';
            }
        }
    });

    if (departmentEditModal) {
        departmentEditModal.addEventListener('click', (event) => {
            if (event.target === departmentEditModal) {
                departmentEditModal.style.display = 'none';
            }
        });
    }

    if (departmentEditForm) {
        departmentEditForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const originalName = departmentEditModal.dataset.originalName;
            const newName = document.getElementById('dept-edit-name').value.trim();
            const newDesc = document.getElementById('dept-edit-desc').value.trim();

            if (!newName || !newDesc) {
                showToast('Both name and description are required', 'error');
                return;
            }

            try {
                await postJson('/api/departments/' + encodeURIComponent(originalName), { name: newName, description: newDesc }, 'PUT');
                showToast('Department updated', 'success');
                departmentEditModal.style.display = 'none';
                await loadDepartments();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    // View Account button - event delegation
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-acc-btn')) {
            const accId = parseInt(event.target.getAttribute('data-acc-id'));
            const account = accounts.find(a => a.id === accId);
            if (account) {
                editingAccountId = accId;
                accountFormOriginal = {
                    first: account.first || '',
                    last: account.last || '',
                    email: account.email || '',
                    role: account.role || 'user',
                    verified: !!account.verified
                };
                accountForm?.reset();
                document.getElementById('acc-first').value = account.first || '';
                document.getElementById('acc-last').value = account.last || '';
                document.getElementById('acc-email').value = account.email || '';
                document.getElementById('acc-role').value = account.role || 'user';
                document.getElementById('acc-verified').checked = !!account.verified;
                const submitBtn = accountForm?.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Update';
                const pwdInput = document.getElementById('acc-password');
                if (pwdInput) {
                    pwdInput.value = '';
                    pwdInput.required = false;
                }
                updateAccountSubmitState();
                accountFormContainer.style.display = 'block';
            }
        }
    });

    // Delete Account button - event delegation
    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-acc-btn')) {
            const accId = parseInt(event.target.getAttribute('data-acc-id'));
            if (!confirm('Delete this account?')) return;
            try {
                await postJson(`/api/users/${accId}`, {}, 'DELETE');
                showToast('Account deleted', 'success');
                await loadAccounts();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    // Close Account Modal - event delegation
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-acc-modal')) {
            if (accountViewModal) {
                accountViewModal.style.display = 'none';
            }
        }
    });

    if (accountViewModal) {
        accountViewModal.addEventListener('click', (event) => {
            if (event.target === accountViewModal) {
                accountViewModal.style.display = 'none';
            }
        });
    }
}

window.addEventListener('hashchange', handleHashChange);

function initApp() {
    sections = Array.from(document.querySelectorAll('main section'));
    toastContainer = document.getElementById('toast-container');
    loggedOutNav = document.getElementById('logged-out-nav');
    loggedInNav = document.getElementById('logged-in-nav');
    adminLinks = document.getElementById('admin-links');
    userDropdownToggle = document.getElementById('user-dropdown-toggle');
    userDropdownMenu = document.getElementById('user-dropdown-menu');
    navUserName = document.getElementById('nav-user-name');
    profileNameEl = document.getElementById('profile-name');
    profileEmailEl = document.getElementById('profile-email');
    profileRoleEl = document.getElementById('profile-role');
    editProfileBtn = document.getElementById('edit-profile-btn');
    editProfileContainer = document.getElementById('edit-profile-form-container');
    editProfileForm = document.getElementById('editProfileForm');
    editProfileFirst = document.getElementById('edit-profile-first');
    editProfileLast = document.getElementById('edit-profile-last');
    editProfilePassword = document.getElementById('edit-profile-password');
    cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');
    showAddEmployeeBtn = document.getElementById('show-add-employee-btn');
    employeeFormContainer = document.getElementById('employee-form-container');
    employeeForm = document.getElementById('employeeForm');
    cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
    employeesTableBody = document.getElementById('employees-table-body');
    employeeViewModal = document.getElementById('employee-view-modal');
    showAddDepartmentBtn = document.getElementById('show-add-department-btn');
    departmentFormContainer = document.getElementById('department-form-container');
    departmentForm = document.getElementById('departmentForm');
    cancelDepartmentBtn = document.getElementById('cancel-department-btn');
    departmentsTableBody = document.getElementById('departments-table-body');
    departmentEditModal = document.getElementById('department-edit-modal');
    departmentEditForm = document.getElementById('departmentEditForm');
    showAddAccountBtn = document.getElementById('show-add-account-btn');
    accountFormContainer = document.getElementById('account-form-container');
    accountForm = document.getElementById('accountForm');
    cancelAccountBtn = document.getElementById('cancel-account-btn');
    accountsTableBody = document.getElementById('accounts-table-body');
    accountViewModal = document.getElementById('account-view-modal');
    showNewRequestBtn = document.getElementById('show-new-request-btn');
    requestModal = document.getElementById('request-modal');
    closeModalBtn = document.getElementById('close-modal');
    requestForm = document.getElementById('requestForm');
    requestsTable = document.getElementById('requests-table');
    requestsTableBody = document.getElementById('requests-table-body');
    requestsEmptyState = document.getElementById('requests-empty-state');
    itemsContainer = document.getElementById('items-container');
    empDeptSelect = document.getElementById('emp-dept');
    navRequestsLabel = document.getElementById('nav-requests-label');
    navRequestsLink = document.getElementById('nav-requests-link');
    requestsPageTitle = document.getElementById('requests-page-title');
    handleHashChange();
    checkAuthToken();
    loadAllAdminData();
    setupModalHandlers();

    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', () => { userDropdownMenu.style.display = userDropdownMenu.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', (event) => {
            if (event.target === userDropdownToggle || userDropdownToggle.contains(event.target)) return;
            if (!userDropdownMenu.contains(event.target)) userDropdownMenu.style.display = 'none';
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const data = await postJson('/api/login', { email, password });
            auth.setSession(data.token, data.user);
            setAuthState(true, data.user);
            await loadAllAdminData();
            showToast('Successfully logged in!', 'success');
            window.location.hash = '#/profile';
        } catch (err) { showToast(err.message, 'error'); }
    });

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const first = document.getElementById('reg-first').value;
        const last = document.getElementById('reg-last').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        try {
            await postJson('/api/register', { first, last, email, password });
            showToast('Registration successful! You can now log in.', 'success');
            await loadAccounts();
            window.location.hash = '#/login';
        } catch (err) { showToast(err.message, 'error'); }
    });

    if (showAddEmployeeBtn && employeeFormContainer) showAddEmployeeBtn.addEventListener('click', () => { editingEmployeeId = null; employeeForm?.reset(); const idInput = document.getElementById('emp-id'); if (idInput) idInput.disabled = false; updateDepartmentOptions(); employeeFormContainer.style.display = 'block'; });
    if (cancelEmployeeBtn && employeeFormContainer) cancelEmployeeBtn.addEventListener('click', () => { editingEmployeeId = null; const idInput = document.getElementById('emp-id'); if (idInput) idInput.disabled = false; hideContainer(employeeFormContainer); });
    if (employeeForm) employeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('emp-id').value.trim();
        const email = document.getElementById('emp-email').value.trim();
        const position = document.getElementById('emp-position').value.trim();
        const deptSelect = document.getElementById('emp-dept');
        const dept = (deptSelect?.value || deptSelect?.options?.[0]?.value || '').trim();
        const rawHire = document.getElementById('emp-hire-date').value;
        const hireDate = normalizeDateInput(rawHire) || rawHire.trim();

        if (!departments.length) return showToast('Create a department first', 'error');

        const missing = [];
        if (!id) missing.push('ID');
        if (!email) missing.push('Email');
        if (!position) missing.push('Position');
        if (!dept) missing.push('Department');
        if (!hireDate) missing.push('Hire date');
        if (missing.length) return showToast(`${missing.join(', ')} required`, 'error');

        const local = email.split('@')[0] || '';
        const [firstPart, lastPart] = local.split('.');
        const first = (firstPart || local || 'New').trim();
        const last = (lastPart || 'User').trim();
        try {
            if (editingEmployeeId) {
                await postJson(`/api/employees/${encodeURIComponent(editingEmployeeId)}`, { first: first || 'New', last: last || '', email, position, dept, hireDate }, 'PUT');
                showToast('Employee record updated', 'success');
            } else {
                await postJson('/api/employees', { id, first: first || 'New', last: last || '', email, position, dept, hireDate });
                showToast('Employee record added', 'success');
            }
            hideContainer(employeeFormContainer);
            editingEmployeeId = null;
            const idInput = document.getElementById('emp-id'); if (idInput) idInput.disabled = false;
            await loadEmployees();
        } catch (err) { showToast(err.message, 'error'); }
    });

    if (showAddDepartmentBtn && departmentFormContainer) showAddDepartmentBtn.addEventListener('click', () => { departmentForm?.reset(); departmentFormContainer.style.display = 'block'; });
    if (cancelDepartmentBtn && departmentFormContainer) cancelDepartmentBtn.addEventListener('click', () => hideContainer(departmentFormContainer));
    if (departmentForm) departmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('dept-name').value.trim();
        const description = document.getElementById('dept-description').value.trim();
        if (!name || !description) return showToast('Department name and description are required', 'error');
        try {
            await postJson('/api/departments', { name, description });
            showToast('Department added', 'success');
            hideContainer(departmentFormContainer);
            await loadDepartments();
        } catch (err) { showToast(err.message, 'error'); }
    });

    if (showAddAccountBtn && accountFormContainer) showAddAccountBtn.addEventListener('click', () => {
        editingAccountId = null; accountFormOriginal = null; accountForm?.reset();
        const submitBtn = accountForm?.querySelector('button[type="submit"]'); if (submitBtn) submitBtn.textContent = 'Save';
        const pwdInput = document.getElementById('acc-password'); if (pwdInput) pwdInput.required = true;
        setAccountSubmitEnabled(true);
        accountFormContainer.style.display = 'block';
    });
    if (cancelAccountBtn && accountFormContainer) cancelAccountBtn.addEventListener('click', () => { editingAccountId = null; accountFormOriginal = null; accountForm?.reset(); hideContainer(accountFormContainer); });

    if (accountForm) {
        accountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const first = document.getElementById('acc-first').value.trim();
            const last = document.getElementById('acc-last').value.trim();
            const email = document.getElementById('acc-email').value.trim();
            const password = document.getElementById('acc-password').value;
            const role = document.getElementById('acc-role').value;
            const verified = document.getElementById('acc-verified').checked;
            try {
                if (!first || !last || !email || (!editingAccountId && !password)) return showToast('Name and email are required. Password is required only when creating a new account.', 'error');
                if (editingAccountId) {
                    const payload = { first, last, email, role, verified }; if (password) payload.password = password;
                    await postJson(`/api/users/${editingAccountId}`, payload, 'PUT');
                    showToast('Account updated', 'success');
                    const pwdInput = document.getElementById('acc-password'); if (pwdInput) { pwdInput.value = ''; pwdInput.required = false; }
                } else {
                    await postJson('/api/register', { first, last, email, password, role, verified });
                    showToast('Account added', 'success');
                }
                hideContainer(accountFormContainer);
                editingAccountId = null; accountFormOriginal = null; accountForm?.reset();
                await loadAccounts();
            } catch (err) { showToast(err.message, 'error'); }
        });

        ['acc-first', 'acc-last', 'acc-email', 'acc-password', 'acc-role', 'acc-verified'].forEach(id => {
            const el = document.getElementById(id); if (!el) return;
            el.addEventListener(id === 'acc-verified' || id === 'acc-role' ? 'change' : 'input', updateAccountSubmitState);
        });
    }

    if (showNewRequestBtn) showNewRequestBtn.addEventListener('click', () => toggleRequestModal(true));
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleRequestModal(false));
    if (requestModal) requestModal.addEventListener('click', (event) => { if (event.target === requestModal) toggleRequestModal(false); });

    document.addEventListener('click', async (event) => {
        const editBtn = event.target.closest('.edit-req-btn');
        const deleteBtn = event.target.closest('.delete-req-btn');
        const approveBtn = event.target.closest('.approve-req-btn');
        if (editBtn) { editingRequestId = parseInt(editBtn.getAttribute('data-req-id')); toggleRequestModal(true); return; }
        if (deleteBtn) {
            const reqId = parseInt(deleteBtn.getAttribute('data-req-id'));
            if (!confirm('Delete this request?')) return;
            try { await postJson(`/api/requests/${reqId}`, {}, 'DELETE'); showToast('Request deleted', 'success'); await loadRequests(); } catch (err) { showToast(err.message, 'error'); }
            return;
        }
        if (approveBtn) {
            const reqId = parseInt(approveBtn.getAttribute('data-req-id'));
            try { await postJson(`/api/requests/${reqId}`, { status: 'Approved' }, 'PUT'); showToast('Request approved', 'success'); await loadRequests(); } catch (err) { showToast(err.message, 'error'); }
        }
    });

    if (requestForm) requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('req-type').value.trim();
        const inputs = requestItemsWrapper?.querySelectorAll('input') || [];
        const items = Array.from(inputs).map(input => input.value.trim()).filter(Boolean);
        if (!type || !items.length) return showToast('Provide a request type and at least one item', 'error');
        try {
            if (editingRequestId) { await postJson(`/api/requests/${editingRequestId}`, { type, items, createdBy: currentUser?.email || 'unknown' }, 'PUT'); showToast('Request updated', 'success'); }
            else { await postJson('/api/requests', { type, items, createdBy: currentUser?.email || 'unknown' }); showToast('Request submitted', 'success'); }
            editingRequestId = null; toggleRequestModal(false); await loadRequests();
        } catch (err) { showToast(err.message, 'error'); }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.clearSession(); setAuthState(false); showToast('Logged out successfully', 'success'); window.location.hash = '#/'; });

    if (editProfileBtn && editProfileContainer) editProfileBtn.addEventListener('click', () => { editProfileContainer.style.display = 'block'; editProfileFirst?.focus(); });
    if (cancelEditProfileBtn && editProfileContainer) cancelEditProfileBtn.addEventListener('click', () => hideContainer(editProfileContainer));
    if (editProfileForm) editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return showToast('You must be logged in to edit your profile', 'error');
        const first = editProfileFirst?.value.trim() || '';
        const last = editProfileLast?.value.trim() || '';
        const password = editProfilePassword?.value.trim();
        try {
            currentUser = { ...currentUser, first, last };
            auth.setStoredUser(currentUser);
            renderProfile(currentUser);
            if (password) await postJson('/api/profile/password', { email: currentUser.email, newPassword: password }, 'PUT');
            showToast('Profile updated successfully', 'success');
            hideContainer(editProfileContainer);
        } catch (err) { showToast(err.message, 'error'); }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}