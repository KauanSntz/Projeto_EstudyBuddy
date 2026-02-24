const STORAGE_KEYS = {
  users: 'users',
  studyLogs: 'studyLogs',
  session: 'session',
};

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStorageArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveStorageArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return getStorageArray(STORAGE_KEYS.users);
}

function saveUsers(users) {
  saveStorageArray(STORAGE_KEYS.users, users);
}

function getStudyLogs() {
  return getStorageArray(STORAGE_KEYS.studyLogs);
}

function saveStudyLogs(logs) {
  saveStorageArray(STORAGE_KEYS.studyLogs, logs);
}

function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && parsed.userId ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function seedData() {
  const users = getUsers();
  const logs = getStudyLogs();

  if (users.length > 0 || logs.length > 0) return;

  const professorId = createId();
  const studentId = createId();

  const seededUsers = [
    {
      id: professorId,
      name: 'Paulo Professor',
      email: 'prof@example.com',
      password: '123456',
      role: 'professor',
    },
    {
      id: studentId,
      name: 'Ana Estudante',
      email: 'ana@example.com',
      password: '123456',
      role: 'estudante',
    },
  ];

  const seededLogs = [
    {
      id: createId(),
      studentId,
      date: '2026-02-22',
      discipline: 'Lógica de Programação',
      content: 'Estruturas condicionais e operadores lógicos.',
      time_minutes: 45,
      difficulties: 'Dificuldade para combinar múltiplas condições no if.',
    },
    {
      id: createId(),
      studentId,
      date: '2026-02-20',
      discipline: 'Matemática',
      content: 'Resolução de exercícios de função do 2º grau.',
      time_minutes: 30,
      difficulties: 'Interpretação de gráficos em problemas contextualizados.',
    },
    {
      id: createId(),
      studentId,
      date: '2026-02-17',
      discipline: 'História',
      content: 'Resumo sobre a Revolução Francesa.',
      time_minutes: 50,
      difficulties: 'Organizar cronologia dos acontecimentos principais.',
    },
  ];

  saveUsers(seededUsers);
  saveStudyLogs(seededLogs);
}

seedData();
