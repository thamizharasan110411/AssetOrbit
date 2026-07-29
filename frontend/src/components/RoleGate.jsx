import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function RoleGate({ roles, children }) {
  const { user } = useAuth();

  if (!roles.includes(user?.role)) {
    return (
      <section className="empty-state">
        <ShieldAlert size={34} />
        <h2>Access restricted</h2>
        <p>Your role does not include access to this workspace.</p>
      </section>
    );
  }

  return children;
}
