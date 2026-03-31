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
    <header 
      dir={direction} 
      className="w-full flex items-center justify-between px-4 md:px-8 py-4"
      style={{
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
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
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
              style={{
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>{t('nav.dashboard')}</span>
            </Link>
            <Link 
              href="/clients" 
              className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
              style={{
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              <UsersIcon className="w-5 h-5" />
              <span>{t('nav.clients')}</span>
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-4 py-2 rounded transition-colors"
                style={{
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
              >
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
            <SignInButton mode="modal"><button className="px-3 py-2 md:px-4 text-sm md:text-base rounded transition-colors" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}>{t('login.signInButton')}</button></SignInButton>
            <SignUpButton mode="modal"><button className="hidden md:block px-4 py-2 rounded transition-colors" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>{t('login.signUpButton')}</button></SignUpButton>
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
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </Show>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
