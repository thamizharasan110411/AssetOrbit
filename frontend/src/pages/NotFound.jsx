import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFound() {
  return (
    <main className="not-found">
      <Compass size={42} />
      <h1>Page not found</h1>
      <Link className="btn btn-primary" to="/dashboard">
        Go to Dashboard
      </Link>
    </main>
  );
}
