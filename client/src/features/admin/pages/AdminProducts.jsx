import { useState } from 'react';
import Button from '../../../core/components/Button';
import Spinner from '../../../core/components/Spinner';
import { useListProductsQuery, useDeleteProductMutation } from '../api';
import ProductFormModal from '../components/ProductFormModal';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../core/utils/currency';

export default function AdminProducts() {
  const { i18n } = useTranslation();
  const { data, isLoading } = useListProductsQuery({ limit: 100 });
  const [deleteP, { error: deleteError }] = useDeleteProductMutation();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  function onNew() {
    setEditing(null);
    setOpen(true);
  }
  function onEdit(p) {
    setEditing(p);
    setOpen(true);
  }
  async function onDelete(p) {
    if (!confirm(`Delete product "${p.name.en}"?`)) return;
    try {
      await deleteP(p._id).unwrap();
    } catch {
      /* shown below */
    }
  }

  if (isLoading) return <Spinner full />;
  const items = data?.items || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({items.length})</h2>
        <Button onClick={onNew}>+ New product</Button>
      </div>
      {deleteError && (
        <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {deleteError.data?.message || 'Delete failed'}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-card bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/5 bg-bg text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-start">Image</th>
              <th className="px-4 py-3 text-start">Name (EN / AR)</th>
              <th className="px-4 py-3 text-start">Category</th>
              <th className="px-4 py-3 text-start">Price</th>
              <th className="px-4 py-3 text-start">Available</th>
              <th className="px-4 py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-t border-ink/5">
                <td className="px-4 py-3">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-bg" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name.en}</div>
                  <div className="text-ink-muted">{p.name.ar}</div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{p.category?.name?.en || '—'}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(p.price, i18n.resolvedLanguage)}</td>
                <td className="px-4 py-3">{p.isAvailable ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-end">
                  <button onClick={() => onEdit(p)} className="text-primary hover:underline">Edit</button>
                  <span className="mx-2 text-ink/30">|</span>
                  <button onClick={() => onDelete(p)} className="text-danger hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProductFormModal open={open} onClose={() => setOpen(false)} product={editing} />
    </div>
  );
}
