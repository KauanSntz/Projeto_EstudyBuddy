function requireAuth(expectedRole) {
  const user = getCurrentUser();

  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  if (expectedRole && user.role !== expectedRole) {
    window.location.href = user.role === 'professor' ? 'professor.html' : 'estudante.html';
    return null;
  }

  return user;
}

function redirectIfAuthenticated() {
  const user = getCurrentUser();
  if (!user) return;
  redirectByRole(user);
}
