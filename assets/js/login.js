document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuthenticated();

  const form = document.querySelector('#login-form');
  const errorEl = document.querySelector('#login-error');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorEl.textContent = '';

    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      errorEl.textContent = 'Preencha email e senha.';
      return;
    }

    const result = loginUser({ email, password });

    if (!result.ok) {
      errorEl.textContent = result.message;
      return;
    }

    redirectByRole(result.user);
  });
});
