import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/auth_context';
import { API_URL } from '../api_key';

interface IProfileData {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  birthday: string;
  username: string;
  role: {
    id: number;
    role_name: string;
    permission_level: number;
    description: string;
    background_color: string;
    text_color: string;
  };
  stats: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
  };
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth(); 
  const userId = user?.id;
  
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}?endpoint=users&action=get_profile&user_id=${userId}`, 
          { withCredentials: true }
        );
        if (response.data.error) throw new Error(response.data.error);
        setProfile(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Ошибка сети при загрузке профиля');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Произошла непредвиденная ошибка');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!userId) {
    return (
      <div style={styles.profileCenteredState}>
        <div>Авторизуйтесь для просмотра профиля</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.profileCenteredState}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Загрузка профиля...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.profileCenteredState}>
        <div style={styles.profileErrorBlock}>{error || 'Ошибка загрузки'}</div>
      </div>
    );
  }

  const initials = `${profile.first_name[0] || ''}${profile.last_name[0] || ''}`.toUpperCase();

  return (
    <div style={styles.profilePageContainer}>
      <div style={styles.profileWrapper}>
        

        <div style={styles.profileHeaderCard}>
          <div style={styles.profileAvatar}>
            {initials}
          </div>

          <div style={styles.profileHeaderInfo}>
            <div style={styles.profileNameRow}>
              <h1 style={styles.profileMainTitle}>{profile.last_name} {profile.first_name} {profile.middle_name}</h1>
              <span
                style={{
                  ...styles.profileRoleBadge,
                  backgroundColor: profile.role.background_color || '#e2e8f0',
                  color: profile.role.text_color || '#475569',
                }}
              >
                {profile.role.role_name}
              </span>
            </div>
            
            <p style={styles.profileRoleDesc}>
              {profile.role.description || 'Описание роли в системе управления задачами не заполнено.'}
            </p>
            <div style={styles.profileAccessLevel}>
              Уровень доступа в системе: <span style={styles.profileAccessLevelValue}>{profile.role.permission_level}</span>
            </div>
          </div>
        </div>

        <div style={styles.profileGrid}>
          
          <div style={styles.profileAccountDetails}>
            <h2 style={styles.profileSectionTitle}>Данные аккаунта</h2>
            
            <div style={styles.profileDetailsList}>
              <div style={styles.profileDetailsItem}>
                <label style={styles.profileItemLabel}>Имя пользователя</label>
                <span style={styles.profileUsernameText}>@{profile.username}</span>
              </div>
              
              <div style={styles.profileDetailsItem}>
                <label style={styles.profileItemLabel}>Email</label>
                <span style={styles.profileEmailText}>{profile.email}</span>
              </div>
              
              <div style={styles.profileDetailsItem}>
                <label style={styles.profileItemLabel}>Дата рождения</label>
                <span style={styles.profileGenericText}>{profile.birthday}</span>
              </div>
            </div>
          </div>

          <div style={styles.profileStatsSection}>
            <h2 style={styles.profileSectionTitlePadding}>Эффективность работы</h2>
            
            <div style={styles.profileStatsGrid}>
              <div style={{ ...styles.profileStatCard, ...styles.statTotal }}>
                <div style={styles.statLabel}>Всего задач</div>
                <div style={{ ...styles.statValue, color: '#4f46e5' }}>{profile.stats.total}</div>
                <div style={styles.statSub}>закреплено за вами</div>
              </div>

              <div style={{ ...styles.profileStatCard, ...styles.statProgress }}>
                <div style={styles.statLabel}>В работе</div>
                <div style={{ ...styles.statValue, color: '#f59e0b' }}>{profile.stats.in_progress}</div>
                <div style={styles.statSub}>активные спринты</div>
              </div>

              <div style={{ ...styles.profileStatCard, ...styles.statTodo }}>
                <div style={styles.statLabel}>К выполнению</div>
                <div style={{ ...styles.statValue, color: '#3b82f6' }}>{profile.stats.todo}</div>
                <div style={styles.statSub}>в бэклоге задач</div>
              </div>

              <div style={{ ...styles.profileStatCard, ...styles.statDone }}>
                <div style={styles.statLabel}>Выполнено</div>
                <div style={{ ...styles.statValue, color: '#10b981' }}>{profile.stats.done}</div>
                <div style={styles.statSub}>успешные релизы</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const styles = {
  profilePageContainer: {
    minHeight: '100vh',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    padding: window.innerWidth > 768 ? '48px' : '24px',
    fontFamily: 'var(--font-rounded), sans-serif',
    color: '#334155',
    boxSizing: 'border-box' as const,
  },
  profileWrapper: {
    maxWidth: '896px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '32px',
  },
  profileCenteredState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '18px',
    fontFamily: 'var(--font-rounded), sans-serif',
  },
  profileErrorBlock: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  profileHeaderCard: {
    backgroundColor: '#fff',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: window.innerWidth > 768 ? ('row' as const) : ('column' as const),
    alignItems: window.innerWidth > 768 ? ('flex-start' as const) : ('center' as const),
    gap: '24px',
  },
  profileAvatar: {
    width: '96px',
    height: '96px',
    borderRadius: '16px',
    background: 'linear-gradient(to top right, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '30px',
    fontWeight: 600,
    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
    flexShrink: 0,
  },
  profileHeaderInfo: {
    textAlign: window.innerWidth > 768 ? ('left' as const) : ('center' as const),
    width: '100%',
  },
  profileNameRow: {
    display: 'flex',
    flexDirection: window.innerWidth > 768 ? ('row' as const) : ('column' as const),
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  profileMainTitle: {
    fontSize: window.innerWidth > 768 ? '30px' : '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  },
  profileRoleBadge: {
    alignSelf: 'center',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  profileRoleDesc: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '576px',
    margin: '12px 0',
    lineHeight: '1.5',
  },
  profileAccessLevel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  profileAccessLevelValue: {
    fontWeight: 600,
    color: '#475569',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, minmax(0, 1fr))' : '100%',
    gap: '24px',
  },
  profileSectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#94a3b8',
    margin: '0 0 16px 0',
  },
  profileSectionTitlePadding: {
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#94a3b8',
    margin: '0 0 16px 0',
    paddingLeft: '8px',
  },
  profileAccountDetails: {
    backgroundColor: '#fff',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  profileDetailsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    fontSize: '14px',
  },
  profileDetailsItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  profileItemLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px',
  },
  profileUsernameText: {
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#334155',
  },
  profileEmailText: {
    wordBreak: 'break-all' as const,
    fontWeight: 600,
    color: '#334155',
  },
  profileGenericText: {
    fontWeight: 600,
    color: '#334155',
  },
  profileStatsSection: {
    width: '100%',
  },
  profileStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },
  profileStatCard: {
    backgroundColor: '#fff',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
  },
  statValue: {
    fontSize: '30px',
    fontWeight: 700,
    marginTop: '8px',
  },
  statSub: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  statTotal: {
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
  statProgress: {
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
  statTodo: {
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
  statDone: {
    border: '1px solid rgba(226, 232, 240, 0.8)',
  },
};