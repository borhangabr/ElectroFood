import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from '../../../core/components/Button';
import Input from '../../../core/components/Input';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../api';

const EMPTY = { nameEn: '', nameAr: '', slug: '', order: 0, isActive: true };

/**
 * Reused for both create and edit (pass `category` for edit). Submits as
 * multipart/form-data because optional image upload uses the same endpoint.
 */
export default function CategoryFormModal({ open, onClose, category }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [createCat, c] = useCreateCategoryMutation();
  const [updateCat, u] = useUpdateCategoryMutation();
  const busy = c.isLoading || u.isLoading;
  const error = c.error || u.error;

  useEffect(() => {
    if (category) {
      setForm({
        nameEn: category.name?.en || '',
        nameAr: category.name?.ar || '',
        slug: category.slug || '',
        order: category.order || 0,
        isActive: !!category.isActive,
      });
    } else {
      setForm(EMPTY);
    }
    setFile(null);
  }, [category, open]);

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', JSON.stringify({ en: form.nameEn, ar: form.nameAr }));
    fd.append('slug', form.slug);
    fd.append('order', String(form.order));
    fd.append('isActive', String(form.isActive));
    if (file) fd.append('image', file);

    try {
      if (category) await updateCat({ id: category._id, formData: fd }).unwrap();
      else await createCat(fd).unwrap();
      onClose();
    } catch {
      /* shown below */
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Edit category' : 'New category'}>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name (EN)" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required />
          <Input label="Name (AR)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Slug"
            hint="lowercase, hyphens"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
          <Input label="Order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {category?.image && !file && (
            <img src={category.image} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />
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
