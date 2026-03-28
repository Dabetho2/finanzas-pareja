import { MONTHS } from '../utils/constants';

function MonthSelector({ currentUser, onSelectMonth, onBack }) {
  return (
    <section className="card selector-card">
      <div className="section-chip">Perfil activo</div>
      <h1 className="section-title">{currentUser}</h1>
      <p className="section-text">
        Selecciona el mes en el que quieres registrar y consultar movimientos.
      </p>

      <div className="months-grid">
        {MONTHS.map((month) => (
          <button
            key={month}
            className="month-tile"
            onClick={() => onSelectMonth(month)}
          >
            {month}
          </button>
        ))}
      </div>

      <button className="secondary-button mt-16" onClick={onBack}>
        Cambiar perfil
      </button>
    </section>
  );
}

export default MonthSelector;