# Deploy to GitHub & Vercel

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `cut-order-manager`
5. Description: `Hardware store management system - Cut & Order Manager`
6. Make it **Public** (for free Vercel deployment)
7. **Don't** initialize with README (we already have one)
8. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cut-order-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `cut-order-manager` repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build-no-ts`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

## Step 4: Configure Environment (Optional)

If you want to customize the deployment:

- **Build Command**: `npm run build-no-ts`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x (default)

## Step 5: Custom Domain (Optional)

After deployment, you can:
1. Go to your project settings in Vercel
2. Add a custom domain if desired
3. Configure environment variables if needed

## Troubleshooting

If the build fails:
1. Check that all dependencies are in `package.json`
2. Ensure the build command is `npm run build-no-ts`
3. Verify the output directory is `dist`

The app should deploy successfully and be available at your Vercel URL! 