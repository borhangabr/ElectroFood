import { useEffect, useState } from 'react';
import Modal from './Modal';
import Button from '../../../core/components/Button';
import Input from '../../../core/components/Input';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useListCategoriesQuery,
} from '../api';

const EMPTY = {
  nameEn: '',
  nameAr: '',
  descEn: '',
  descAr: '',
  price: 0,
  category: '',
  isAvailable: true,
};

export default function ProductFormModal({ open, onClose, product }) {
  const { data: categories = [] } = useListCategoriesQuery();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [createP, c] = useCreateProductMutation();
  const [updateP, u] = useUpdateProductMutation();
  const busy = c.isLoading || u.isLoading;
  const error = c.error || u.error;

  useEffect(() => {
    if (product) {
      setForm({
        nameEn: product.name?.en || '',
        nameAr: product.name?.ar || '',
        descEn: product.description?.en || '',
        descAr: product.description?.ar || '',
        price: product.price ?? 0,
        category: product.category?._id || product.category || '',
        isAvailable: !!product.isAvailable,
      });
    } else {
      setForm({ ...EMPTY, category: categories[0]?._id || '' });
    }
    setFile(null);
  }, [product, open, categories]);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', JSON.stringify({ en: form.nameEn, ar: form.nameAr }));
    fd.append('description', JSON.stringify({ en: form.descEn, ar: form.descAr }));
    fd.append('price', String(form.price));
    fd.append('category', form.category);
    fd.append('isAvailable', String(form.isAvailable));
    if (file) fd.append('image', file);

    try {
      if (product) await updateP({ id: product._id, formData: fd }).unwrap();
      else await createP(fd).unwrap();
      onClose();
    } catch {
      /* shown below */
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit product' : 'New product'}>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          <Input label="Name (AR)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description (EN)</label>
            <textarea
              value={form.descEn}
              onChange={(e) => setForm({ ...form, descEn: e.target.value })}
              rows={2}
              className="block w-full rounded-md border border-ink/15 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description (AR)</label>
            <textarea
              value={form.descAr}
              onChange={(e) => setForm({ ...form, descAr: e.target.value })}
              rows={2}
              className="block w-full rounded-md border border-ink/15 bg-surface px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="block w-full rounded-md border border-ink/15 bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name.en}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
          />
          Available
        </label>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {product?.image && !file && (
            <img src={product.image} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />
          )}
        </div>
        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error.data?.message || 'Failed'}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
