document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuthenticated();

  const form = document.querySelector('#cadastro-form');
  const generalErrorEl = document.querySelector('#cadastro-error');
  const fields = {
    name: document.querySelector('#name'),
    role: document.querySelector('#role'),
    email: document.querySelector('#email'),
    password: document.querySelector('#password'),
    confirm_password: document.querySelector('#confirm-password'),
  };
  const fieldErrors = {
    name: document.querySelector('#name-error'),
    role: document.querySelector('#role-error'),
    email: document.querySelector('#email-error'),
    password: document.querySelector('#password-error'),
    confirm_password: document.querySelector('#confirm-password-error'),
  };

  if (!form || !generalErrorEl) return;

  function clearErrors() {
    generalErrorEl.textContent = '';
    Object.values(fieldErrors).forEach((errorEl) => {
      if (errorEl) errorEl.textContent = '';
    });
  }

  function setFieldError(fieldName, message) {
    const errorEl = fieldErrors[fieldName];
    if (errorEl) errorEl.textContent = message;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      role: String(formData.get('role') || '').trim() || 'estudante',
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
      confirm_password: String(formData.get('confirm_password') || ''),
    };

    let hasError = false;

    if (!payload.name) {
      hasError = true;
      setFieldError('name', 'Informe seu nome.');
    }

    if (!payload.role) {
      hasError = true;
      setFieldError('role', 'Selecione um perfil.');
    }

    if (!payload.email.trim()) {
      hasError = true;
      setFieldError('email', 'Informe um email.');
    } else if (!isValidEmail(payload.email)) {
      hasError = true;
      setFieldError('email', 'Email inválido.');
    } else if (findUserByEmail(payload.email)) {
      hasError = true;
      setFieldError('email', 'Este email já está cadastrado.');
    }

    if (!payload.password) {
      hasError = true;
      setFieldError('password', 'Informe uma senha.');
    } else if (payload.password.length < 6) {
      hasError = true;
      setFieldError('password', 'A senha deve ter pelo menos 6 caracteres.');
    }

    if (!payload.confirm_password) {
      hasError = true;
      setFieldError('confirm_password', 'Confirme sua senha.');
    } else if (payload.password !== payload.confirm_password) {
      hasError = true;
      setFieldError('confirm_password', 'As senhas não coincidem.');
    }

    if (hasError) {
      generalErrorEl.textContent = 'Corrija os campos destacados para continuar.';
      return;
    }

    const result = registerUser(payload);

    if (!result.ok) {
      generalErrorEl.textContent = result.message;
      if (result.message.toLowerCase().includes('email')) {
        setFieldError('email', result.message);
      }
      return;
    }

    showToast('Cadastro realizado com sucesso!');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 700);
  });

  Object.entries(fields).forEach(([key, input]) => {
    if (!input) return;
    input.addEventListener('input', () => {
      const err = fieldErrors[key];
      if (err) err.textContent = '';
      if (generalErrorEl) generalErrorEl.textContent = '';
    });
  });
});
