import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', text = 'Records will appear once activity is available.' }) {
  return (
    <div className="empty-state compact">
      <Inbox size={30} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
