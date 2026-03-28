import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

import UserSelector from './components/UserSelector';
import MonthSelector from './components/MonthSelector';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import TopBar from './components/TopBar';
import AudioToggle from './components/AudioToggle';
import LoginPage from './components/LoginPage';

import {
  initialAppState,
  persistUser,
  persistMonth,
  clearSessionStorage,
} from './store/appStore';

import {
  login,
  logout,
  validateSession,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from './services/api';

import { USER_THEMES } from './utils/constants';
import ambientAudio from './assets/audio/ambient.mp3';

const SESSION_TOKEN_KEY = 'fp_session_token';
const SESSION_USERNAME_KEY = 'fp_session_username';

function App() {
  const [currentUser, setCurrentUser] = useState(initialAppState.currentUser);
  const [currentMonth, setCurrentMonth] = useState(initialAppState.currentMonth);
  const [records, setRecords] = useState(initialAppState.records);
  const [isMuted, setIsMuted] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordsOverlay, setRecordsOverlay] = useState(null);

  const [sessionToken, setSessionToken] = useState(
    localStorage.getItem(SESSION_TOKEN_KEY) || ''
  );
  const [sessionUsername, setSessionUsername] = useState(
    localStorage.getItem(SESSION_USERNAME_KEY) || ''
  );
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const audioRef = useRef(null);
  const userMutedRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    async function checkStoredSession() {
      const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      const storedUsername = localStorage.getItem(SESSION_USERNAME_KEY);

      if (!storedToken) {
        setIsAuthenticated(false);
        setIsAuthChecking(false);
        return;
      }

      try {
        await validateSession(storedToken);
        setSessionToken(storedToken);
        setSessionUsername(storedUsername || '');
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.removeItem(SESSION_USERNAME_KEY);
        setSessionToken('');
        setSessionUsername('');
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    }

    checkStoredSession();
  }, []);

  const refreshRecords = useCallback(
    async (user = currentUser, month = currentMonth) => {
      if (!user || !month || !sessionToken) return;

      setRecordsOverlay({
        type: 'loading',
        message: 'Cargando registros del mes...',
      });

      let timedOut = false;

      const timeoutId = setTimeout(() => {
        timedOut = true;
        setRecordsOverlay({
          type: 'empty',
          message:
            'No encontramos registros para este mes todavía. Puedes cerrar este aviso y cambiar de mes o usuario.',
        });
      }, 6000);

      try {
        const data = await getRecords(user, month, sessionToken);
        setRecords(data);

        clearTimeout(timeoutId);

        if (data.length > 0) {
          setRecordsOverlay(null);
        } else if (!timedOut) {
          setRecordsOverlay({
            type: 'empty',
            message:
              'No encontramos registros para este mes todavía. Puedes cerrar este aviso y cambiar de mes o usuario.',
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error refrescando registros:', error);
        setRecordsOverlay({
          type: 'error',
          message:
            'Hubo un problema cargando los registros. Intenta de nuevo o revisa el backend.',
        });
      }
    },
    [currentUser, currentMonth, sessionToken]
  );

  useEffect(() => {
    async function loadRecords() {
      if (!currentUser || !currentMonth || !sessionToken || !isAuthenticated) return;
      await refreshRecords(currentUser, currentMonth);
    }

    loadRecords();
  }, [currentUser, currentMonth, sessionToken, isAuthenticated, refreshRecords]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = 0.18;
    audioRef.current.loop = true;
    audioRef.current.muted = false;

    const tryAutoplay = async () => {
      if (!audioRef.current || userMutedRef.current) return;

      try {
        await audioRef.current.play();
        audioUnlockedRef.current = true;
      } catch {
        console.log(
          'Autoplay bloqueado por el navegador. Se activará al primer gesto.'
        );
      }
    };

    const unlockAudio = async () => {
      if (!audioRef.current) return;
      if (userMutedRef.current) return;
      if (audioUnlockedRef.current) return;

      try {
        await audioRef.current.play();
        audioUnlockedRef.current = true;
      } catch (error) {
        console.log('Audio aún bloqueado:', error);
      }
    };

    tryAutoplay();

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  async function handleLogin(username, password) {
    const data = await login(username, password);

    localStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
    localStorage.setItem(SESSION_USERNAME_KEY, data.username);

    setSessionToken(data.sessionToken);
    setSessionUsername(data.username);
    setIsAuthenticated(true);
  }

  async function handleLogout() {
    try {
      if (sessionToken) {
        await logout(sessionToken);
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(SESSION_USERNAME_KEY);
      localStorage.removeItem('fp_user');
      localStorage.removeItem('fp_month');

      setSessionToken('');
      setSessionUsername('');
      setIsAuthenticated(false);
      setCurrentUser('');
      setCurrentMonth('');
      setRecords([]);
      setEditingRecord(null);
      setRecordsOverlay(null);
      clearSessionStorage();
    }
  }

  function handleSelectUser(user) {
    setCurrentUser(user);
    persistUser(user);
  }

  function handleSelectMonth(month) {
    setCurrentMonth(month);
    persistMonth(month);
  }

  function handleBackToUserSelection() {
    setCurrentUser('');
    setCurrentMonth('');
    setRecords([]);
    setEditingRecord(null);
    setRecordsOverlay(null);
    clearSessionStorage();
  }

  function handleChangeMonth() {
    setCurrentMonth('');
    setRecords([]);
    setEditingRecord(null);
    setRecordsOverlay(null);
    localStorage.removeItem('fp_month');
  }

  async function handleCreateRecord(payload) {
    try {
      if (editingRecord) {
        await updateRecord(
          {
            id: editingRecord.id,
            ...payload,
          },
          sessionToken
        );
        setEditingRecord(null);
      } else {
        await createRecord(payload, sessionToken);
      }

      await refreshRecords();
    } catch (error) {
      console.error('Error guardando registro:', error);
      alert('No se pudo guardar el registro. Revisa la consola o el backend.');
    }
  }

  function handleEditRecord(record) {
    setEditingRecord(record);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteRecord(recordId) {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer.'
    );

    if (!confirmed) return;

    try {
      await deleteRecord(recordId, sessionToken);

      if (editingRecord?.id === recordId) {
        setEditingRecord(null);
      }

      await refreshRecords();
    } catch (error) {
      console.error('Error eliminando registro:', error);
      alert('No se pudo eliminar el registro. Revisa la consola o el backend.');
    }
  }

  function handleCancelEdit() {
    setEditingRecord(null);
  }

  async function handleToggleAudio() {
    if (!audioRef.current) return;

    if (isMuted) {
      userMutedRef.current = false;
      setIsMuted(false);

      try {
        await audioRef.current.play();
        audioUnlockedRef.current = true;
      } catch (error) {
        console.error('No se pudo reanudar el audio:', error);
      }
    } else {
      userMutedRef.current = true;
      setIsMuted(true);
      audioRef.current.pause();
    }
  }

  const themeClass = currentUser ? USER_THEMES[currentUser] : 'theme-home';

  return (
    <main className={`app-shell ${themeClass}`}>
      <audio ref={audioRef} src={ambientAudio} preload="auto" />
      <AudioToggle isMuted={isMuted} onToggle={handleToggleAudio} />

      {isAuthChecking ? (
        <section className="card selector-card selector-card--welcome login-card">
          <div className="welcome-badge">Verificando sesión</div>
          <h1 className="welcome-title">Cargando...</h1>
          <p className="welcome-text">Estamos validando tu acceso.</p>
        </section>
      ) : !isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <>
          {recordsOverlay && (
            <div className="records-overlay">
              <div className="records-overlay__card">
                <h3 className="records-overlay__title">
                  {recordsOverlay.type === 'loading' && 'Cargando registros'}
                  {recordsOverlay.type === 'empty' && 'Sin registros'}
                  {recordsOverlay.type === 'error' && 'Error de carga'}
                </h3>

                <p className="records-overlay__text">{recordsOverlay.message}</p>

                {recordsOverlay.type !== 'loading' && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setRecordsOverlay(null)}
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          )}

          {!currentUser ? (
            <UserSelector onSelectUser={handleSelectUser} />
          ) : !currentMonth ? (
            <MonthSelector
              currentUser={currentUser}
              onSelectMonth={handleSelectMonth}
              onBack={handleBackToUserSelection}
            />
          ) : (
            <section className="card main-card">
              <TopBar
                currentUser={currentUser}
                currentMonth={currentMonth}
                sessionUsername={sessionUsername}
                onChangeMonth={handleChangeMonth}
                onLogout={handleLogout}
              />

              <ExpenseForm
                key={editingRecord ? editingRecord.id : 'new-record-form'}
                currentUser={currentUser}
                currentMonth={currentMonth}
                onCreateRecord={handleCreateRecord}
                editingRecord={editingRecord}
                onCancelEdit={handleCancelEdit}
              />

              <ExpenseList
                records={records}
                onEditRecord={handleEditRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;