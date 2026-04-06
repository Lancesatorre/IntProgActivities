const API_BASE = '';
const AUTH_USER_ID_KEY = 'lab5_v2_auth_user_id';

let currentUser = null;
let editingAccountId = null;
let editingDepartmentId = null;
let editingEmployeeId = null;
let editingRequestId = null;

let departments = [];
let employees = [];
let requests = [];

const sections = {
  home: document.getElementById('home-page'),
  userHome: document.getElementById('user-home-page'),
  adminHome: document.getElementById('admin-home-page'),
  login: document.getElementById('login-page'),
  register: document.getElementById('register-page'),
  verify: document.getElementById('verify-page'),
  profile: document.getElementById('profile-page'),
  employees: document.getElementById('employees-page'),
  departments: document.getElementById('departments-page'),
  accounts: document.getElementById('accounts-page'),
  requests: document.getElementById('requests-page')
};

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function toBackendRole(roleValue) {
  return String(roleValue).toLowerCase() === 'admin' ? 'Admin' : 'User';
}

function toUiRole(roleValue) {
  return String(roleValue).toLowerCase() === 'admin' ? 'admin' : 'user';
}

function isAdmin(user) {
  return user && toUiRole(user.role) === 'admin';
}

function hideElementById(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showElementById(id, displayValue = 'block') {
  const el = document.getElementById(id);
  if (el) el.style.display = displayValue;
}

function setAuthState(user) {
  currentUser = user || null;

  const loggedOutNav = document.getElementById('logged-out-nav');
  const loggedInNav = document.getElementById('logged-in-nav');
  const navUserName = document.getElementById('nav-user-name');
  const adminLinks = document.getElementById('admin-links');
  const userDropdownMenu = document.getElementById('user-dropdown-menu');
  const navRequestsLabel = document.getElementById('nav-requests-label');
  let dashboardLink = document.getElementById('nav-dashboard-link');
  const requestsTitle = document.getElementById('requests-page-title');
  const requestBtn = document.getElementById('show-new-request-btn');

  if (!dashboardLink && userDropdownMenu) {
    dashboardLink = document.createElement('a');
    dashboardLink.id = 'nav-dashboard-link';
    dashboardLink.style.display = 'block';
    dashboardLink.style.padding = '10px 15px';
    dashboardLink.style.color = 'black';
    dashboardLink.style.textDecoration = 'none';
    dashboardLink.style.borderBottom = '1px solid #f0f0f0';

    const profileLink = userDropdownMenu.querySelector('a[href="profile.html"]');
    if (profileLink) {
      userDropdownMenu.insertBefore(dashboardLink, profileLink);
    } else {
      userDropdownMenu.prepend(dashboardLink);
    }
  }

  if (currentUser) {
    if (loggedOutNav) loggedOutNav.style.display = 'none';
    if (loggedInNav) loggedInNav.style.display = 'block';
    if (navUserName) {
      navUserName.textContent = isAdmin(currentUser)
        ? `${currentUser.firstName} (ADMIN)`
        : currentUser.firstName;
    }
    if (adminLinks) adminLinks.style.display = isAdmin(currentUser) ? 'block' : 'none';
    if (dashboardLink) {
      dashboardLink.textContent = 'Dashboard';
      dashboardLink.href = isAdmin(currentUser) ? 'admin-home.html' : 'user-home.html';
    }
    if (navRequestsLabel) navRequestsLabel.textContent = isAdmin(currentUser) ? 'Requests' : 'My Requests';
    if (requestsTitle) requestsTitle.textContent = isAdmin(currentUser) ? 'All Requests' : 'My Requests';
    if (requestBtn) requestBtn.style.display = isAdmin(currentUser) ? 'none' : 'inline-block';
  } else {
    if (loggedOutNav) loggedOutNav.style.display = 'flex';
    if (loggedInNav) loggedInNav.style.display = 'none';
    if (navUserName) navUserName.textContent = '';
    if (adminLinks) adminLinks.style.display = 'none';
    if (dashboardLink) {
      dashboardLink.textContent = 'Dashboard';
      dashboardLink.href = 'home.html';
    }
    if (navRequestsLabel) navRequestsLabel.textContent = 'My Requests';
    if (requestsTitle) requestsTitle.textContent = 'My Requests';
    if (requestBtn) requestBtn.style.display = 'inline-block';
    if (userDropdownMenu) userDropdownMenu.style.display = 'none';
  }
}

function renderProfile() {
  if (!currentUser) return;

  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileRole = document.getElementById('profile-role');

  if (profileName) profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  if (profileEmail) profileEmail.textContent = currentUser.email;
  if (profileRole) profileRole.textContent = toUiRole(currentUser.role);
}

async function renderAccountsTable() {
  const tbody = document.getElementById('accounts-table-body');
  if (!tbody) return;

  const users = await apiFetch('/users');

  tbody.innerHTML = users.map((user) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">${user.firstName} ${user.lastName}</td>
      <td style="padding: 12px;">${user.email}</td>
      <td style="padding: 12px; text-transform: capitalize;">${toUiRole(user.role)}</td>
      <td style="padding: 12px; text-align: center;">N/A</td>
      <td style="padding: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
        <button data-action="edit-account" data-id="${user.id}" style="padding: 7px 15px; background: #2E8B57; color: white; border: none; border-radius: 4px;">Edit</button>
        <button data-action="delete-account" data-id="${user.id}" style="padding: 7px 15px; background: #A30000; color: white; border: none; border-radius: 4px;">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="padding: 12px; text-align: center;">No accounts found.</td></tr>';
}

async function loadDepartments() {
  const data = await apiFetch('/departments');
  departments = data.departments || [];
  renderDepartmentsTable();
  refreshDepartmentOptions();
}

function renderDepartmentsTable() {
  const tbody = document.getElementById('departments-table-body');
  if (!tbody) return;

  tbody.innerHTML = departments.map((dept) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">${dept.name}</td>
      <td style="padding: 12px;">${dept.description}</td>
      <td style="padding: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
        <button data-action="edit-dept" data-id="${dept.id}" style="padding: 7px 15px; background: #2E8B57; color: white; border: none; border-radius: 4px;">Edit</button>
        <button data-action="delete-dept" data-id="${dept.id}" style="padding: 7px 15px; background: #A30000; color: white; border: none; border-radius: 4px;">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="padding: 12px; text-align: center;">No departments found.</td></tr>';
}

function refreshDepartmentOptions() {
  const select = document.getElementById('emp-dept');
  if (!select) return;

  select.innerHTML = departments.map((dept) => `<option value="${dept.name}">${dept.name}</option>`).join('');
}

async function loadEmployees() {
  const data = await apiFetch('/employees');
  employees = data.employees || [];
  renderEmployeesTable();
}

function renderEmployeesTable() {
  const tbody = document.getElementById('employees-table-body');
  if (!tbody) return;

  tbody.innerHTML = employees.map((emp) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px;">${emp.employeeCode}</td>
      <td style="padding: 12px;">${emp.email}</td>
      <td style="padding: 12px;">${emp.position}</td>
      <td style="padding: 12px;">${emp.departmentName || ''}</td>
      <td style="padding: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
        <button data-action="view-emp" data-id="${emp.id}" style="padding: 7px 10px; background: #3CA1C3; color: white; border: none; border-radius: 4px;">View</button>
        <button data-action="edit-emp" data-id="${emp.id}" style="padding: 7px 10px; background: #2E8B57; color: white; border: none; border-radius: 4px;">Edit</button>
        <button data-action="delete-emp" data-id="${emp.id}" style="padding: 7px 10px; background: #A30000; color: white; border: none; border-radius: 4px;">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="padding: 12px; text-align: center;">No employees found.</td></tr>';
}

async function loadRequests() {
  if (!currentUser) return;

  const query = new URLSearchParams({
    userId: String(currentUser.id),
    role: String(currentUser.role)
  });

  const data = await apiFetch(`/requests?${query.toString()}`);
  requests = data.requests || [];
  renderRequestsTable();
}

function renderRequestsTable() {
  const tbody = document.getElementById('requests-table-body');
  const table = document.getElementById('requests-table');
  const empty = document.getElementById('requests-empty-state');
  if (!tbody || !table || !empty) return;

  if (!requests.length) {
    empty.style.display = 'block';
    table.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  table.style.display = 'table';

  const admin = isAdmin(currentUser);
  tbody.innerHTML = requests.map((req) => {
    const approved = String(req.status).toLowerCase() === 'approved';
    let actions = '';
    if (admin) {
      actions = approved
        ? '<span style="color:#2E8B57;font-weight:bold;">Approved</span>'
        : `<button data-action="approve-req" data-id="${req.id}" style="padding:7px 12px; background:#2E8B57; color:white; border:none; border-radius:4px;">Approve</button>`;
    } else {
      actions = approved
        ? '<span style="color:#2E8B57;font-weight:bold;">Approved</span>'
        : `<button data-action="edit-req" data-id="${req.id}" style="padding:7px 12px; background:#3CA1C3; color:white; border:none; border-radius:4px;">Edit</button>
           <button data-action="delete-req" data-id="${req.id}" style="padding:7px 12px; background:#A30000; color:white; border:none; border-radius:4px;">Delete</button>`;
    }

    return `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:12px;">${req.type}</td>
        <td style="padding:12px;">${req.itemsCount}</td>
        <td style="padding:12px;">${req.status}</td>
        <td style="padding:12px; display:flex; gap:6px; flex-wrap:wrap;">${actions}</td>
      </tr>
    `;
  }).join('');
}

function hideAllSections() {
  Object.values(sections).forEach((section) => {
    if (section) section.style.display = 'none';
  });
}

function resolveRoute(hashValue) {
  const route = hashValue || '#/';

  const config = {
    '#/': { section: 'home', auth: false, admin: false },
    '#/user-home': { section: 'userHome', auth: true, admin: false },
    '#/admin-home': { section: 'adminHome', auth: true, admin: true },
    '#/login': { section: 'login', auth: false, admin: false },
    '#/register': { section: 'register', auth: false, admin: false },
    '#/verify': { section: 'verify', auth: false, admin: false },
    '#/verify-email': { section: 'verify', auth: false, admin: false },
    '#/profile': { section: 'profile', auth: true, admin: false },
    '#/accounts': { section: 'accounts', auth: true, admin: true },
    '#/employees': { section: 'employees', auth: true, admin: true },
    '#/departments': { section: 'departments', auth: true, admin: true },
    '#/requests': { section: 'requests', auth: true, admin: false }
  };

  return config[route] || config['#/'];
}

function routeToPage(hashRoute) {
  const pageMap = {
    '#/': 'home.html',
    '#/user-home': 'user-home.html',
    '#/admin-home': 'admin-home.html',
    '#/login': 'login.html',
    '#/register': 'register.html',
    '#/verify': 'verify.html',
    '#/verify-email': 'verify.html',
    '#/profile': 'profile.html',
    '#/accounts': 'accounts.html',
    '#/employees': 'employees.html',
    '#/departments': 'departments.html',
    '#/requests': 'requests.html'
  };

  return pageMap[hashRoute] || 'home.html';
}

function redirectToRoute(hashRoute) {
  const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
  const targetPage = routeToPage(hashRoute).toLowerCase();

  if (currentPage !== targetPage) {
    window.location.href = `${targetPage}${hashRoute}`;
  } else {
    window.location.hash = hashRoute;
  }
}

async function renderRoute() {
  const routeConfig = resolveRoute(window.location.hash);

  if (routeConfig.auth && !currentUser) {
    redirectToRoute('#/login');
    return;
  }

  if (routeConfig.admin && !isAdmin(currentUser)) {
    showToast('Admin access required.', 'error');
    redirectToRoute('#/profile');
    return;
  }

  const currentPage = (window.location.pathname.split('/').pop() || '').toLowerCase();
  const expectedPage = routeToPage(window.location.hash || '#/').toLowerCase();
  if (currentPage !== expectedPage) {
    redirectToRoute(window.location.hash || '#/');
    return;
  }

  hideAllSections();
  const section = sections[routeConfig.section];
  if (!section) {
    redirectToRoute(window.location.hash || '#/');
    return;
  }
  section.style.display = 'block';

  try {
    if (routeConfig.section === 'profile') {
      renderProfile();
    }

    if (routeConfig.section === 'accounts') {
      await renderAccountsTable();
    }

    if (routeConfig.section === 'departments') {
      await loadDepartments();
    }

    if (routeConfig.section === 'employees') {
      await loadDepartments();
      await loadEmployees();
    }

    if (routeConfig.section === 'requests') {
      await loadRequests();
    }
  } catch (error) {
    showToast(error.message || 'Failed to load data', 'error');
  }
}

async function loadSessionUser() {
  const savedId = localStorage.getItem(AUTH_USER_ID_KEY);
  if (!savedId) {
    setAuthState(null);
    return;
  }

  try {
    const user = await apiFetch(`/users/${savedId}`);
    setAuthState(user);
  } catch {
    localStorage.removeItem(AUTH_USER_ID_KEY);
    setAuthState(null);
  }
}

function bindAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const user = await apiFetch('/users/authenticate', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        localStorage.setItem(AUTH_USER_ID_KEY, String(user.id));
        setAuthState(user);
        showToast('Successfully logged in.', 'success');
        redirectToRoute(isAdmin(user) ? '#/admin-home' : '#/user-home');
      } catch (error) {
        showToast(error.message || 'Login failed', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const firstName = document.getElementById('reg-first').value.trim();
        const lastName = document.getElementById('reg-last').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify({
            title: 'Mx',
            firstName,
            lastName,
            role: 'User',
            email,
            password,
            confirmPassword: password
          })
        });

        localStorage.setItem('unverified_email', email);
        showToast('Registration successful. Continue to verification page.', 'success');
        window.location.hash = '#/verify';
      } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
      }
    });
  }
}

function bindVerification() {
  const button = document.getElementById('simulate-verify-btn');
  const emailDisplay = document.getElementById('verify-email-display');

  if (!button) return;

  button.addEventListener('click', () => {
    const email = localStorage.getItem('unverified_email') || 'your account';
    localStorage.removeItem('unverified_email');
    showToast(`Verification simulated for ${email}. You may now login.`, 'success');
    window.location.hash = '#/login';
  });

  window.addEventListener('hashchange', () => {
    if ((window.location.hash === '#/verify' || window.location.hash === '#/verify-email') && emailDisplay) {
      emailDisplay.textContent = localStorage.getItem('unverified_email') || 'your email address';
    }
  });
}

function bindProfileEdit() {
  const editBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-edit-profile-btn');
  const form = document.getElementById('editProfileForm');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (!currentUser) return;

      document.getElementById('edit-profile-first').value = currentUser.firstName;
      document.getElementById('edit-profile-last').value = currentUser.lastName;
      document.getElementById('edit-profile-password').value = '';
      hideElementById('profile-details-container');
      showElementById('edit-profile-form-container');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideElementById('edit-profile-form-container');
      showElementById('profile-details-container');
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) return;

      try {
        const firstName = document.getElementById('edit-profile-first').value.trim();
        const lastName = document.getElementById('edit-profile-last').value.trim();
        const password = document.getElementById('edit-profile-password').value;

        const payload = {
          title: currentUser.title || 'Mx',
          firstName,
          lastName,
          role: currentUser.role,
          email: currentUser.email
        };

        if (password) {
          payload.password = password;
          payload.confirmPassword = password;
        }

        await apiFetch(`/users/${currentUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });

        const refreshed = await apiFetch(`/users/${currentUser.id}`);
        setAuthState(refreshed);
        renderProfile();

        hideElementById('edit-profile-form-container');
        showElementById('profile-details-container');
        showToast('Profile updated.', 'success');
      } catch (error) {
        showToast(error.message || 'Profile update failed', 'error');
      }
    });
  }
}

function bindAccountActions() {
  const showAddBtn = document.getElementById('show-add-account-btn');
  const cancelBtn = document.getElementById('cancel-account-btn');
  const form = document.getElementById('accountForm');
  const tableBody = document.getElementById('accounts-table-body');

  if (showAddBtn && form) {
    showAddBtn.addEventListener('click', () => {
      editingAccountId = null;
      form.reset();
      showElementById('account-form-container');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideElementById('account-form-container');
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const payload = {
          title: 'Mx',
          firstName: document.getElementById('acc-first').value.trim(),
          lastName: document.getElementById('acc-last').value.trim(),
          email: document.getElementById('acc-email').value.trim(),
          role: toBackendRole(document.getElementById('acc-role').value)
        };

        const password = document.getElementById('acc-password').value;

        if (editingAccountId) {
          const updatePayload = { ...payload };
          if (password) {
            updatePayload.password = password;
            updatePayload.confirmPassword = password;
          }

          await apiFetch(`/users/${editingAccountId}`, {
            method: 'PUT',
            body: JSON.stringify(updatePayload)
          });
        } else {
          if (!password) {
            throw new Error('Password is required for new accounts.');
          }

          await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              password,
              confirmPassword: password
            })
          });
        }

        hideElementById('account-form-container');
        form.reset();
        await renderAccountsTable();
        showToast('Account saved.', 'success');
      } catch (error) {
        showToast(error.message || 'Account save failed', 'error');
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      const id = target.getAttribute('data-id');
      if (!action || !id) return;

      if (action === 'edit-account') {
        try {
          const user = await apiFetch(`/users/${id}`);
          editingAccountId = user.id;

          document.getElementById('acc-first').value = user.firstName || '';
          document.getElementById('acc-last').value = user.lastName || '';
          document.getElementById('acc-email').value = user.email || '';
          document.getElementById('acc-password').value = '';
          document.getElementById('acc-role').value = toUiRole(user.role);

          showElementById('account-form-container');
        } catch (error) {
          showToast(error.message || 'Failed to load account', 'error');
        }
      }

      if (action === 'delete-account') {
        const confirmed = window.confirm('Delete this account?');
        if (!confirmed) return;

        try {
          await apiFetch(`/users/${id}`, { method: 'DELETE' });
          await renderAccountsTable();
          showToast('Account deleted.', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete account', 'error');
        }
      }
    });
  }
}

function bindDepartmentActions() {
  const showAddBtn = document.getElementById('show-add-department-btn');
  const cancelBtn = document.getElementById('cancel-department-btn');
  const form = document.getElementById('departmentForm');
  const tableBody = document.getElementById('departments-table-body');

  if (showAddBtn && form) {
    showAddBtn.addEventListener('click', () => {
      editingDepartmentId = null;
      form.reset();
      showElementById('department-form-container');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => hideElementById('department-form-container'));
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) return;

      try {
        const payload = {
          name: document.getElementById('dept-name').value.trim(),
          description: document.getElementById('dept-description').value.trim(),
          role: currentUser.role
        };

        if (editingDepartmentId) {
          await apiFetch(`/departments/${editingDepartmentId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } else {
          await apiFetch('/departments', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }

        hideElementById('department-form-container');
        form.reset();
        await loadDepartments();
        showToast('Department saved.', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to save department', 'error');
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      const id = Number(target.getAttribute('data-id'));
      if (!action || !id) return;

      if (action === 'edit-dept') {
        const dept = departments.find((item) => item.id === id);
        if (!dept) return;

        editingDepartmentId = id;
        document.getElementById('dept-name').value = dept.name || '';
        document.getElementById('dept-description').value = dept.description || '';
        showElementById('department-form-container');
      }

      if (action === 'delete-dept') {
        if (!currentUser) return;
        const confirmed = window.confirm('Delete this department?');
        if (!confirmed) return;

        try {
          await apiFetch(`/departments/${id}?role=${encodeURIComponent(currentUser.role)}`, {
            method: 'DELETE'
          });
          await loadDepartments();
          showToast('Department deleted.', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete department', 'error');
        }
      }
    });
  }
}

function bindEmployeeActions() {
  const showAddBtn = document.getElementById('show-add-employee-btn');
  const cancelBtn = document.getElementById('cancel-employee-btn');
  const form = document.getElementById('employeeForm');
  const tableBody = document.getElementById('employees-table-body');

  if (showAddBtn && form) {
    showAddBtn.addEventListener('click', () => {
      editingEmployeeId = null;
      form.reset();
      showElementById('employee-form-container');
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => hideElementById('employee-form-container'));
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) return;

      try {
        const payload = {
          employeeCode: document.getElementById('emp-id').value.trim(),
          email: document.getElementById('emp-email').value.trim(),
          position: document.getElementById('emp-position').value.trim(),
          departmentName: document.getElementById('emp-dept').value,
          hireDate: document.getElementById('emp-hire-date').value,
          role: currentUser.role
        };

        if (editingEmployeeId) {
          await apiFetch(`/employees/${editingEmployeeId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
          });
        } else {
          await apiFetch('/employees', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }

        hideElementById('employee-form-container');
        form.reset();
        await loadEmployees();
        showToast('Employee saved.', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to save employee', 'error');
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      const id = Number(target.getAttribute('data-id'));
      if (!action || !id) return;

      const employee = employees.find((item) => item.id === id);

      if (action === 'view-emp') {
        if (!employee) return;
        document.getElementById('emp-view-id').textContent = employee.employeeCode || '';
        document.getElementById('emp-view-name').textContent = employee.email || '';
        document.getElementById('emp-view-position').textContent = employee.position || '';
        document.getElementById('emp-view-dept').textContent = employee.departmentName || '';
        document.getElementById('emp-view-hiredate').textContent = employee.hireDate || '';
        showElementById('employee-view-modal', 'flex');
      }

      if (action === 'edit-emp') {
        if (!employee) return;
        editingEmployeeId = employee.id;
        document.getElementById('emp-id').value = employee.employeeCode || '';
        document.getElementById('emp-email').value = employee.email || '';
        document.getElementById('emp-position').value = employee.position || '';
        document.getElementById('emp-dept').value = employee.departmentName || '';
        document.getElementById('emp-hire-date').value = employee.hireDate || '';
        showElementById('employee-form-container');
      }

      if (action === 'delete-emp') {
        if (!currentUser) return;
        const confirmed = window.confirm('Delete this employee?');
        if (!confirmed) return;

        try {
          await apiFetch(`/employees/${id}?role=${encodeURIComponent(currentUser.role)}`, { method: 'DELETE' });
          await loadEmployees();
          showToast('Employee deleted.', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete employee', 'error');
        }
      }
    });
  }

  document.querySelectorAll('.close-emp-modal').forEach((btn) => {
    btn.addEventListener('click', () => hideElementById('employee-view-modal'));
  });
}

function getRequestItemsFromForm() {
  const inputs = document.querySelectorAll('#items-container .req-item');
  const items = Array.from(inputs)
    .map((input) => String(input.value || '').trim())
    .filter((value) => value.length > 0);

  if (!items.length) {
    throw new Error('Please add at least one item.');
  }

  return items;
}

function setupRequestItemInputs(items = ['']) {
  const container = document.getElementById('items-container');
  if (!container) return;

  container.innerHTML = '';

  const addInputRow = (value = '') => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '8px';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'req-item';
    input.value = value;
    input.placeholder = 'Item description';
    input.style.flex = '1';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.style.padding = '8px';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.style.background = '#A30000';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '4px';
    removeBtn.style.padding = '8px 10px';
    removeBtn.addEventListener('click', () => row.remove());

    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
  };

  items.forEach((item) => addInputRow(item));

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+ Add item';
  addBtn.style.background = 'white';
  addBtn.style.border = '1px solid #2E8B57';
  addBtn.style.color = '#2E8B57';
  addBtn.style.borderRadius = '4px';
  addBtn.style.padding = '8px 10px';
  addBtn.addEventListener('click', () => addInputRow(''));

  container.appendChild(addBtn);
}

function bindRequestActions() {
  const showNewBtn = document.getElementById('show-new-request-btn');
  const modal = document.getElementById('request-modal');
  const closeBtn = document.getElementById('close-modal');
  const form = document.getElementById('requestForm');
  const tableBody = document.getElementById('requests-table-body');

  if (showNewBtn && modal) {
    showNewBtn.addEventListener('click', () => {
      editingRequestId = null;
      document.getElementById('req-type').value = 'Equipment';
      setupRequestItemInputs(['Equipment item']);
      modal.style.display = 'flex';
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      editingRequestId = null;
    });
  }

  if (form && modal) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!currentUser) return;

      try {
        const payload = {
          type: document.getElementById('req-type').value.trim(),
          items: getRequestItemsFromForm()
        };

        if (editingRequestId) {
          await apiFetch(`/requests/${editingRequestId}`, {
            method: 'PUT',
            body: JSON.stringify({
              ...payload,
              updaterUserId: currentUser.id,
              updaterRole: currentUser.role
            })
          });
        } else {
          await apiFetch('/requests', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              createdByUserId: currentUser.id
            })
          });
        }

        modal.style.display = 'none';
        editingRequestId = null;
        await loadRequests();
        showToast('Request saved.', 'success');
      } catch (error) {
        showToast(error.message || 'Failed to save request', 'error');
      }
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.getAttribute('data-action');
      const id = Number(target.getAttribute('data-id'));
      if (!action || !id || !currentUser) return;

      const request = requests.find((item) => item.id === id);

      if (action === 'edit-req') {
        if (!request) return;
        editingRequestId = id;
        document.getElementById('req-type').value = request.type;
        setupRequestItemInputs(Array.isArray(request.items) ? request.items : ['']);
        showElementById('request-modal', 'flex');
      }

      if (action === 'delete-req') {
        const confirmed = window.confirm('Delete this request?');
        if (!confirmed) return;

        try {
          await apiFetch(`/requests/${id}`, {
            method: 'DELETE',
            body: JSON.stringify({
              deleterUserId: currentUser.id,
              deleterRole: currentUser.role
            })
          });
          await loadRequests();
          showToast('Request deleted.', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to delete request', 'error');
        }
      }

      if (action === 'approve-req') {
        try {
          await apiFetch(`/requests/${id}/approve`, {
            method: 'PATCH',
            body: JSON.stringify({ approverRole: currentUser.role })
          });
          await loadRequests();
          showToast('Request approved.', 'success');
        } catch (error) {
          showToast(error.message || 'Failed to approve request', 'error');
        }
      }
    });
  }
}

function bindNavControls() {
  const dropdownToggle = document.getElementById('user-dropdown-toggle');
  const dropdownMenu = document.getElementById('user-dropdown-menu');
  const logoutBtn = document.getElementById('logout-btn');

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
  }

  document.addEventListener('click', () => {
    if (dropdownMenu) dropdownMenu.style.display = 'none';
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem(AUTH_USER_ID_KEY);
      setAuthState(null);
      showToast('Logged out.', 'success');
      window.location.hash = '#/';
    });
  }
}

async function init() {
  bindNavControls();
  bindAuthForms();
  bindVerification();
  bindProfileEdit();
  bindAccountActions();
  bindDepartmentActions();
  bindEmployeeActions();
  bindRequestActions();

  await loadSessionUser();

  window.addEventListener('hashchange', () => {
    renderRoute();
  });

  await renderRoute();
}

init();
