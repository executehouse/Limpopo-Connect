# GitHub Pages Setup Checklist

After merging this PR, follow these steps to complete the GitHub Pages setup:

## 1. Enable GitHub Pages

1. Go to your repository: https://github.com/Tshikwetamakole/Limpopo-Connect
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Source":
   - Select: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
   - Click **Save**

## 2. Configure Repository Secrets

The deployment workflow needs Supabase credentials to be added as secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   
   **First Secret:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://sscsjwaogomktxqhvgxw.supabase.co` (your Supabase URL)
   
   **Second Secret:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key (starts with `eyJ...`)

> ⚠️ **Important:** Use the same values from your `.env.local` file

## 3. Configure Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select: **Read and write permissions**
4. Check: **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

## 4. Trigger Initial Deployment

After merging this PR to `main`, the workflow will automatically run and deploy your site.

Alternatively, you can manually trigger the deployment:
1. Go to **Actions** tab
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## 5. Access Your Site

Once deployed, your site will be available at:
- **https://Tshikwetamakole.github.io/Limpopo-Connect/**

> Note: It may take a few minutes for the initial deployment to complete

## Validation

After deployment, verify everything works:

1. ✅ Visit the site URL
2. ✅ Check that pages load correctly
3. ✅ Verify Supabase connection works (try login/register if implemented)
4. ✅ Check browser console for errors

## Troubleshooting

### Site shows 404 errors
- Make sure GitHub Pages is enabled with `gh-pages` branch
- Wait a few minutes after the first deployment
- Check the Actions tab for deployment status

### Workflow fails
- Verify repository secrets are set correctly
- Check workflow permissions are configured
- Review the workflow logs in the Actions tab

### Supabase connection fails
Run locally to validate: `npm run validate:supabase`

## Continuous Deployment

From now on, every push to the `main` branch will automatically:
1. Build the frontend with production settings
2. Deploy to GitHub Pages
3. Make the site available at the URL above

## Additional Resources

- Full deployment guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Supabase setup: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- GitHub Pages docs: https://docs.github.com/en/pages
