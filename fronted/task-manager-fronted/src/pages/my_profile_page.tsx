import React, { useState } from 'react';
import { useAuth } from '../context/auth_context';
import { useDesignMode } from '../context/design_context';
import { theme } from '../themes/themes';
import { AnimatedBackground } from '../components/animated_background';
import DefaultButton from '../components/default_button';
import { api } from '../api_axios';
import FormInput from '../components/form_input';
import { useNavigate } from 'react-router-dom';
import { UserSessionsBlock } from '../components/UserSessionsBlock';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { mode } = useDesignMode();
  const activeTheme = theme.modes[mode];

  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [lastName, setLastName] = useState<string>(user?.last_name || '');
  const [firstName, setFirstName] = useState<string>(user?.first_name || '');
  const [middleName, setMiddleName] = useState<string>(user?.middle_name || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [birthday, setBirthday] = useState<string>(user?.birthday || '');

  if (!user) {
    return (
      <div style={styles.profileCenteredState}>
        <div style={styles.backgroundFixedWrapper}>
          <AnimatedBackground />
        </div>
        <div style={{ zIndex: 2 }}>Авторизуйтесь для просмотра профиля</div>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const payload = {
      last_name: lastName,
      first_name: firstName,
      middle_name: middleName,
      username: username,
      birthday: birthday,
    };

    try {
      const response = await api.post('', 
        payload, 
        { params: { endpoint: 'users', action: 'update_profile' } }
      );

      if (response.data && response.data.success) {
        const updatedUser = { ...user, ...payload };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (typeof setUser === 'function') {
          setUser(updatedUser);
        }
        setIsEditing(false);
      } else {
        setErrorMessage(response.data.message || 'Не удалось обновить профиль.');
      }
    } catch (err) {
      setErrorMessage('Произошла сетевая ошибка.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      <div style={styles.backgroundFixedWrapper}>
        <AnimatedBackground />
      </div>

      <div style={styles.pageContainer}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>{isEditing ? 'Редактирование профиля' : 'Мой профиль'}</h1>
            <p style={styles.subtitle}>
              {isEditing ? 'Измените системные данные учетной записи' : 'Персональные данные вашего аккаунта'}
            </p>
          </div>
          <div style = {{display: "flex", flexDirection: "row", gap: "10px"}}>
          {!isEditing && (
            <DefaultButton 
              text="Редактировать профиль" 
              onClick={() => setIsEditing(true)} 
            />
          )}
          {!isEditing && (
            <DefaultButton 
              text="Смена пароля" 
              status='danger'
              onClick={() => navigate('/profile-changepassword')} 
            />
          )}
          </div>
        </div>

        <div style={styles.scrollContainer}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ ...activeTheme.searchBar, ...styles.editFormCard, borderRadius: theme.borderRadius.xlarge }}>
              <h2 style={styles.cardSectionTitle}>Личные данные</h2>
              
              {errorMessage && (
                <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>
                  {errorMessage}
                </div>
              )}

              <div style={styles.formGrid}>
                <FormInput 
                  id="last_name"
                  label="Фамилия"
                  type="text"
                  value={lastName}
                  onChange={setLastName}
                  placeholder="Введите фамилию"
                />

                <FormInput 
                  id="first_name"
                  label="Имя"
                  type="text"
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="Введите имя"
                />

                <FormInput 
                  id="middle_name"
                  label="Отчество"
                  type="text"
                  value={middleName}
                  onChange={setMiddleName}
                  placeholder="Введите отчество (если есть)"
                />

                <FormInput 
                  id="username"
                  label="Username"
                  type="text"
                  value={username}
                  onChange={setUsername}
                  placeholder="Придумайте никнейм"
                />

                <FormInput 
                  id="birthday"
                  label="Дата рождения"
                  type="date-only"
                  value={birthday}
                  onChange={setBirthday}
                  placeholder="ГГГГ-ММ-ДД"
                />
              </div>

              <div style={styles.formActions}>
                <DefaultButton
                  onClick={() => setIsEditing(false)}
                  text='Отмена'
                  status='secondary'
                />
                <DefaultButton 
                  text={isLoading ? "Сохранение..." : "Сохранить изменения"} 
                  onClick={handleSave} 
                />
              </div>
            </form>
          ) : (
            <div style={styles.cloudsContainer}>
              <div style={{ ...activeTheme.searchBar, ...styles.cloudCard, borderRadius: theme.borderRadius.xlarge }}>
                <div style={styles.userProfileCell}>
                  <div style={styles.avatar}>{initials}</div>
                  <div>
                    <span style={styles.fullNameText}>
                      {user.last_name} {user.first_name} {user.middle_name ?? ""}
                    </span>
                    <div style={styles.systemRoleText}>Системный аккаунт</div>
                  </div>
                </div>
              </div>

              <div style={styles.cloudsGrid}>
                <div style={{ ...activeTheme.searchBar, ...styles.cloudCard, borderRadius: theme.borderRadius.xlarge }}>
                  <span style={styles.infoLabel}>Имя пользователя</span>
                  <span style={styles.usernameText}>@{user.username}</span>
                </div>

                <div style={{ ...activeTheme.searchBar, ...styles.cloudCard, borderRadius: theme.borderRadius.xlarge }}>
                  <span style={styles.infoLabel}>Электронная почта</span>
                  <span style={styles.infoValue}>{user.email}</span>
                </div>

                <div style={{ ...activeTheme.searchBar, ...styles.cloudCard, borderRadius: theme.borderRadius.xlarge }}>
                  <span style={styles.infoLabel}>Дата рождения</span>
                  <span style={styles.infoValue}>{user.birthday || 'Не указана'}</span>
                </div>
              </div>

              <div style={{ width: "100%" }}>
                <UserSessionsBlock />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    overflow: "hidden",
    zIndex: 2,
    fontFamily: "var(--font-rounded)"
  },
  backgroundFixedWrapper: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 1,
    pointerEvents: "none" as const,
  },
  profileCenteredState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    color: '#64748b',
    fontSize: '18px',
    fontFamily: 'var(--font-rounded), sans-serif',
  },
  headerRow: { 
    paddingTop: "50px",
    paddingLeft: "120px",
    paddingRight: "20px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "auto"
  },
  title: { fontSize: "26px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  scrollContainer: {
    paddingLeft: "120px",
    paddingRight: "20px",
    paddingTop: "15px",
    paddingBottom: "30px",
    flex: 1,
    overflowY: "auto" as const,
    WebkitMaskImage: `
        linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
    `,
    maskImage: `
        linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
    `,
    WebkitMaskComposite: "source-in" as const,
    maskComposite: "intersect" as const,
  },
  cloudsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
    width: "100%"
  },
  cloudsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    width: "100%"
  },
  cloudCard: {
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center"
  },
  userProfileCell: { display: "flex", alignItems: "center", gap: "16px" },
  avatar: { width: "46px", height: "46px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#7177f4" },
  fullNameText: { fontSize: "18px", fontWeight: 700, color: "#1e293b" },
  systemRoleText: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },
  usernameText: { fontSize: "16px", color: "#7177f4", fontWeight: 600, marginTop: "6px" },
  infoLabel: { fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  infoValue: { fontSize: "16px", color: "#334155", fontWeight: 600, marginTop: "6px" },
  editFormCard: {
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px"
  },
  cardSectionTitle: { fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px"
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px"
  }
};