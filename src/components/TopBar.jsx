function TopBar({ currentUser, currentMonth, onChangeMonth, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <div className="section-chip">Sesión activa</div>
        <h1 className="mb-4 topbar-title">
          {currentUser} · {currentMonth}
        </h1>
        <p className="muted">Registra y consulta tus gastos del mes.</p>
      </div>

      <div className="topbar-actions">
        <button className="secondary-button" onClick={onChangeMonth}>
          Cambiar mes
        </button>
        <button className="secondary-button" onClick={onLogout}>
          Salir
        </button>
      </div>
    </div>
  );
}

export default TopBar;