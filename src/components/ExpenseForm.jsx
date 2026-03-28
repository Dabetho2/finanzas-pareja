import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/constants';
import {
  extractDigits,
  formatBogotaDateTime,
  formatCOPInput,
  formatISODateToDisplay,
  getBogotaTodayISO,
  getMonthNameFromISO,
} from '../utils/formatters';

function getInitialFormData(editingRecord) {
  if (editingRecord) {
    return {
      dateISO: editingRecord.dateISO,
      category: editingRecord.category,
      concept: editingRecord.concept,
      value: String(editingRecord.value),
    };
  }

  return {
    dateISO: getBogotaTodayISO(),
    category: '',
    concept: '',
    value: '',
  };
}

function ExpenseForm({
  currentUser,
  currentMonth,
  onCreateRecord,
  editingRecord,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(editingRecord));
  const [message, setMessage] = useState(
    editingRecord ? 'Editando registro seleccionado.' : ''
  );
  const [messageType, setMessageType] = useState(editingRecord ? 'success' : '');
  const [bogotaNow, setBogotaNow] = useState(formatBogotaDateTime());
  const [bogotaTodayISO, setBogotaTodayISO] = useState(getBogotaTodayISO());

  useEffect(() => {
    const updateBogotaClock = () => {
      setBogotaNow(formatBogotaDateTime());
      setBogotaTodayISO(getBogotaTodayISO());
    };

    updateBogotaClock();

    const intervalId = setInterval(updateBogotaClock, 30000);

    return () => clearInterval(intervalId);
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === 'value') {
      setFormData((prev) => ({
        ...prev,
        value: extractDigits(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.dateISO) {
      setMessage('Debes seleccionar una fecha válida.');
      setMessageType('error');
      return;
    }

    if (!formData.category) {
      setMessage('Debes seleccionar una categoría.');
      setMessageType('error');
      return;
    }

    if (formData.concept.trim().length < 2) {
      setMessage('El concepto debe tener al menos 2 caracteres.');
      setMessageType('error');
      return;
    }

    if (!Number(formData.value) || Number(formData.value) <= 0) {
      setMessage('El valor debe ser un número mayor que 0.');
      setMessageType('error');
      return;
    }

    await onCreateRecord({
      dateISO: formData.dateISO,
      dateDisplay: formatISODateToDisplay(formData.dateISO),
      monthName: getMonthNameFromISO(formData.dateISO),
      category: formData.category,
      concept: formData.concept.trim(),
      value: Number(formData.value),
      responsible: currentUser,
      createdBy: currentUser,
      createdAt: editingRecord?.createdAt || bogotaNow,
    });

    setFormData(getInitialFormData(null));

    setMessage(
      editingRecord
        ? 'Registro actualizado correctamente.'
        : 'Registro guardado correctamente.'
    );
    setMessageType('success');
  }

  function handleCancel() {
    setFormData(getInitialFormData(null));
    setMessage('');
    setMessageType('');
    onCancelEdit();
  }

  const selectedIcon = formData.category
    ? CATEGORY_ICONS[formData.category]
    : null;

  const selectedDateDisplay = formatISODateToDisplay(formData.dateISO);
  const currentBogotaMonth = useMemo(
    () => getMonthNameFromISO(bogotaTodayISO),
    [bogotaTodayISO]
  );

  const isWorkingOnDifferentMonth =
    currentMonth && currentBogotaMonth && currentMonth !== currentBogotaMonth;

  return (
    <section className="section-block">
      <div className="section-header">
        <div>
          <div className="section-chip">Registro</div>
          <h2>{editingRecord ? 'Editar gasto' : 'Nuevo gasto'}</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            Hora estándar de Cali: <strong>{bogotaNow}</strong>
          </p>
          <p className="muted" style={{ marginTop: 6 }}>
            Fecha seleccionada para registrar:{' '}
            <strong>{selectedDateDisplay}</strong>
          </p>
        </div>

        {selectedIcon && (
          <div className="selected-category-preview">
            <img src={selectedIcon} alt={formData.category} />
          </div>
        )}
      </div>

      {isWorkingOnDifferentMonth && (
        <div className="form-message error" style={{ marginTop: 16 }}>
          Estás trabajando en <strong>{currentMonth}</strong>, pero la fecha actual
          de Cali corresponde a <strong>{currentBogotaMonth}</strong>. Si vas a
          registrar un gasto de ese mes distinto, cambia la fecha manualmente antes
          de guardar.
        </div>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Fecha del gasto
          <input
            type="date"
            name="dateISO"
            value={formData.dateISO}
            onChange={handleChange}
          />
        </label>

        <label>
          Fecha actual
          <input type="text" value={selectedDateDisplay} disabled />
        </label>

        <label>
          Categoría
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Concepto
          <input
            type="text"
            name="concept"
            value={formData.concept}
            onChange={handleChange}
            placeholder="Ej: concentrado, energía, domicilio"
          />
        </label>

        <label>
          Valor
          <input
            type="text"
            inputMode="numeric"
            name="value"
            value={formatCOPInput(formData.value)}
            onChange={handleChange}
            placeholder="$ 45.000"
          />
        </label>

        <label>
          Responsable
          <input type="text" value={currentUser} disabled />
        </label>

        <button type="submit" className="primary-button">
          {editingRecord ? 'Actualizar gasto' : 'Guardar gasto'}
        </button>

        {editingRecord && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleCancel}
          >
            Cancelar edición
          </button>
        )}
      </form>

      {message && (
        <div className={`form-message ${messageType}`}>{message}</div>
      )}
    </section>
  );
}

export default ExpenseForm;