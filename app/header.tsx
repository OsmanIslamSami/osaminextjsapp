'use client';
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChartBarIcon, UsersIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/lib/components/LanguageSwitcher";
import MobileMenu from "@/lib/components/MobileMenu";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, direction } = useTranslation();
  const { isAdmin } = useCurrentUser();

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(true);
  };

  return (
    <header dir={direction} className="w-full flex items-center justify-between px-4 md:px-8 py-4 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      {/* Left: Logo + Navigation Tabs */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.svg" 
            alt="Next App Logo" 
            width={120} 
            height={40}
            className="h-10 w-auto dark:invert"
            priority
          />
        </Link>
        
        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2">
          <Show when="signed-in">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-black dark:text-white hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] rounded transition-colors">
              <ChartBarIcon className="w-5 h-5" />
              <span>{t('nav.dashboard')}</span>
            </Link>
            <Link href="/clients" className="flex items-center gap-2 px-4 py-2 text-black dark:text-white hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] rounded transition-colors">
              <UsersIcon className="w-5 h-5" />
              <span>{t('nav.clients')}</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-black dark:text-white hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] rounded transition-colors">
                <span>{t('nav.admin')}</span>
              </Link>
            )}
          </Show>
        </nav>
      </div>
      
      {/* Right: Language Switcher + User Button */}
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <button className="px-3 py-2 md:px-4 text-sm md:text-base rounded bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]">
                {t('login.signInButton')}
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="hidden md:block px-4 py-2 rounded border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]">
                {t('login.signUpButton')}
              </button>
            </SignUpButton>
          </div>
        </Show>
        <LanguageSwitcher />
        <Show when="signed-in">
          <div className="hidden md:block">
            <UserButton />
          </div>
        
          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6 text-black dark:text-white" />
          </button>
        </Show>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
