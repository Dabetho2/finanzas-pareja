import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Debes ingresar usuario y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLogin(username.trim(), password);
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card selector-card selector-card--welcome login-card">
      <div className="welcome-badge">Acceso privado</div>
      <h1 className="welcome-title">Iniciar sesión</h1>
      <p className="welcome-text">
        Ingresa con tu usuario y contraseña para acceder a las finanzas del hogar.
      </p>

      <form className="form mt-16" onSubmit={handleSubmit}>
        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ej: david"
            autoComplete="username"
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      {errorMessage && (
        <div className="form-message error">{errorMessage}</div>
      )}
    </section>
  );
}

export default LoginPage;