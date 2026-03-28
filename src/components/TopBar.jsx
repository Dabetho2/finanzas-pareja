const DASHBOARD_URL =
  'https://docs.google.com/spreadsheets/d/1WnKDBGQbScuLGOji2JL99CiGTeBMwX0Wu0iMZCb7mNw/edit?gid=1787797727#gid=1787797727';

function TopBar({
  currentUser,
  currentMonth,
  sessionUsername,
  onChangeMonth,
  onLogout,
}) {
  return (
    <header className="topbar">
      <div>
        <div className="section-chip">Sesión activa</div>
        <h1 className="topbar-title">
          {currentUser} · {currentMonth}
        </h1>
        <p className="muted">
          Registra y consulta tus gastos del mes.
          {sessionUsername ? ` Conectado como: ${sessionUsername}.` : ''}
        </p>
      </div>

      <div className="topbar-actions">
        <a
          href={DASHBOARD_URL}
          target="_blank"
          rel="noreferrer"
          className="secondary-button"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Ver dashboard
        </a>

        <button type="button" className="secondary-button" onClick={onChangeMonth}>
          Cambiar mes
        </button>

        <button type="button" className="secondary-button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default TopBar;