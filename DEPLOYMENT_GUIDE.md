# GitHub Pages Deployment Guide

This guide explains how to deploy Limpopo Connect to GitHub Pages.

## 🚀 Automated Deployment

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages when you push to the `main` branch.

### Prerequisites

1. **Enable GitHub Pages in your repository:**
   - Go to: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Click Save

2. **Set up Supabase secrets (Required for production):**
   - Go to: Settings → Secrets and variables → Actions
   - Add the following repository secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   
   > **Note:** These are the same values from your `.env.local` file. See `SUPABASE_SETUP_GUIDE.md` for details.

### How It Works

When you push to the `main` branch:
1. GitHub Actions checks out the code
2. Installs dependencies
3. Builds the frontend with the correct base path
4. Deploys the `dist` folder to the `gh-pages` branch
5. Your site is available at: `https://<username>.github.io/Limpopo-Connect/`

## 🔧 Manual Deployment

You can also deploy manually using the npm script:

```bash
# Build and deploy in one command
npm run deploy:gh-pages
```

This will:
1. Build the frontend (`npm run build:frontend`)
2. Deploy the `dist` folder to GitHub Pages using `gh-pages`

## 🧪 Validate Supabase Before Deployment

Before deploying, validate that your Supabase connection is properly configured:

```bash
npm run validate:supabase
```

This script checks:
- ✅ Environment variables are set
- ✅ Supabase client can be initialized
- ✅ Connection to Supabase works
- ✅ URL and key format are valid
- ✅ Database access is working

## 🛠️ Troubleshooting

### Deployment fails with "Permission denied"

Ensure your GitHub Actions workflow has the correct permissions:
- Go to: Settings → Actions → General
- Workflow permissions: "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

### Site shows 404 errors

This is usually a base path issue. The vite config automatically sets the base path based on the repository name when `GITHUB_REPOSITORY` environment variable is set (which GitHub Actions provides).

For manual deploys, you can set it explicitly:
```bash
export GITHUB_REPOSITORY="username/Limpopo-Connect"
npm run deploy:gh-pages
```

### Supabase connection fails in production

Make sure you've added the Supabase secrets to GitHub Actions:
1. Settings → Secrets and variables → Actions
2. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Build fails

Run the validation checks locally:
```bash
npm run lint        # Check for linting errors
npm run typecheck   # Check TypeScript types
npm test            # Run all tests
npm run build       # Build the project
```

## 📝 Best Practices

1. **Always test locally before deploying:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Validate Supabase connection:**
   ```bash
   npm run validate:supabase
   ```

3. **Run the full check suite:**
   ```bash
   npm run check
   ```

4. **Review the build output:**
   - Check the `dist` folder is created
   - Verify assets are properly bundled
   - Test the preview locally

## 🔒 Security Notes

- Never commit `.env.local` to git
- Only use the **anon public key** for frontend (not service role key)
- The anon key is safe to expose in frontend code as it's rate-limited
- Sensitive operations should use Row Level Security (RLS) in Supabase

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 Success!

Once deployed, your site will be available at:
- Production: `https://<username>.github.io/Limpopo-Connect/`

You can share this URL with users to access the live application!
