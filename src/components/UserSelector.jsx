import davidProfile from '../assets/profiles/david.png';
import lindaProfile from '../assets/profiles/linda.png';

function UserSelector({ onSelectUser }) {
  return (
    <section className="card selector-card selector-card--welcome">
      <div className="welcome-badge">Hogar Thorp Rodríguez</div>

      <h1 className="welcome-title">Nuestras Finanzas en Pareja</h1>
      <p className="welcome-text">
        Elige el perfil con el que quieres ingresar y empieza a registrar tus
        gastos del mes de forma rápida y clara para que podamos ir a Japón 🥳.
      </p>

      <div className="profile-grid">
        <button
          className="profile-button profile-button--david"
          onClick={() => onSelectUser('David')}
          type="button"
        >
          <div className="profile-button__image-wrap">
            <img
              src={davidProfile}
              alt="Perfil David"
              className="profile-button__image"
            />
          </div>
          <span className="profile-button__title">David</span>
        </button>

        <button
          className="profile-button profile-button--linda"
          onClick={() => onSelectUser('Linda')}
          type="button"
        >
          <div className="profile-button__image-wrap">
            <img
              src={lindaProfile}
              alt="Perfil Linda"
              className="profile-button__image"
            />
          </div>
          <span className="profile-button__title">Linda</span>
        </button>

        <button
          className="profile-button profile-button--ambos"
          onClick={() => onSelectUser('Ambos')}
          type="button"
        >
          <div className="profile-button__emoji-wrap">🤝</div>
          <span className="profile-button__title">Ambos</span>
          <span className="profile-button__subtitle">
            Gastos compartidos del hogar
          </span>
        </button>
      </div>
    </section>
  );
}

export default UserSelector;