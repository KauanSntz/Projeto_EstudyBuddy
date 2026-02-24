const MONTHS_SHORT_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function bookIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 6.2c-1.7-1.1-3.8-1.7-6.2-1.7A1.8 1.8 0 0 0 4 6.3v11a1.7 1.7 0 0 0 1.8 1.7c2 0 4 .5 5.7 1.4.3.2.7.2 1 0 1.7-.9 3.7-1.4 5.7-1.4a1.7 1.7 0 0 0 1.8-1.7v-11a1.8 1.8 0 0 0-1.8-1.8c-2.4 0-4.5.6-6.2 1.7Zm-1 11.3A14.2 14.2 0 0 0 6 16.2V6.6c2 0 3.8.5 5 1.5Zm2 0V8.1c1.2-1 3-1.5 5-1.5v9.6c-1.8 0-3.6.5-5 1.3Z" fill="currentColor"/>
    </svg>
  `;
}

function showToast(message) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function formatDatePt(dateValue) {
  if (!dateValue) return '';
  const [year, month, day] = String(dateValue).split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${day} ${MONTHS_SHORT_PT[month - 1]} ${year}`;
}

function formatDateShort(dateValue) {
  if (!dateValue) return '';
  const [year, month, day] = String(dateValue).split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function formatMinutes(minutes) {
  const total = Number(minutes || 0);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${hh}h${String(mm).padStart(2, '0')}m`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
