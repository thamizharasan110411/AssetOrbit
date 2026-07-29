import { useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authService } from '../services/authService.js';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    department: user?.department || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      const result = await authService.updateProfile(profile);
      updateUser(result.user);
      addToast('Profile updated.');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    try {
      await authService.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      addToast('Password changed.');
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="User Profile" />

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Profile</h2>
            <UserRound size={20} />
          </div>
          <form className="entity-form" onSubmit={saveProfile}>
            <label>
              Name
              <input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
            </label>
            <label>
              Email
              <input value={user?.email || ''} disabled />
            </label>
            <label>
              Role
              <input value={user?.role || ''} disabled />
            </label>
            <label>
              Department
              <input
                value={profile.department}
                onChange={(event) => setProfile({ ...profile, department: event.target.value })}
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary icon-text" type="submit">
                <Save size={17} />
                Save Profile
              </button>
            </div>
          </form>
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>Change Password</h2>
            <KeyRound size={20} />
          </div>
          <form className="entity-form" onSubmit={changePassword}>
            <label>
              Current Password
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                required
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                minLength={8}
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary icon-text" type="submit">
                <KeyRound size={17} />
                Change Password
              </button>
            </div>
          </form>
        </article>
      </section>
    </>
  );
}
