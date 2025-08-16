# Legal Lens - Cost Optimization Guide

## 🎯 Zero/Low-Cost Development Setup

This guide helps you run Legal Lens with minimal or no API costs during development.

## 🤖 AI/LLM Options (Choose One)

### Option 1: Groq (Recommended - FREE)
- **Cost**: $0 (Free tier)
- **Limits**: Generous free tier, very fast inference
- **Setup**: 
  1. Sign up at https://console.groq.com/
  2. Get API key from https://console.groq.com/keys
  3. Set in `.env`: `GROQ_API_KEY` and `LLM_PROVIDER=groq`

### Option 2: Ollama (Local - FREE)
- **Cost**: $0 (runs on your machine)
- **Requirements**: 8GB+ RAM for small models
- **Setup**:
  1. Install from https://ollama.ai/
  2. Run: `ollama pull mistral` (7B model, good performance)
  3. Or: `ollama pull phi` (smaller, faster)
  4. Set in `.env`: `LLM_PROVIDER=ollama`

### Option 3: OpenAI API (Paid)
- **Cost**: ~$0.002 per document with GPT-3.5-Turbo
- **Note**: ChatGPT Pro doesn't include API access
- **Setup**: Get API key from https://platform.openai.com/

### Option 4: Mock Mode (Development Only)
- **Cost**: $0
- **Use**: Set `ENABLE_MOCK_AI=true` in `.env`
- **Note**: Returns realistic but fake analysis results

## 📷 OCR Options

### Option 1: Tesseract.js (Default - FREE)
- **Cost**: $0 (runs locally)
- **Quality**: Good for clean documents
- **Setup**: Already included, no configuration needed

### Option 2: Google Vision (FREE Tier)
- **Cost**: First 1,000 requests/month free
- **Quality**: Excellent
- **Setup**: 
  1. Enable API at Google Cloud Console
  2. Create service account key
  3. Set `GOOGLE_VISION_API_KEY`

## 💾 Storage Options

### Development: MinIO (Local S3)
- **Cost**: $0
- **Setup**: Included in docker-compose
- **Access**: http://localhost:9001 (minioadmin/minioadmin)

### Production Options:
1. **Cloudflare R2**: $0.015/GB stored, no egress fees
2. **Backblaze B2**: $0.005/GB stored, generous free tier
3. **AWS S3**: More expensive, but reliable

## 🔐 Authentication

### Free OAuth Providers:
1. **GitHub OAuth**: Unlimited, free
2. **Google OAuth**: Unlimited, free
3. **Email/Password**: Built-in, free

Skip paid providers like Auth0 initially.

## 💳 Payment Processing

### Development:
- Use Stripe TEST mode (free)
- Enable `USE_MOCK_STRIPE=true` for full mocking

### Production:
- Stripe: 2.9% + $0.30 per transaction
- Consider starting with manual invoicing

## 🗄️ Database

### Development:
- PostgreSQL in Docker (free)
- Included in docker-compose

### Production Options:
1. **Supabase**: Free tier (500MB)
2. **Neon**: Free tier (3GB)
3. **Railway**: $5/month starter
4. **PlanetScale**: Free tier (5GB)

## 🚀 Hosting Options

### Free Tier Deployments:

#### Frontend (Next.js):
1. **Vercel**: Free tier, perfect for Next.js
2. **Netlify**: Free tier, good alternative
3. **Cloudflare Pages**: Unlimited bandwidth

#### Backend (NestJS API):
1. **Railway**: $5 credit/month free
2. **Render**: Free tier (spins down after 15 min)
3. **Fly.io**: Generous free tier

#### Database:
1. **Supabase**: Best free PostgreSQL
2. **Neon**: Good alternative

## 📊 Monitoring (Free Tiers)

1. **Sentry**: 5K errors/month free
2. **LogRocket**: 1K sessions/month free
3. **Datadog**: 5 hosts free trial
4. **Better Stack**: Generous free tier

## 💡 Cost-Saving Code Patterns

### 1. Implement Caching
```typescript
// Cache LLM responses to avoid duplicate API calls
const cacheKey = `analysis:${documentHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 2. Batch Processing
```typescript
// Batch multiple pages for OCR
const pages = await batchProcess(documents, 10);
```

### 3. Progressive Enhancement
```typescript
// Start with basic analysis, upgrade if user needs more
if (user.plan === 'free') {
  return basicAnalysis(document);
}
return advancedAnalysis(document);
```

### 4. Use Webhooks Instead of Polling
```typescript
// Stripe webhook for payment events (no polling needed)
stripe.webhooks.handleWebhook(event);
```

## 🎮 Development Workflow

1. **Start with all mocks enabled**:
   ```env
   ENABLE_MOCK_AI=true
   USE_MOCK_STRIPE=true
   USE_LOCAL_STORAGE=true
   ```

2. **Gradually enable real services**:
   - First: Enable real OCR (Tesseract)
   - Then: Enable real LLM (Groq/Ollama)
   - Finally: Enable real storage (MinIO)

3. **Monitor usage**:
   - Set up alerts for API usage
   - Log all external API calls
   - Track costs daily

## 📈 Estimated Costs

### Development: $0/month
- All local/free services

### MVP Production: $5-20/month
- Vercel (free)
- Supabase (free)
- Railway API ($5)
- Groq AI (free)
- Domain ($10/year)

### Growth Stage: $50-200/month
- Add paid tiers as needed
- Scale based on usage

## 🛠️ Quick Setup Commands

```bash
# Use development environment
cp .env.development .env

# Start with mocks
npm run dev:mock

# Test with local LLM
ollama pull mistral
npm run dev:local

# Production build
npm run build
```

## 📝 Example .env for $0 Cost

```env
# All FREE services
DATABASE_URL="postgresql://postgres:password@localhost:5432/legallens"
REDIS_URL="redis://localhost:6379"

# Local storage
USE_LOCAL_STORAGE=true

# Groq AI (free)
GROQ_API_KEY="your-free-key"
LLM_PROVIDER="groq"

# Tesseract OCR (free)
OCR_PROVIDER="tesseract"

# Mock payments
USE_MOCK_STRIPE=true

# Skip expensive features
SKIP_VIRUS_SCAN=true
ENABLE_MOCK_AI=false  # Set true to skip API calls entirely
```

## 🎯 Priority for Paid Services

When you're ready to spend money, prioritize in this order:

1. **Domain name** ($10/year) - Professional appearance
2. **Database hosting** ($5/month) - Reliability
3. **LLM API** ($20/month budget) - Better analysis
4. **Email service** ($10/month) - Transactional emails
5. **Monitoring** ($10/month) - Error tracking

Total minimum viable budget: ~$35/month

## 🚨 Cost Monitoring

Set up these alerts:
- OpenAI: Set usage limit at $20/month
- Google Cloud: Set budget alert at $10
- Stripe: Monitor test vs production mode
- Database: Monitor storage growth

## 💼 Monetization Strategy

Start charging users before paying for services:
1. Launch with "Beta pricing" 
2. Offer lifetime deals for early users
3. Use revenue to upgrade services
4. Keep free tier very limited

Remember: You can build and test the entire application for $0. Only pay for services when you have paying customers!