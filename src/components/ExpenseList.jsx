import { formatCurrency } from '../utils/formatters';
import { CATEGORY_ICONS } from '../utils/constants';

function getCreatedAtParts(createdAt) {
  if (!createdAt || typeof createdAt !== 'string') {
    return { date: '', time: '' };
  }

  const normalized = createdAt.trim();
  if (!normalized) {
    return { date: '', time: '' };
  }

  const parts = normalized.split(' ');
  if (parts.length >= 2) {
    return {
      date: parts[0],
      time: parts.slice(1).join(' '),
    };
  }

  return {
    date: normalized,
    time: '',
  };
}

function ExpenseList({ records, onEditRecord, onDeleteRecord }) {
  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-chip">Historial</div>
          <h2>Registros del mes</h2>
        </div>
      </div>

      {!records.length ? (
        <p className="muted">Aún no hay registros para este mes.</p>
      ) : (
        <div className="records-list">
          {records.map((record) => {
            const icon = CATEGORY_ICONS[record.category];
            const createdAtInfo = getCreatedAtParts(record.createdAt);

            return (
              <article key={record.id} className="record-card">
                <div className="record-card__icon">
                  {icon ? (
                    <img src={icon} alt={record.category} />
                  ) : (
                    <div className="record-card__icon-placeholder">?</div>
                  )}
                </div>

                <div className="record-card__content">
                  <div className="record-card__top">
                    <strong>{record.category}</strong>

                    <div
                      style={{
                        display: 'grid',
                        justifyItems: 'end',
                        gap: '2px',
                      }}
                    >
                      <span className="record-card__date">
                        {record.dateDisplay}
                      </span>

                      {createdAtInfo.time && (
                        <span
                          className="record-card__responsible"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {createdAtInfo.time}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="record-card__concept">{record.concept}</div>

                  <div className="record-card__bottom">
                    <span className="record-card__value">
                      {formatCurrency(record.value)}
                    </span>
                    <span className="record-card__responsible">
                      {record.responsible}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginTop: '8px',
                    }}
                  >
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onEditRecord(record)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onDeleteRecord(record.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ExpenseList;