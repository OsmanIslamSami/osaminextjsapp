# Quick Reference: Remaining Console Statement Cleanup

## Total Remaining: 45 console statements

## Script to Auto-Replace

Run this PowerShell command to batch replace all remaining console statements:

```powershell
# Navigate to project root
cd d:\Projects\osaminextjsapp\osaminextjsapp

# Create backup
git add -A
git commit -m "Backup before console cleanup"

# List of files with console statements
$files = @(
  "app\faq\page.tsx",
  "app\admin\app-settings\page.tsx",
  "app\clients\[id]\view\page.tsx",
  "app\dashboard\page.tsx",
  "app\admin\magazines\page.tsx",
  "app\clients\[id]\edit\page.tsx",
  "app\admin\faq\[id]\edit\page.tsx",
  "app\videos\page.tsx",
  "app\clients\page.tsx",
  "app\admin\faq\page.tsx",
  "app\admin\users\page.tsx",
  "app\admin\page.tsx",
  "app\page.tsx",
  "app\admin\slider\page.tsx",
  "app\photos\page.tsx",
  "app\clients\add\page.tsx",
  "app\admin\faq\add\page.tsx",
  "app\admin\magazines\[id]\edit\page.tsx",
  "app\admin\style-library\page.tsx",
  "app\admin\social\page.tsx",
  "app\api\og\route.tsx",
  "app\partners\page.tsx",
  "app\news\[id]\page.tsx"
)

# For each file:
# 1. Replace console.error with logger.error
# 2. Replace console.log with logger.debug
# 3. Add import statement

foreach ($file in $files) {
  $filePath = Join-Path $PWD $file
  if (Test-Path $filePath) {
    Write-Host "Processing: $file"
    $content = Get-Content $filePath -Raw
    
    # Replace console statements
    $content = $content -replace 'console\.error\(', 'logger.error('
    $content = $content -replace 'console\.log\(', 'logger.debug('
    $content = $content -replace 'console\.warn\(', 'logger.warn('
    
    # Add logger import if not present
    if ($content -notmatch "import.*logger.*from.*@/lib/utils/logger") {
      # Find the import section (after 'use client' if present)
      if ($content -match "('use client';?\s+)") {
        $content = $content -replace "('use client';?\s+)", "`$1import { logger } from '@/lib/utils/logger';`n"
      } else {
        # Add at the top
        $content = "import { logger } from '@/lib/utils/logger';`n" + $content
      }
    }
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "✓ Updated: $file"
  } else {
    Write-Host "✗ Not found: $file"
  }
}

Write-Host "`n✅ Console cleanup complete!"
```

## Manual Review Checklist

After running the script:

1. **Verify imports**: Check that logger is imported in all files
2. **Test build**: Run `npm run build` to ensure no errors
3. **Check functionality**: Test pages to ensure logging still works in dev mode
4. **Commit changes**: 
   ```bash
   git add -A
   git commit -m "feat: replace console statements with logger utility"
   ```

## Verification Commands

```powershell
# Count remaining console statements (should be 0)
grep -r "console\." app --include="*.tsx" --include="*.ts" | wc -l

# Find any missed statements
grep -rn "console\." app --include="*.tsx" --include="*.ts"
```

## Expected Result

- All `console.error` → `logger.error`
- All `console.log` → `logger.debug`
- All `console.warn` → `logger.warn`
- Logger import added to all affected files
- Production builds will have no debug logs
- Development builds will still show logs
