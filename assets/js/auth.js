function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
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

  if (findUserByEmail(email)) {
    return { ok: false, message: 'Este email já está cadastrado.' };
  }

  const user = {
    id: createId(),
    name: String(name || '').trim(),
    email: normalizeEmail(email),
    password: String(password || ''),
    role,
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
