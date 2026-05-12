import { useState } from 'react';
import Button from '../../../core/components/Button';
import Spinner from '../../../core/components/Spinner';
import { useListCategoriesQuery, useDeleteCategoryMutation } from '../api';
import CategoryFormModal from '../components/CategoryFormModal';

export default function AdminCategories() {
  const { data: items = [], isLoading } = useListCategoriesQuery();
  const [deleteCat, { error: deleteError }] = useDeleteCategoryMutation();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  function onNew() {
    setEditing(null);
    setOpen(true);
  }
  function onEdit(c) {
    setEditing(c);
    setOpen(true);
  }
  async function onDelete(c) {
    if (!confirm(`Delete category "${c.name.en}"?`)) return;
    try {
      await deleteCat(c._id).unwrap();
    } catch {
      /* surfaced below */
    }
  }

  if (isLoading) return <Spinner full />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={onNew}>+ New category</Button>
      </div>
      {deleteError && (
        <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {deleteError.data?.message || 'Delete failed'}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-card bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/5 bg-bg text-start text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-start">Image</th>
              <th className="px-4 py-3 text-start">Name (EN / AR)</th>
              <th className="px-4 py-3 text-start">Slug</th>
              <th className="px-4 py-3 text-start">Order</th>
              <th className="px-4 py-3 text-start">Active</th>
              <th className="px-4 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-t border-ink/5">
                <td className="px-4 py-3">
                  {c.image ? (
                    <img src={c.image} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-bg" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{c.name.en}</div>
                  <div className="text-ink-muted">{c.name.ar}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">{c.order}</td>
                <td className="px-4 py-3">{c.isActive ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-end">
                  <button onClick={() => onEdit(c)} className="text-primary hover:underline">Edit</button>
                  <span className="mx-2 text-ink/30">|</span>
                  <button onClick={() => onDelete(c)} className="text-danger hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CategoryFormModal open={open} onClose={() => setOpen(false)} category={editing} />
    </div>
  );
}
