import Spinner from '../../../core/components/Spinner';
import { useListUsersQuery, useSetUserBlockedMutation } from '../api';

export default function AdminUsers() {
  const { data, isLoading } = useListUsersQuery({ limit: 100 });
  const [setBlocked, { error }] = useSetUserBlockedMutation();
  if (isLoading) return <Spinner full />;
  const items = data?.items || [];

  return (
    <div>
      <h2 className="text-xl font-semibold">Users ({items.length})</h2>
      {error && (
        <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error.data?.message || 'Action failed'}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-card bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/5 bg-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Role</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Joined</th>
              <th className="px-4 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u._id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">
                  {u.isBlocked ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">Blocked</span>
                  ) : (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-end">
                  <button
                    onClick={() => setBlocked({ id: u._id, isBlocked: !u.isBlocked })}
                    className={u.isBlocked ? 'text-success hover:underline' : 'text-danger hover:underline'}
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
