# JobPortal - AI-Powered Web3 Job & Networking Platform

A modern job and networking portal built for the RizeOS Core Team Internship Assessment. This platform combines AI-powered job matching, blockchain payments, and professional networking in a seamless user experience.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with Supabase
- **Profile Management**: Comprehensive user profiles with AI skill extraction
- **Job Posting & Discovery**: Advanced job posting with blockchain payment verification
- **Social Feed**: Professional networking with career advice and updates

### AI-Powered Features
- **Smart Job Matching**: NLP-based algorithm calculates match scores between jobs and candidates
- **Skill Extraction**: Automatically extracts skills from user bios and job descriptions
- **Connection Suggestions**: AI-recommended professional connections based on common skills

### Web3 Integration
- **Phantom Wallet Connection**: Seamless Solana wallet integration
- **Blockchain Payments**: Platform fee payments verified on Solana devnet
- **Transaction Verification**: All payments are blockchain-verified before job posting

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Blockchain**: Solana (Devnet), Phantom Wallet
- **AI/ML**: Custom NLP algorithms for matching and skill extraction
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v18 or higher)
2. **Phantom Wallet** browser extension installed
3. **Supabase Account** with a new project
4. **Solana Devnet SOL** for testing payments

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd job-portal
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL migrations in the Supabase SQL editor:
   - Execute `supabase/migrations/create_users_table.sql`
   - Execute `supabase/migrations/create_jobs_table.sql`
   - Execute `supabase/migrations/create_posts_table.sql`

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SOLANA_NETWORK=devnet
VITE_ADMIN_WALLET=your_admin_wallet_public_key
```

### 4. Solana Wallet Setup

1. Install [Phantom Wallet](https://phantom.app/) browser extension
2. Create a new wallet or import existing one
3. Switch to Devnet in Phantom settings
4. Get devnet SOL from [Solana Faucet](https://faucet.solana.com/)

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 Usage Guide

### For Job Seekers

1. **Register**: Create an account with your professional details
2. **Complete Profile**: Add bio, skills, and LinkedIn profile
3. **Connect Wallet**: Link your Phantom wallet for future transactions
4. **Browse Jobs**: View AI-recommended jobs based on your skills
5. **Network**: Connect with professionals and engage in the community feed

### For Employers

1. **Register**: Create an employer account
2. **Connect Wallet**: Link Phantom wallet for payment processing
3. **Post Jobs**: Create detailed job postings with required skills
4. **Pay Platform Fee**: 0.0001 SOL fee for each job posting
5. **Manage Applications**: Review and manage candidate applications

## 🤖 AI Features

### Job Matching Algorithm
- Analyzes user skills vs job requirements
- Considers bio keywords and job description
- Provides percentage match scores
- Highlights matching skills

### Skill Extraction
- NLP-based skill detection from text
- Supports 40+ common technical and soft skills
- Real-time extraction from bios and job descriptions
- Manual skill addition and curation

### Connection Suggestions
- Recommends users with similar skills
- Considers bio content similarity
- Ranks suggestions by relevance score

## 🔗 Blockchain Integration

### Payment Flow
1. User connects Phantom wallet
2. Platform creates payment transaction (0.0001 SOL)
3. User signs transaction in Phantom
4. Transaction is confirmed on Solana devnet
5. Job posting is enabled after payment confirmation

### Security Features
- All payments are blockchain-verified
- Transaction hashes stored for audit trail
- Wallet addresses linked to user profiles
- Real-time balance updates

## 📊 Database Schema

### Users Table
- Profile information and authentication
- Skills array for AI matching
- Wallet address for Web3 integration

### Jobs Table
- Job postings with detailed requirements
- Payment confirmation status
- Blockchain transaction references

### Posts Table
- Social feed content
- Post categorization (update/advice/announcement)
- Engagement metrics

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your preferred platform
```

### Environment Variables for Production
- Update `.env` with production Supabase credentials
- Consider using Solana mainnet for production
- Set up proper admin wallet for fee collection

## 🎥 Demo Video Structure

1. **Introduction** (2 min)
   - Personal introduction and project overview
   - Tech stack and architecture explanation

2. **Frontend Demo** (5 min)
   - User registration with AI skill extraction
   - Job browsing with AI recommendations
   - Social feed and networking features

3. **Web3 Integration** (4 min)
   - Phantom wallet connection
   - Payment flow demonstration
   - Blockchain transaction verification

4. **AI Features** (3 min)
   - Job matching algorithm in action
   - Skill extraction demonstration
   - Connection suggestions

5. **Backend & Code** (3 min)
   - Database schema explanation
   - API structure and security
   - Code quality highlights

6. **GTM Strategy** (3 min)
   - Target market and user personas
   - Marketing plan with ₹5,000 budget
   - Revenue streams and monetization

## 💰 Monetization Strategy

### Revenue Streams
1. **Platform Fees**: 0.0001 SOL per job posting
2. **Premium Subscriptions**: ₹150/month for advanced features
3. **Featured Job Listings**: ₹500/month for highlighted postings
4. **AI Insights**: ₹100/month for detailed analytics

### Go-to-Market Plan
- **Month 1**: Launch with 100 beta users, focus on tech professionals
- **Month 2**: Expand to 1,000 users through referral program
- **Month 3**: Scale to 10,000 users with targeted marketing

### Marketing Budget (₹5,000)
- **Social Media Ads**: ₹2,000 (LinkedIn, Twitter)
- **Content Marketing**: ₹1,500 (Blog posts, tutorials)
- **Influencer Partnerships**: ₹1,000 (Tech YouTubers, LinkedIn influencers)
- **Community Building**: ₹500 (Discord, Telegram groups)

## 🔮 Future Roadmap

### Phase 1 (Months 1-3)
- Mobile app development
- Advanced AI matching algorithms
- Smart contract for escrow payments

### Phase 2 (Months 4-6)
- Video interviews integration
- Skill verification system
- NFT-based achievement badges

### Phase 3 (Months 7-12)
- Multi-chain support (Ethereum, Polygon)
- DAO governance for platform decisions
- Global expansion and localization

## 🤝 Contributing

This project was built as part of the RizeOS Core Team Internship Assessment. For questions or feedback, please reach out through the provided channels.

## 📄 License

This project is built for assessment purposes. All rights reserved.

---

**Built with ❤️ for the RizeOS Core Team Assessment**