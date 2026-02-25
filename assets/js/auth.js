function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  const value = normalizeEmail(email);
  if (!value || value.includes(' ')) return false;
  if (value.includes('..')) return false;

  const parts = value.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.startsWith('-') || local.endsWith('-')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) return false;
  if (!domain.includes('.')) return false;

  const domainParts = domain.split('.');
  if (domainParts.some((part) => !part)) return false;

  return true;
}

function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  return getUsers().find((user) => normalizeEmail(user.email) === normalized) || null;
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  return getUsers().find((user) => user.id === session.userId) || null;
}

function registerUser({ name, email, password, role }) {
  const users = getUsers();

  if (!isValidEmail(email)) {
    return { ok: false, message: 'Email inválido.' };
  }

  if (findUserByEmail(email)) {
    return { ok: false, message: 'Este email já está cadastrado.' };
  }

  const user = {
    id: createId(),
    name: String(name || '').trim(),
    email: normalizeEmail(email),
    password: String(password || ''),
    role: role || 'estudante',
  };

  users.push(user);
  saveUsers(users);

  return { ok: true, user };
}

function loginUser({ email, password }) {
  const user = findUserByEmail(email);

  if (!user || user.password !== String(password || '')) {
    return { ok: false, message: 'Email ou senha inválidos.' };
  }

  saveSession({ userId: user.id });
  return { ok: true, user };
}

function logoutUser() {
  clearSession();
  window.location.href = 'login.html';
}

function redirectByRole(user) {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (user.role === 'professor') {
    window.location.href = 'professor.html';
    return;
  }

  window.location.href = 'estudante.html';
}
