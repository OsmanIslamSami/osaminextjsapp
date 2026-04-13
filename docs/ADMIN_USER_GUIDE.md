# 📚 Admin User Guide

**Client Management System - Admin Panel**  
**Version**: 1.0.0  
**Last Updated**: April 13,  2026

---

## 🎯 **Overview**

The Admin Panel provides complete control over your website content, user management, and application settings. This guide will walk you through every feature available to administrators.

**Access**: Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) (or your production URL)

**Requirements**: You must have an admin role assigned to your account.

---

## 📋 **Table of Contents**

1. [Accessing the Admin Panel](#accessing-the-admin-panel)
2. [Admin Dashboard](#admin-dashboard)
3. [Slider Management](#slider-management)
4. [News Management](#news-management)
5. [Photos Management](#photos-management)
6. [Videos Management](#videos-management)
7. [Partners Management](#partners-management)
8. [User Management](#user-management)
9. [Social Media Management](#social-media-management)
10. [App Settings](#app-settings)
11. [Style Library](#style-library)
12. [Troubleshooting](#troubleshooting)

---

## 🔐 **1. Accessing the Admin Panel**

### **Step 1: Sign In**
1. Navigate to your website
2. Click "Sign In" in the header
3. Sign in with your Clerk account

### **Step 2: Verify Admin Access**
- Only users with the **Admin** role can access the admin panel
- If you see a "Forbidden" message, contact your system administrator to grant admin permissions

### **Step 3: Navigate to Admin**
- Click "Admin" in the header navigation
- You'll see the Admin Dashboard

**Mobile**: On mobile devices, the admin panel uses a dropdown menu for navigation instead of tabs.

---

## 📊 **2. Admin Dashboard**

The dashboard provides a quick overview of your system:

### **Statistics Cards**
- **Total Users**: Number of registered users
- **Administrators**: Number of admin-level users
- **Slider Slides**: Number of hero slider slides
- **Social Links**: Number of social media links in footer

### **Quick Actions**
Quick links to common admin tasks:
- Manage Users → User management page
- Manage Slider → Slider content management
- Social Media Links → Footer social links
- Manage Clients → Client database (if applicable)

---

## 🎬 **3. Slider Management**

The slider displays on your home page hero section. You can add images, videos, or GIFs with customizable content.

### **Adding a New Slide**

1. Click the **"+ Add Slide"** button
2. **Upload Media**:
   - Click "Choose File" or drag-and-drop
   - Supported formats: JPG, PNG, GIF, MP4, WebM
   - Maximum size: 10MB
   - Storage type: Choose "Vercel Blob" (recommended) or "Local"
3. **Set Media Type**:
   - Image, Video, or GIF
4. **Add Content** (all fields optional):
   - **Title (English)**: Slide title in English
   - **Title (Arabic)**: Slide title in Arabic
   - **Button Text (English)**: Call-to-action button text
   - **Button Text (Arabic)**: Button text in Arabic
   - **Button URL**: Link destination (e.g., `/news`, `https://example.com`)
   - **Show Button**: Toggle to display/hide button
5. Click **"Create Slide"**

**Upload Progress**: A progress bar shows upload status (0-100%).

### **Editing a Slide**

1. Find the slide in the list
2. Click the **pencil icon** (Edit)
3. Modify any field
4. Click **"Update Slide"**

### **Reordering Slides**

1. Use the **↑** (Move Up) and **↓** (Move Down) buttons
2. Slides display in order from top to bottom
3. Changes save automatically

### **Toggling Visibility**

- Click the **eye icon** (👁️) to show a slide
- Click the **eye-slash icon** (🙈) to hide a slide
- Hidden slides don't appear on the home page but remain in admin view

### **Deleting a Slide**

1. Click the **trash icon** (🗑️)
2. Confirm deletion in the popup
3. Slide is soft-deleted (can be restored from database if needed)

---

## 📰 **4. News Management**

Publish and manage news articles with bilingual support.

### **Adding News**

1. Click **"+ Add News"**
2. **Upload Image**:
   - Choose a featured image for the article
   - Recommended size: 1200×630px
   - Maximum size: 10MB
3. **Fill in Details**:
   - **Title (English)**: Article headline
   - **Title (Arabic)**: Arabic headline
   - **Content (English)**: Article body (supports markdown or rich text)
   - **Content (Arabic)**: Arabic article body
   - **Published Date**: When the article was/will be published
   - **Visible**: Toggle to publish/unpublish
4. Click **"Create News"**

### **Searching News**

- Use the search bar to find articles by title
- Search works in both English and Arabic

### **Filtering by Date**

1. Set **From Date** (start of range)
2. Set **To Date** (end of range)
3. Click **"Filter"**
4. Click **"Clear"** to reset filters

### **Editing News**

1. Click the **pencil icon** on an article
2. Modify fields
3. Click **"Update News"**

### **Bulk Actions**

1. Check the boxes next to multiple articles
2. Click **"Delete Selected"**
3. Confirm bulk deletion

### **Exporting News**

- Click **"Export to CSV"** or **"Export to Excel"**
- Downloads a file with all news articles (including metadata)

### **Pagination**

- Use **First**, **Previous**, **Next**, **Last** buttons
- Change page size (10, 20, 50, 100, 500 items per page)
- Shows "Showing X-Y of Z" for context

---

## 📸 **5. Photos Management**

Manage your photo gallery with featured photos, visibility controls, and soft deletes.

### **Adding Photos**

1. Click **"+ Add Photo"**
2. **Upload Image**:
   - Recommended size: 1024×1024px (square) or 16:9 aspect ratio
   - Maximum size: 10MB
   - Storage: Vercel Blob or Local
3. **Fill Details**:
   - **Title (English)**
   - **Title (Arabic)**
   - **Description (English)** (optional)
   - **Description (Arabic)** (optional)
   - **Published Date**
   - **Featured**: Mark as featured (appears in "Featured Photos" section)
   - **Visible**: Show/hide on public gallery
4. Click **"Create Photo"**

### **Viewing Photos**

- **Grid View**: Photos display in a responsive grid (1/2/3/4 columns)
- **Show Hidden**: Toggle to see hidden photos
- **Show Deleted**: Toggle to see soft-deleted photos

### **Editing Photos**

1. Click **pencil icon**
2. Modify details or replace image
3. Click **"Update Photo"**

### **Featured Photos**

- Click the **star icon** (⭐) to toggle featured status
- Featured photos appear prominently on the home page

### **Toggling Visibility**

- Click the **eye icon** to show/hide
- Hidden photos don't appear in public gallery but remain in admin

### **Restoring Deleted Photos**

1. Enable **"Show Deleted"** filter
2. Find the deleted photo
3. Click **"Restore"** button
4. Photo becomes visible again

### **Bulk Delete**

1. Select multiple photos (checkboxes)
2. Click **"Delete Selected"**
3. Confirm deletion

---

## 🎥 **6. Videos Management**

Embed YouTube videos with custom titles and descriptions.

### **Adding Videos**

1. Click **"+ Add Video"**
2. **Enter YouTube URL**:
   - Full URL: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Share URL: `https://youtu.be/VIDEO_ID`
   - System auto-extracts video ID
3. **Fill Details**:
   - **Title (English)**
   - **Title (Arabic)**
   - **Description (English)** (optional)
   - **Description (Arabic)** (optional)
   - **Published Date**
   - **Featured**: Mark as featured
   - **Visible**: Show/hide in gallery
4. **Thumbnail**: Auto-generated from YouTube (or upload custom)
5. Click **"Create Video"**

### **Video Display**

- Videos show thumbnail with play button overlay
- Clicking opens video in popup YouTube player
- Published date displays on each card

### **Editing Videos**

1. Click **pencil icon**
2. Modify details or change YouTube URL
3. Click **"Update Video"**

### **Preview Videos**

- Click the **external link icon** to watch on YouTube
- Useful for verifying the correct video is linked

---

## 🤝 **7. Partners Management**

Showcase partner logos with links to their websites.

### **Adding Partners**

1. Click **"+ Add Partner"**
2. **Upload Logo**:
   - Recommended size: 400×200px (2:1 ratio) or square
   - Transparent PNG recommended
   - Maximum size: 5MB
3. **Fill Details**:
   - **Title (English)**: Partner name
   - **Title (Arabic)**: Arabic partner name
   - **Website URL**: Partner's website (e.g., `https://partner.com`)
   - **Featured**: Mark as featured
   - **Visible**: Show/hide
4. Click **"Create Partner"**

### **Partner Display**

- Partners display in a grid on `/partners` page
- Featured partners may appear on home page (depending on settings)
- Clicking a partner card opens their website in a new tab

### **Editing Partners**

1. Click **pencil icon**
2. Modify details or replace logo
3. Click **"Update Partner"**

---

## 👥 **8. User Management**

Manage user accounts, roles, and permissions.

### **Viewing Users**

- Table shows: User name, Email, Role, Status, Actions
- All users synced from Clerk authentication

### **Changing User Roles**

1. Find the user in the table
2. Use the **Role** dropdown:
   - **User**: Standard user (dashboard access only)
   - **Admin**: Full admin panel access
3. Role changes immediately

**Security Note**: Be cautious when granting admin roles. Admins have full control over content and settings.

### **Activating/Deactivating Users**

| Status | Meaning | Action |
|--------|---------|--------|
| **Active** (green) | User can log in | Click "Deactivate" to disable |
| **Inactive** (red) | User cannot log in | Click "Activate" to enable |

**Use Case**: Deactivate users who leave the organization instead of deleting them (preserves audit trails).

### **User Permissions**

| Role | Dashboard | Admin Panel | Client Management | Settings |
|------|-----------|-------------|-------------------|----------|
| **User** | ✅ Yes | ❌ No | ✅ Yes (read-only) | ❌ No |
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes (full access) | ✅ Yes |

---

## 🔗 **9. Social Media Management**

Add social media icons with links to your footer.

### **Adding Social Links**

1. Click **"+ Add Link"**
2. **Upload Icon**:
   - Supported formats: SVG, PNG, JPG, WebP
   - Recommended: 48×48px SVG (scalable)
   - Maximum size: 1MB
3. **Fill Details**:
   - **Platform**: e.g., "Facebook", "Twitter", "Instagram"
   - **URL**: Full URL (e.g., `https://facebook.com/yourpage`)
   - **Display Order**: Number to control ordering (0 = first)
4. Click **"Create Link"**

### **Icon Guidelines**

- Use simple, recognizable icons
- White or monochrome works best on gradient backgrounds
- Test icons on both light and dark themes

### **Reordering Links**

- Links display in ascending order (0, 1, 2, ...)
- Edit links to change `display_order` value
- Lower numbers appear first

### **Editing Links**

1. Click **pencil icon**
2. Replace icon or update URL
3. Click **"Update Link"**

### **Deleting Links**

1. Click **trash icon**
2. Confirm deletion
3. Link disappears from footer immediately

---

## ⚙️ **10. App Settings**

Configure fonts, themes, home page sections, and site information.

### **10.1 Home Sections Tab**

Control which sections appear on the home page and their order.

**Available Sections**:
- News
- Photos
- Videos
- Partners

**Actions**:
- **Toggle Visibility**: Show/hide each section
- **Reorder**: Drag sections to change display order
- **Partners Settings**:
  - Display Mode: Grid, Carousel, or List
  - Max Count: Number of partners to show (e.g., 6)

**Save**: Click "Save Settings" to apply changes

---

### **10.2 Fonts Tab**

Choose fonts for bilingual content.

**Arabic Fonts** (20 options):
- Cairo (default)
- Amiri
- Tajawal
- Rubik
- Almarai
- Noto Sans Arabic
- IBM Plex Sans Arabic
- And 13 more...

**English Fonts** (20 options):
- Inter (default)
- Roboto
- Open Sans
- Lato
- Poppins
- Montserrat
- And 14 more...

**How to Change Fonts**:
1. Select Arabic font from dropdown
2. Select English font from dropdown
3. Preview appears below each selector
4. Click **"Save Settings"**
5. Fonts apply immediately across the site

---

### **10.3 Themes Tab**

Customize the visual appearance with themes and colors.

**Built-in Themes** (5):
- **Default**: Classic and clean design
- **Modern**: Contemporary and sleek
- **Elegant**: Sophisticated and refined
- **Minimal**: Simple and focused
- **Vibrant**: Bold and colorful

**Color Palettes** (11):
Each palette provides 5 coordinated colors:
1. **Dark & Teal**: #222831 → #00FFF5
2. **Ocean Breeze**: Blue tones
3. **Navy & Violet**: Purple gradient
4. **Warm Sunset**: Pink and yellow
5. **Mint Fresh**: Brown and beige
6. **Purple Dream**: Violet tones
7. **Forest Green**: Dark green
8. **Coral Reef**: Pink and coral
9. **Royal Blue**: Deep blue tones
10. **Sunny Day**: Light purple and white
11. **Cotton Candy**: Pink and white

**How to Apply**:
1. Select a theme from dropdown
2. (Optional) Choose a color palette and click "Apply"
3. (Optional) Fine-tune with custom color pickers
4. Click **"Save Settings"**
5. Theme applies immediately

**Custom Colors**:
- Override individual colors using color pickers
- 5 custom color slots available
- Useful for brand-specific colors

---

### **10.4 Site Settings Tab**

Configure site metadata, logos, and SEO.

**Site Information**:
- **Site Title (English)**: Appears in browser tab and SEO
- **Site Title (Arabic)**: Arabic version
- **Site Description (English)**: Meta description for SEO
- **Site Description (Arabic)**: Arabic meta description
- **Keywords (English)**: Comma-separated (e.g., "news, photos, videos")
- **Keywords (Arabic)**: Arabic keywords

**Images**:
- **Site Logo**: Main logo (recommended: 300×80px PNG)
- **Favicon**: Browser tab icon (recommended: 32×32px ICO or PNG)
- **OG Image**: Social media preview (recommended: 1200×630px JPG/PNG)

**Storage Type**: Choose Vercel Blob or Local for each image

**How to Update**:
1. Fill in bilingual text fields
2. Upload images (optional)
3. Click **"Save Settings"**
4. Changes apply immediately

**SEO Impact**:
- Title and description appear in Google search results
- OG image shows when site is shared on Facebook, Twitter, LinkedIn
- Keywords help search engines understand content

---

## 📁 **11. Style Library**

Organize design assets like brand guidelines, logos, and templates.

**Note**: Refer to [STYLE_LIBRARY.md](STYLE_LIBRARY.md) for detailed documentation.

**Features**:
- Create folders to organize files
- Upload design files (PDF, AI, PNG, SVG, etc.)
- Add descriptions and tags
- Download files
- Share with team members

**Access**: `/admin/style-library`

---

## 🛠️ **12. Troubleshooting**

### **Common Issues**

#### **"Access Denied" when visiting /admin**
- **Cause**: Your user account doesn't have admin role
- **Solution**: Contact your system administrator to grant admin permissions via the User Management page

#### **File Upload Fails (10MB+ files)**
- **Cause**: File exceeds maximum size limit
- **Solution**: 
  - Compress images using TinyPNG or ImageOptim
  - For videos, host on YouTube and use the Videos section instead
  - Maximum: 10MB for images, 50MB for Vercel Blob

#### **Image Doesn't Display After Upload**
- **Cause**: Either upload failed or incorrect storage type
- **Solutions**:
  - Check browser console for errors (F12)
  - Try changing storage type from "Local" to "Vercel Blob"
  - Verify Vercel Blob is configured (see [VERCEL_BLOB_SETUP.md](VERCEL_BLOB_SETUP.md))
  - Ensure image URL is correct in database

#### **Changes Don't Appear on Live Site**
- **Cause**: Browser cache or visibility toggle
- **Solutions**:
  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
  - Check if item is marked "Visible"
  - Check if item is soft-deleted (enable "Show Deleted" filter)
  - Clear browser cache

#### **Bulk Delete Doesn't Work**
- **Cause**: No items selected
- **Solution**: Click checkboxes next to items before clicking "Delete Selected"

#### **YouTube Video Doesn't Embed**
- **Causes**: Invalid URL, embed disabled by owner, age-restricted
- **Solutions**:
  - Verify URL is correct YouTube format
  - Test video plays directly on YouTube
  - Check video privacy settings (must be "Public" or "Unlisted")
  - Avoid age-restricted or embed-disabled videos

#### **Translations Don't Display Correctly**
- **Cause**: Missing translation for selected language
- **Solution**: Fill in both English and Arabic fields when creating content

#### **RTL Layout Issues (Arabic)**
- **Cause**: Browser doesn't support RTL or CSS issue
- **Solution**:
  - Ensure `dir="rtl"` attribute is set
  - Check for conflicting CSS
  - Test in modern browser (Chrome, Firefox, Safari, Edge)

---

## 📞 **Support**

**Documentation**:
- [README.md](README.md) - Project overview
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [STYLE_LIBRARY.md](STYLE_LIBRARY.md) - Style library details
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - Testing procedures

**Technical Issues**:
- Check browser console (F12) for errors
- Review server logs for API errors
- Contact your system administrator

**Feature Requests**:
- Document proposed features
- Share with development team

---

## 🎓 **Best Practices**

1. **Always fill bilingual fields** - Ensures accessibility for all users
2. **Use descriptive titles** - Helps with SEO and user navigation
3. **Optimize images** - Compress before uploading to improve load times
4. **Test changes** - Preview on both desktop and mobile before publishing
5. **Regular backups** - Export data periodically (news CSV, database backups)
6. **Consistent naming** - Use clear, descriptive file names
7. **Check visibility** - Verify "Visible" toggle is enabled before expecting public display
8. **Set published dates** - Keep dates accurate for chronological sorting
9. **Use featured sparingly** - Too many featured items dilutes impact
10. **Review before deleting** - Remember soft deletes can be restored if needed

---

**Admin panel updated regularly. Check this documentation for the latest features and best practices.**

