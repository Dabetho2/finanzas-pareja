const API_BASE_URL =
  'https://script.google.com/macros/s/AKfycbxSe3w4ZQANXHo8nMZFqRocY9PcdoNjcYUXmxfRHOuEJqZrmmD7HvRyK2JREQCF4PK4/exec';

function convertDisplayDateToISO(dateDisplay) {
  if (!dateDisplay || typeof dateDisplay !== 'string') return '';

  const parts = dateDisplay.split('/');
  if (parts.length !== 3) return '';

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

async function safeJsonParse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respuesta no válida del backend: ${text}`);
  }
}

export async function getRecords(user, month) {
  const url = new URL(API_BASE_URL);
  url.searchParams.set('action', 'readRecords');
  url.searchParams.set('user', user);
  url.searchParams.set('month', month);

  const response = await fetch(url.toString(), {
    method: 'GET',
  });

  const data = await safeJsonParse(response);

  if (!data.success) {
    throw new Error(data.message || 'No se pudieron obtener los registros.');
  }

  return (data.records || []).map((record) => ({
    ...record,
    value: Number(record.value) || 0,
    dateISO: convertDisplayDateToISO(record.dateDisplay),
  }));
}

export async function createRecord(payload) {
  const body = {
    action: 'createRecord',
    ...payload,
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  const data = await safeJsonParse(response);

  if (!data.success) {
    throw new Error(data.message || 'No se pudo crear el registro.');
  }

  return data;
}

export async function updateRecord(payload) {
  const body = {
    action: 'updateRecord',
    ...payload,
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  const data = await safeJsonParse(response);

  if (!data.success) {
    throw new Error(data.message || 'No se pudo actualizar el registro.');
  }

  return data;
}

export async function deleteRecord(recordId) {
  const body = {
    action: 'deleteRecord',
    id: recordId,
  };

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(body),
  });

  const data = await safeJsonParse(response);

  if (!data.success) {
    throw new Error(data.message || 'No se pudo eliminar el registro.');
  }

  return data;
}