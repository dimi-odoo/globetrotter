# Security Configuration Guide

## Environment Variables Setup

This application uses environment variables to keep sensitive information secure. Follow these steps:

### 1. Create your .env.local file

Copy the `.env.example` file to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

#### Google API Keys
- `NEXT_PUBLIC_GOOGLE_API_KEY` - For Google Places API (client-side)
- `NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY` - For Google Gemini AI (client-side)
- `GOOGLE_API_KEY` - For server-side Google API calls

#### Google Calendar Integration
- `GOOGLE_CLIENT_ID` - OAuth2 client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - OAuth2 client secret from Google Cloud Console

#### Database
- `MONGODB_URI` - Your MongoDB connection string

#### Authentication
- `JWT_SECRET` - Strong random string for JWT token signing
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - Your application URL

#### Admin Access
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password (use strong password in production)

### 3. Security Best Practices

#### Production Deployment
1. **Use strong, randomly generated secrets**:
   ```bash
   # Generate strong JWT secret
   openssl rand -base64 32
   ```

2. **Use environment-specific values**:
   - Development: localhost URLs
   - Production: your domain URLs

3. **Database Security**:
   - Use MongoDB Atlas with IP whitelisting
   - Use database users with limited permissions
   - Enable database authentication

4. **API Key Security**:
   - Restrict API keys to specific domains in Google Cloud Console
   - Set up API quotas and limits
   - Monitor API usage

#### Environment Variables Security
- Never commit `.env.local` or any `.env` files to version control
- Use different values for development, staging, and production
- Rotate secrets regularly
- Use cloud provider secret management in production (AWS Secrets Manager, Azure Key Vault, etc.)

### 4. Google Cloud Console Setup

1. **Create a new project** in Google Cloud Console
2. **Enable APIs**:
   - Google Places API
   - Google Calendar API
   - Google Generative AI API

3. **Create credentials**:
   - API Key for Places and Gemini APIs
   - OAuth2 credentials for Calendar integration

4. **Set up OAuth consent screen**
5. **Configure authorized domains and redirect URIs**

### 5. MongoDB Atlas Setup

1. **Create a cluster** in MongoDB Atlas
2. **Create a database user** with read/write permissions
3. **Set up network access** (IP whitelist)
4. **Get connection string** and add to MONGODB_URI

### 6. Vercel Deployment (if using Vercel)

Add environment variables in Vercel dashboard:
1. Go to your project settings
2. Add all environment variables from .env.local
3. Deploy with updated environment variables

## Security Checklist

- [ ] All API keys moved to environment variables
- [ ] No hardcoded credentials in source code
- [ ] Strong JWT secret generated
- [ ] Database connection secured
- [ ] .env.local added to .gitignore
- [ ] Google API keys restricted to specific domains
- [ ] OAuth redirect URIs properly configured
- [ ] Admin credentials changed from defaults
- [ ] API rate limiting implemented
- [ ] HTTPS enabled in production
- [ ] Environment variables properly set in deployment platform

## Common Issues

1. **"API key not configured" errors**: Ensure environment variables are properly set
2. **Google API errors**: Check API is enabled and key restrictions
3. **Database connection failures**: Verify MongoDB URI and network access
4. **OAuth callback errors**: Check redirect URI configuration

## Monitoring

- Monitor API usage in Google Cloud Console
- Set up database monitoring in MongoDB Atlas
- Implement logging for authentication attempts
- Set up alerts for unusual activity
