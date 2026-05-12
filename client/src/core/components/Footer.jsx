import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 border-t border-ink/5 bg-surface">
      <div className="container-app flex h-16 items-center justify-between text-sm text-ink-muted">
        <span>© {new Date().getFullYear()} {t('brand')}</span>
        <span className="hidden sm:inline">Prototype build</span>
      </div>
    </footer>
  );
}
