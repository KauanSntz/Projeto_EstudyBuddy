let currentProfessor = null;
let expandedStudentId = null;

function getStudents() {
  return getUsers().filter((user) => user.role === 'estudante');
}

function getLogsSorted() {
  return getStudyLogs().sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderProfessorHeader() {
  document.querySelector('#professor-greeting').textContent = `Prof. ${currentProfessor.name}`;
}

function countLogsInLast7Days(studentId) {
  const today = new Date();
  const limit = new Date(today);
  limit.setDate(today.getDate() - 6);
  limit.setHours(0, 0, 0, 0);

  return getStudyLogs().filter((log) => {
    if (log.studentId !== studentId) return false;
    const logDate = new Date(`${log.date}T12:00:00`);
    return logDate >= limit;
  }).length;
}

function renderMetrics(students, logs) {
  const lowFrequency = students.filter((student) => countLogsInLast7Days(student.id) < 3);

  document.querySelector('#metric-alunos').textContent = students.length;
  document.querySelector('#metric-registros').textContent = logs.length;
  document.querySelector('#metric-baixa').textContent = lowFrequency.length;

  const chips = document.querySelector('#low-frequency-chips');
  chips.innerHTML = lowFrequency.length
    ? lowFrequency
        .map((student) => `<span class="chip">${escapeHtml(student.name)} (${countLogsInLast7Days(student.id)})</span>`)
        .join('')
    : '<span class="chip">Nenhum aluno com baixa frequência</span>';
}

function renderStudentsSection(students, logs) {
  const container = document.querySelector('#students-accordion');

  container.innerHTML = students
    .map((student) => {
      const studentLogs = logs.filter((log) => log.studentId === student.id);
      const isOpen = expandedStudentId === student.id;
      const initial = escapeHtml(student.name.charAt(0).toUpperCase());

      return `
        <article class="accordion-item ${isOpen ? 'open' : ''}" data-student-id="${student.id}">
          <button class="accordion-header" data-toggle-student="${student.id}">
            <span class="avatar">${initial}</span>
            <span class="student-main">
              <strong>${escapeHtml(student.name)}</strong>
              <small>${studentLogs.length} registros</small>
            </span>
            <span class="accordion-arrow">▾</span>
          </button>
          <div class="accordion-content">
            ${
              studentLogs.length
                ? studentLogs
                    .map(
                      (log) => `
                    <div class="student-log">
                      <div class="student-log-meta">
                        <span class="pill">${escapeHtml(log.discipline)}</span>
                        <span>${formatDatePt(log.date)} • ${Number(log.time_minutes)}min</span>
                      </div>
                      <p>${escapeHtml(log.content)}</p>
                      <p class="log-difficulty">${escapeHtml(log.difficulties || 'Sem dificuldades registradas.')}</p>
                    </div>
                  `
                    )
                    .join('')
                : '<div class="student-log"><p>Nenhum registro para este aluno.</p></div>'
            }
          </div>
        </article>
      `;
    })
    .join('');
}

function renderRecentDifficulties(logs, studentsMap) {
  const recent = logs.filter((log) => String(log.difficulties || '').trim()).slice(0, 20);
  const container = document.querySelector('#recent-difficulties');

  if (!recent.length) {
    container.innerHTML = '<article class="difficulty-item"><p>Nenhuma dificuldade recente.</p></article>';
    return;
  }

  container.innerHTML = recent
    .map((log) => {
      const studentName = studentsMap.get(log.studentId)?.name || 'Aluno';
      return `
      <article class="difficulty-item">
        <p class="difficulty-meta">${escapeHtml(studentName)} • ${escapeHtml(log.discipline)} • ${formatDateShort(log.date)}</p>
        <p class="difficulty-text">${escapeHtml(log.difficulties)}</p>
      </article>
    `;
    })
    .join('');
}

function refreshProfessorDashboard() {
  const students = getStudents();
  const logs = getLogsSorted();
  const studentsMap = new Map(students.map((student) => [student.id, student]));

  renderMetrics(students, logs);
  renderStudentsSection(students, logs);
  renderRecentDifficulties(logs, studentsMap);
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('professor');
  if (!user) return;

  currentProfessor = user;
  renderProfessorHeader();
  refreshProfessorDashboard();

  document.querySelector('#logout-btn').addEventListener('click', logoutUser);
  document.querySelector('#students-accordion').addEventListener('click', (event) => {
    const studentId = event.target.closest('[data-toggle-student]')?.dataset.toggleStudent;
    if (!studentId) return;

    expandedStudentId = expandedStudentId === studentId ? null : studentId;
    refreshProfessorDashboard();
  });
});
