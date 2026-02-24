document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuthenticated();

  const form = document.querySelector('#cadastro-form');
  const errorEl = document.querySelector('#cadastro-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorEl.textContent = '';

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      role: String(formData.get('role') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || ''),
    };

    if (!payload.name || !payload.role || !payload.email || !payload.password) {
      errorEl.textContent = 'Preencha todos os campos.';
      return;
    }

    const result = registerUser(payload);

    if (!result.ok) {
      errorEl.textContent = result.message;
      return;
    }

    showToast('Cadastro realizado com sucesso!');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 700);
  });
});
