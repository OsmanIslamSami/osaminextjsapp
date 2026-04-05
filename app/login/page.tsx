'use client';

import { SignIn } from "@clerk/nextjs";
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4 page-transition">
      <div className="w-full max-w-md p-6 md:p-8 bg-white rounded shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-xl md:text-2xl font-bold text-center text-black dark:text-zinc-50">{t('login.title')}</h1>
        <SignIn routing="path" path="/login" />
      </div>
    </div>
  );
}
