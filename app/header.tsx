'use client';
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { ChartBarIcon, UsersIcon, Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { LanguageSwitcher } from "@/lib/components/LanguageSwitcher";
import MobileMenu from "@/lib/components/MobileMenu";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useAppSettings } from "@/lib/contexts/AppSettingsContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, direction } = useTranslation();
  const { isAdmin } = useCurrentUser();
  const { isSignedIn } = useAuth();
  const { settings, loading } = useAppSettings();

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(true);
  };

  // Debug logging
  console.log('Header - Settings:', settings);
  console.log('Header - Loading:', loading);
  console.log('Header - Logo URL:', settings?.site_logo_url);
  console.log('Header - Has Logo:', !!settings?.site_logo_url);

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
        <Link href="/" className="flex items-center min-h-[40px]">
          {loading ? (
            <div className="h-10 w-[120px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-t-2" style={{ borderColor: 'var(--color-primary)' }}></div>
            </div>
          ) : settings?.site_logo_url ? (
            <img 
              src={settings.site_logo_url} 
              alt="Site Logo" 
              style={{ 
                height: '40px', 
                width: 'auto', 
                maxWidth: '150px', 
                objectFit: 'contain',
                display: 'block'
              }}
              onLoad={(e) => {
                console.log('✅ Logo loaded successfully:', settings.site_logo_url);
                console.log('Image dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
              }}
              onError={(e) => {
                console.error('❌ Logo failed to load:', settings.site_logo_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-10 flex items-center px-2" style={{ color: 'var(--color-text-primary)' }}>
              <span className="text-xl font-semibold">{settings?.site_title_en || 'App'}</span>
            </div>
          )}
        </Link>
        
        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2">
          {isSignedIn && (
            <>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium text-sm hover:scale-105"
                style={{
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>{t('nav.dashboard')}</span>
              </Link>
              <Link 
                href="/clients" 
                className="flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium text-sm hover:scale-105"
                style={{
                  color: 'var(--color-text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <UsersIcon className="w-4 h-4" />
                <span>{t('nav.clients')}</span>
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium text-sm hover:scale-105"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    e.currentTarget.style.color = 'var(--color-primary)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>{t('nav.admin')}</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
      
      {/* Right: Language Switcher + User Button */}
      <div className="flex items-center gap-4">
        {!isSignedIn && (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal"><button className="px-4 md:px-5 py-1.5 md:py-2 text-sm font-medium rounded-full transition-all bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100">{t('login.signInButton')}</button></SignInButton>
            <SignUpButton mode="modal"><button className="hidden md:block px-5 py-2 text-sm font-medium rounded-full transition-all border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent">{t('login.signUpButton')}</button></SignUpButton>
          </div>
        )}
        <LanguageSwitcher />
        {isSignedIn && (
          <>
            <div className="hidden md:block">
              <UserButton />
            </div>
        
            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileMenuToggle}
              type="button"
              className="md:hidden p-3 rounded-full transition-all hover:scale-105"
              style={{ color: 'var(--color-text-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label="Open menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
