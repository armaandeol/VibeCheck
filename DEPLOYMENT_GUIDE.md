# Deployment Guide - Fixing 404 Routing Issues

## The Problem
You're getting a 404 error for `/auth/callback` because your hosting provider doesn't know how to handle client-side routing in your React SPA.

## Solution
I've created configuration files for different hosting platforms. Use the one that matches your hosting provider:

### 1. **Vercel** (Most Common)
- Use the `vercel.json` file I created
- Deploy using: `vercel --prod`
- Or connect your GitHub repo to Vercel

### 2. **Netlify**
- Use the `netlify.toml` file I created
- Or use the `public/_redirects` file
- Deploy using: `netlify deploy --prod`

### 3. **Apache/Shared Hosting**
- Use the `public/.htaccess` file I created
- Upload the `dist` folder to your hosting

### 4. **Other Platforms**
If you're using a different platform, tell me and I'll create the appropriate config.

## Steps to Fix

### Step 1: Deploy with Configuration
1. Make sure you have the configuration file for your hosting platform
2. Deploy your app with the new configuration
3. The routing should now work properly

### Step 2: Update Supabase Settings
1. Go to your Supabase dashboard
2. Navigate to **Authentication > URL Configuration**
3. Set **Site URL** to your deployed domain
4. Add these **Redirect URLs**:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/
   ```

### Step 3: Test the Flow
1. Go to your deployed app
2. Click "Continue with Google"
3. Complete authentication
4. You should be redirected to `/auth/callback` and then to the home page

## Configuration Files Created

### vercel.json (for Vercel)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### netlify.toml (for Netlify)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### public/_redirects (for Netlify alternative)
```
/*    /index.html   200
```

### public/.htaccess (for Apache)
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
```

## What These Files Do
- **Rewrite Rules**: Tell the server to serve `index.html` for all routes
- **Client-Side Routing**: Let React Router handle the routing on the client side
- **Auth Callback**: Ensure `/auth/callback` is properly handled

## Testing Locally
You can test locally by running:
```bash
npm run build
npm run preview
```

Then visit `http://localhost:4173/auth/callback` to test the route.

## Common Issues

### Still Getting 404?
1. Make sure you're using the right configuration file for your hosting platform
2. Check that the configuration file is in the correct location
3. Redeploy after adding the configuration file

### Auth Callback Not Working?
1. Verify Supabase redirect URLs are correct
2. Check browser console for errors
3. Ensure the AuthCallback component is properly imported

### Need Help?
Tell me:
1. What hosting platform you're using
2. The exact error message you're seeing
3. Your deployed URL

I'll help you create the right configuration! 