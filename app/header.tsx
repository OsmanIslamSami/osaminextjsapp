'use client';
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { ChartBarIcon, UsersIcon, Bars3Icon } from "@heroicons/react/24/outline";
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
            </>
          )}
        </nav>
      </div>
      
      {/* Right: Language Switcher + User Button */}
      <div className="flex items-center gap-4">
        {!isSignedIn && (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal"><button className="px-3 py-2 md:px-4 text-sm md:text-base rounded transition-colors" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}>{t('login.signInButton')}</button></SignInButton>
            <SignUpButton mode="modal"><button className="hidden md:block px-4 py-2 rounded transition-colors" style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; e.currentTarget.style.borderColor = 'var(--color-border-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>{t('login.signUpButton')}</button></SignUpButton>
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
          </>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
