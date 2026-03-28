export const initialAppState = {
  currentUser: localStorage.getItem('fp_user') || '',
  currentMonth: localStorage.getItem('fp_month') || '',
  records: [],
};

export function persistUser(user) {
  localStorage.setItem('fp_user', user);
}

export function persistMonth(month) {
  localStorage.setItem('fp_month', month);
}

export function clearSessionStorage() {
  localStorage.removeItem('fp_user');
  localStorage.removeItem('fp_month');
}