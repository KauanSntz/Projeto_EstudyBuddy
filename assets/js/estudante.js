let currentStudent = null;

function getStudentLogs() {
  return getStudyLogs()
    .filter((log) => log.studentId === currentStudent.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderStudentHeader() {
  const greeting = document.querySelector('#student-greeting');
  greeting.textContent = `Olá, ${currentStudent.name}`;
}

function renderStudentMetrics(logs) {
  const totalRegistros = logs.length;
  const totalMinutes = logs.reduce((sum, log) => sum + Number(log.time_minutes || 0), 0);

  document.querySelector('#metric-registros').textContent = totalRegistros;
  document.querySelector('#metric-tempo').textContent = formatMinutes(totalMinutes);
}

function renderHistory(logs) {
  const list = document.querySelector('#history-list');

  if (logs.length === 0) {
    list.innerHTML = `
      <article class="empty-state">
        <div class="empty-icon">${bookIcon()}</div>
        <p>Nenhum registro ainda. Comece a estudar!</p>
      </article>
    `;
    return;
  }

  list.innerHTML = logs
    .map(
      (log) => `
      <article class="log-card" data-log-id="${log.id}">
        <div class="log-top">
          <span class="pill">${escapeHtml(log.discipline)}</span>
          <span class="meta">${formatDatePt(log.date)} • ${Number(log.time_minutes)}min</span>
          <button class="icon-btn" data-delete-log="${log.id}" aria-label="Excluir registro">
            <svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm0 6h2v9H9V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Zm10 0h2v9h-2V9Z" fill="currentColor"/></svg>
          </button>
        </div>
        <p class="log-content">${escapeHtml(log.content)}</p>
        <p class="log-difficulty">${escapeHtml(log.difficulties || 'Sem dificuldades registradas.')}</p>
      </article>
    `
    )
    .join('');
}

function refreshStudentDashboard() {
  const logs = getStudentLogs();
  renderStudentMetrics(logs);
  renderHistory(logs);
}

function openModal() {
  const modal = document.querySelector('#modal');
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.querySelector('#modal');
  modal.classList.remove('open');
  document.querySelector('#new-log-form').reset();
}

function handleCreateLog(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);

  const payload = {
    date: String(data.get('date') || '').trim(),
    discipline: String(data.get('discipline') || '').trim(),
    content: String(data.get('content') || '').trim(),
    time_minutes: Number(data.get('time_minutes') || 0),
    difficulties: String(data.get('difficulties') || '').trim(),
  };

  if (!payload.date || !payload.discipline || !payload.content || !payload.time_minutes) {
    document.querySelector('#modal-error').textContent = 'Preencha os campos obrigatórios.';
    return;
  }

  const logs = getStudyLogs();
  logs.push({ id: createId(), studentId: currentStudent.id, ...payload });
  saveStudyLogs(logs);

  document.querySelector('#modal-error').textContent = '';
  closeModal();
  showToast('Registro salvo!');
  refreshStudentDashboard();
}

function handleHistoryActions(event) {
  const deleteId = event.target.closest('[data-delete-log]')?.dataset.deleteLog;
  if (!deleteId) return;

  const logs = getStudyLogs().filter((log) => !(log.id === deleteId && log.studentId === currentStudent.id));
  saveStudyLogs(logs);
  refreshStudentDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth('estudante');
  if (!user) return;

  currentStudent = user;
  renderStudentHeader();
  refreshStudentDashboard();

  document.querySelector('#logout-btn').addEventListener('click', logoutUser);
  document.querySelector('#new-log-btn').addEventListener('click', openModal);
  document.querySelector('#close-modal').addEventListener('click', closeModal);
  document.querySelector('#modal').addEventListener('click', (event) => {
    if (event.target.id === 'modal') closeModal();
  });
  document.querySelector('#new-log-form').addEventListener('submit', handleCreateLog);
  document.querySelector('#history-list').addEventListener('click', handleHistoryActions);
});
