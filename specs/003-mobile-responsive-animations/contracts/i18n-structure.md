# Contract: Internationalization (i18n) Structure

**Feature**: 003-mobile-responsive-animations  
**Date**: March 26, 2026  
**Languages**: English (en), Arabic (ar)

## Overview

Defines the structure and conventions for bilingual support (English/Arabic) in the application, including translation file format, language context API, and RTL/LTR layout switching.

---

## Translation File Structure

### File Locations

```
lib/i18n/translations/
├── en.json    # English translations
└── ar.json    # Arabic translations
```

### JSON Schema

Both language files MUST have identical key structures (structural parity).

**Schema Pattern**:
```json
{
  "<section>": {
    "<key>": "translation string"
  }
}
```

**Sections** (top-level keys):
- `nav` - Navigation menu items
- `buttons` - Common button labels
- `forms` - Form labels and placeholders
- `clients` - Client management page strings
- `dashboard` - Dashboard page strings
- `login` - Login page strings
- `footer` - Footer content
- `errors` - Error messages
- `common` - Common UI strings (loading, etc.)

---

## English Translation File (en.json)

```json
{
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    "clients": "Clients",
    "login": "Login",
    "logout": "Logout"
  },
  "buttons": {
    "add": "Add",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "export": "Export",
    "search": "Search",
    "back": "Back",
    "confirm": "Confirm"
  },
  "forms": {
    "required": "Required",
    "optional": "Optional",
    "emailLabel": "Email",
    "nameLabel": "Name",
    "mobileLabel": "Mobile",
    "statusLabel": "Status"
  },
  "clients": {
    "title": "Client Management",
    "addClient": "Add New Client",
    "editClient": "Edit Client",
    "viewClient": "View Client",
    "searchPlaceholder": "Search by name, email, or mobile...",
    "noResults": "No clients found",
    "totalClients": "Total Clients",
    "deleteConfirm": "Are you sure you want to delete this client?"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome",
    "totalClients": "Total Clients",
    "totalOrders": "Total Orders",
    "pendingOrders": "Pending Orders",
    "completedOrders": "Completed Orders",
    "recentActivity": "Recent Activity",
    "latestClients": "Latest Clients"
  },
  "login": {
    "title": "Sign In",
    "welcome": "Welcome back",
    "signInButton": "Sign In",
    "signUpButton": "Sign Up",
    "noAccount": "Don't have an account?"
  },
  "footer": {
    "contact": "Contact Us",
    "email": "info@example.com",
    "followUs": "Follow Us",
    "rights": "All rights reserved"
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Invalid email format",
    "invalidMobile": "Invalid mobile number",
    "serverError": "Server error occurred. Please try again.",
    "notFound": "Resource not found",
    "unauthorized": "You are not authorized to perform this action"
  },
  "common": {
    "loading": "Loading...",
    "language": "Language",
    "english": "English",
    "arabic": "Arabic"
  }
}
```

---

## Arabic Translation File (ar.json)

```json
{
  "nav": {
    "home": "الرئيسية",
    "dashboard": "لوحة التحكم",
    "clients": "العملاء",
    "login": "تسجيل الدخول",
    "logout": "تسجيل الخروج"
  },
  "buttons": {
    "add": "إضافة",
    "edit": "تعديل",
    "delete": "حذف",
    "save": "حفظ",
    "cancel": "إلغاء",
    "export": "تصدير",
    "search": "بحث",
    "back": "رجوع",
    "confirm": "تأكيد"
  },
  "forms": {
    "required": "مطلوب",
    "optional": "اختياري",
    "emailLabel": "البريد الإلكتروني",
    "nameLabel": "الاسم",
    "mobileLabel": "الهاتف",
    "statusLabel": "الحالة"
  },
  "clients": {
    "title": "إدارة العملاء",
    "addClient": "إضافة عميل جديد",
    "editClient": "تعديل العميل",
    "viewClient": "عرض العميل",
    "searchPlaceholder": "البحث بالاسم أو البريد الإلكتروني أو الهاتف...",
    "noResults": "لم يتم العثور على عملاء",
    "totalClients": "إجمالي العملاء",
    "deleteConfirm": "هل أنت متأكد من حذف هذا العميل؟"
  },
  "dashboard": {
    "title": "لوحة التحكم",
    "welcome": "مرحباً",
    "totalClients": "إجمالي العملاء",
    "totalOrders": "إجمالي الطلبات",
    "pendingOrders": "الطلبات قيد الانتظار",
    "completedOrders": "الطلبات المكتملة",
    "recentActivity": "النشاط الأخير",
    "latestClients": "أحدث العملاء"
  },
  "login": {
    "title": "تسجيل الدخول",
    "welcome": "مرحباً بعودتك",
    "signInButton": "تسجيل الدخول",
    "signUpButton": "إنشاء حساب",
    "noAccount": "ليس لديك حساب؟"
  },
  "footer": {
    "contact": "اتصل بنا",
    "email": "info@example.com",
    "followUs": "تابعنا",
    "rights": "جميع الحقوق محفوظة"
  },
  "errors": {
    "required": "هذا الحقل مطلوب",
    "invalidEmail": "تنسيق البريد الإلكتروني غير صحيح",
    "invalidMobile": "رقم الهاتف غير صحيح",
    "serverError": "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.",
    "notFound": "المورد غير موجود",
    "unauthorized": "غير مصرح لك بتنفيذ هذا الإجراء"
  },
  "common": {
    "loading": "جار التحميل...",
    "language": "اللغة",
    "english": "الإنجليزية",
    "arabic": "العربية"
  }
}
```

---

## Language Context API

### Context Interface

```typescript
// lib/i18n/LanguageContext.tsx

export type Language = 'en' | 'ar';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
}
```

### Provider Implementation

```typescript
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations on mount and language change
  useEffect(() => {
    import(`./translations/${language}.json`)
      .then(module => setTranslations(module.default));
  }, [language]);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved === 'en' || saved === 'ar') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

---

## Custom Hook: useTranslation

```typescript
// lib/i18n/useTranslation.ts
import { useLanguage } from './LanguageContext';

export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}
```

**Usage in Components**:
```typescript
'use client';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('buttons.save')}</button>
    </div>
  );
}
```

---

## RTL/LTR Layout Switching

### HTML Direction Attribute

Apply `dir` attribute to `<html>` tag based on language:

```typescript
// app/layout.tsx
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      <LanguageAwareHTML>
        <body>{children}</body>
      </LanguageAwareHTML>
    </LanguageProvider>
  );
}

function LanguageAwareHTML({ children }) {
  const { language, direction } = useLanguage();
  
  return (
    <html lang={language} dir={direction}>
      {children}
    </html>
  );
}
```

### Tailwind CSS RTL Support

Tailwind automatically handles RTL for most utilities when `dir="rtl"` is set:

```typescript
// Auto-reverses in RTL
<div className="ml-4">  // Becomes margin-right in RTL
<div className="text-left">  // Becomes text-right in RTL

// Explicit RTL overrides when needed
<div className="ltr:text-left rtl:text-right">
<div className="ltr:ml-4 rtl:mr-4">
```

### Preventing Icon/Image Flip

Some elements should NOT flip in RTL (logos, icons):

```typescript
// Force LTR direction for specific elements
<div className="ltr">
  <Image src="/logo.svg" alt="Logo" />
</div>
```

---

## Language Switcher Component

```typescript
// lib/components/LanguageSwitcher.tsx
'use client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="px-3 py-2 rounded border"
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {language === 'en' ? 'ع' : 'EN'}
    </button>
  );
}
```

**Placement**: Add to header component next to user menu/login buttons

---

## Validation Rules

### Translation File Validation

✅ **MUST**: Both language files have identical key structures
✅ **MUST**: All values are strings (no nested objects for values)
✅ **MUST**: No HTML in translation values (use plain text only)
✅ **MUST**: Keys use camelCase for nested properties
❌ **MUST NOT**: Include dynamic data in translation files (use interpolation in code)

### Translation Key Naming

- Use descriptive, semantic keys: `clients.addClient` (not `clients.btn1`)
- Group related translations under same section
- Use consistent naming patterns (e.g., all button labels end with "Button" if they're full buttons)

---

## Testing Checklist

- [ ] Both language files have matching key structures
- [ ] Language switcher toggles between English and Arabic
- [ ] Layout switches between LTR and RTL correctly
- [ ] All UI text translates when language changes
- [ ] Language preference persists across page refreshes (localStorage)
- [ ] No translation keys (e.g., "nav.home") displayed in UI (all resolved to strings)
- [ ] Logos/icons do NOT flip in RTL
- [ ] Form alignment works in both directions
- [ ] Navigation menu works in both directions
- [ ] Footer layout adapts to RTL

---

## Future Enhancements

- **Interpolation**: Support dynamic values in translations (e.g., "Welcome, {name}")
- **Pluralization**: Handle singular/plural forms (e.g., "1 client" vs "5 clients")
- **Date/Number Formatting**: Use Intl API for locale-aware formatting
- **Server-Side Rendering**: Pre-render pages in user's preferred language
- **Translation Management**: Use external service (e.g., Lokalise, Phrase) for non-developer translation updates
