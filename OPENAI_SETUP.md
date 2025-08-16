# Legal Lens - OpenAI Setup Guide

## 🚀 Quick Setup for OpenAI Users

Since you have OpenAI API access, here's the fastest way to get Legal Lens running:

### 1. Run the Setup Script

```bash
# Windows
setup-openai.bat

# Or manually:
cp .env.openai .env
npm install --legacy-peer-deps
cd packages/database && npx prisma generate
```

### 2. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### 3. Configure Environment

Edit `.env` file:
```env
# Add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-key-here

# Cost-optimized settings (already configured)
OPENAI_MODEL=gpt-3.5-turbo        # Cheapest model for development
OPENAI_MAX_TOKENS=1000            # Limit response length
DAILY_SPENDING_LIMIT=5.00         # $5/day safety limit
ENABLE_RESPONSE_CACHING=true      # Cache to avoid duplicate calls
```

### 4. Start Services

```bash
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop/

# Start database and other services
cd infra
docker compose up -d

# Setup database
cd ../packages/database
npx prisma migrate dev
npm run db:seed

# Start the application
cd ../..
npm run dev
```

### 5. Test the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001  
- **API Docs**: http://localhost:3001/api
- **Database Admin**: http://localhost:9001 (MinIO console)

**Test Accounts**:
- Solo User: `solo@example.com` / `password123`
- Team Owner: `owner@example.com` / `password123`

## 💰 Cost Expectations

With the optimized settings:

### Development Phase
- **Model**: GPT-3.5-Turbo
- **Cost**: ~$0.02-0.05 per document
- **Daily Limit**: $5 (100-250 documents)
- **Monthly Budget**: ~$50 for heavy development

### Production Ready
- Switch to GPT-4o or GPT-4-Turbo
- Cost: ~$0.15-0.60 per document
- Scale with revenue

## 🔧 Features Enabled

✅ **AI-Powered Analysis**
- Clause extraction with OpenAI
- Risk assessment
- Negotiation suggestions
- Jurisdiction detection

✅ **Cost Controls**
- Response caching
- Daily spending limits
- Token limits
- Usage tracking

✅ **Fallback Options**
- Mock mode for development
- Graceful error handling
- Local OCR with Tesseract

## 🎯 Development Workflow

1. **Start with small documents** (1-2 pages) to test
2. **Monitor costs** in the logs
3. **Use caching** - identical documents won't re-process
4. **Switch models** as needed:
   ```env
   # Development
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Testing  
   OPENAI_MODEL=gpt-4o
   
   # Production
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

## 📊 Monitoring

Check API usage:
```bash
# View logs
npm run dev
# Look for lines like: "OpenAI usage: clause_extraction, Cost: $0.0234"

# Check database for usage stats
npx prisma studio
# Browse to audit_logs table
```

Set up alerts in your OpenAI dashboard:
1. Go to https://platform.openai.com/usage
2. Set usage limits
3. Enable email notifications

## 🚨 Safety Features

- **Daily spending limit** prevents runaway costs
- **Token limits** control response length  
- **Rate limiting** prevents API abuse
- **Caching** reduces duplicate requests
- **Mock mode** for cost-free development

## 🔄 Troubleshooting

### "API key not found"
- Verify `OPENAI_API_KEY` in `.env`
- Check key has sufficient credits
- Ensure key has correct permissions

### "Daily limit exceeded"
- Increase `DAILY_SPENDING_LIMIT` in `.env`
- Check usage at https://platform.openai.com/usage
- Wait until next day or contact OpenAI for limit increase

### "Mock responses returned"
- Check if `ENABLE_MOCK_AI=true` in `.env`
- Verify OpenAI API key is valid
- Check network connectivity

## 📈 Scaling Strategy

1. **Start**: GPT-3.5-Turbo, $5/day limit
2. **Test**: GPT-4o, $20/day limit  
3. **Launch**: GPT-4-Turbo, $100/day limit
4. **Scale**: Adjust limits based on revenue

## 🎉 You're Ready!

With OpenAI API access, you have everything needed to build a production-quality legal analysis tool. The cost controls ensure you won't accidentally overspend while developing.

Start building and test with real AI from day one! 🚀