let currentStudent = null;
let editingLogId = null;

function getStudentLogs() {
  if (!currentStudent) return [];

  return getStudyLogs()
    .filter((log) => log.studentId === currentStudent.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderStudentHeader() {
  const greeting = document.querySelector('#student-greeting');
  if (!greeting || !currentStudent) return;

  greeting.textContent = `Olá, ${currentStudent.name}`;
}

function renderStudentMetrics(logs) {
  const metricRegistros = document.querySelector('#metric-registros');
  const metricTempo = document.querySelector('#metric-tempo');
  if (!metricRegistros || !metricTempo) return;

  const totalRegistros = logs.length;
  const totalMinutes = logs.reduce((sum, log) => sum + Number(log.time_minutes || 0), 0);

  metricRegistros.textContent = totalRegistros;
  metricTempo.textContent = formatMinutes(totalMinutes);
}

function renderHistory(logs) {
  const list = document.querySelector('#history-list');
  if (!list) return;

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
          <button class="icon-btn" data-edit-log="${log.id}" aria-label="Editar registro">
            Editar
          </button>
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

function setModalMode(isEditing) {
  const title = document.querySelector('#modal-title');
  const submitBtn = document.querySelector('#submit-modal');
  if (title) title.textContent = isEditing ? 'Editar Registro de Estudo' : 'Novo Registro de Estudo';
  if (submitBtn) submitBtn.textContent = isEditing ? 'Salvar alterações' : 'Salvar';
}

function openModal(logToEdit = null) {
  const modal = document.querySelector('#modal');
  const form = document.querySelector('#new-log-form');
  const modalError = document.querySelector('#modal-error');
  if (!modal || !form || !modalError) return;

  editingLogId = logToEdit?.id || null;
  setModalMode(Boolean(logToEdit));
  modalError.textContent = '';

  if (logToEdit) {
    const dateInput = document.querySelector('#date');
    const timeInput = document.querySelector('#time_minutes');
    const disciplineInput = document.querySelector('#discipline');
    const contentInput = document.querySelector('#content');
    const difficultiesInput = document.querySelector('#difficulties');

    if (dateInput) dateInput.value = logToEdit.date || '';
    if (timeInput) timeInput.value = Number(logToEdit.time_minutes || 0) || '';
    if (disciplineInput) disciplineInput.value = logToEdit.discipline || '';
    if (contentInput) contentInput.value = logToEdit.content || '';
    if (difficultiesInput) difficultiesInput.value = logToEdit.difficulties || '';
  } else {
    form.reset();
  }

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.querySelector('#modal');
  const form = document.querySelector('#new-log-form');
  const modalError = document.querySelector('#modal-error');
  if (!modal || !form || !modalError) return;

  modal.classList.remove('open');
  form.reset();
  modalError.textContent = '';
  editingLogId = null;
  setModalMode(false);
}

function handleSaveLog(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const modalError = document.querySelector('#modal-error');
  if (!form || !modalError || !currentStudent) return;

  const data = new FormData(form);

  const payload = {
    date: String(data.get('date') || '').trim(),
    discipline: String(data.get('discipline') || '').trim(),
    content: String(data.get('content') || '').trim(),
    time_minutes: Number(data.get('time_minutes') || 0),
    difficulties: String(data.get('difficulties') || '').trim(),
  };

  if (!payload.date || !payload.discipline || !payload.content || !payload.time_minutes) {
    modalError.textContent = 'Preencha os campos obrigatórios.';
    return;
  }

  if (editingLogId) {
    const logs = getStudyLogs();
    const target = logs.find((log) => log.id === editingLogId);

    if (!target || target.studentId !== currentStudent.id) {
      modalError.textContent = 'Você só pode editar seus próprios registros.';
      return;
    }

    const updated = logs.map((log) => {
      if (log.id !== editingLogId) return log;
      return { ...log, ...payload, studentId: currentStudent.id };
    });

    saveStudyLogs(updated);
    closeModal();
    showToast('Registro atualizado!');
    refreshStudentDashboard();
    return;
  }

  const logs = getStudyLogs();
  logs.push({ id: createId(), studentId: currentStudent.id, ...payload });
  saveStudyLogs(logs);

  closeModal();
  showToast('Registro salvo!');
  refreshStudentDashboard();
}

function handleHistoryActions(event) {
  if (!currentStudent) return;

  const editId = event.target.closest('[data-edit-log]')?.dataset.editLog;
  if (editId) {
    const log = getStudyLogs().find((item) => item.id === editId && item.studentId === currentStudent.id);
    if (log) openModal(log);
    return;
  }

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

  const logoutBtn = document.querySelector('#logout-btn');
  const newLogBtn = document.querySelector('#new-log-btn');
  const closeModalBtn = document.querySelector('#close-modal');
  const cancelModalBtn = document.querySelector('#cancel-modal');
  const modal = document.querySelector('#modal');
  const newLogForm = document.querySelector('#new-log-form');
  const historyList = document.querySelector('#history-list');

  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
  if (newLogBtn) newLogBtn.addEventListener('click', () => openModal());
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target.id === 'modal') closeModal();
    });
  }
  if (newLogForm) newLogForm.addEventListener('submit', handleSaveLog);
  if (historyList) historyList.addEventListener('click', handleHistoryActions);
});
