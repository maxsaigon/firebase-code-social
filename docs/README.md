# Admin E-Commerce Platform

A modern, full-stack e-commerce admin dashboard built with Next.js 15, TypeScript, and PostgreSQL.

## 🌟 Features

### Admin Dashboard
- **User Management**: View, create, edit, and manage user accounts
- **Service Management**: Manage service catalog with CRUD operations
- **Order Management**: Track and manage customer orders
- **Transaction Management**: Monitor all financial transactions
- **Analytics Dashboard**: Real-time stats and insights
- **AI Tools**: Service description optimization using Genkit AI

### User Portal
- **My Orders**: View order history and status
- **Wallet Management**: Check balance, add funds, view transaction history
- **Service Ordering**: Browse and order available services
- **Profile Management**: Update account information

## 🚀 Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based auth with localStorage persistence
- **UI Components**: Shadcn/ui components with Radix UI primitives
- **AI Integration**: Google Genkit for content optimization
- **Database**: Self-hosted PostgreSQL 14

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── user/              # User portal pages
│   ├── auth/              # Authentication pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── shared/           # Common components
│   └── ui/               # Base UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
└── types/                # TypeScript type definitions
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd admin-ecom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Start PostgreSQL service
brew services start postgresql

# Create database
createdb admin_ecom_db

# Apply schema
psql -d admin_ecom_db -f prisma/schema.sql

# Seed sample data
psql -d admin_ecom_db -f prisma/seed.sql
```

### 4. Environment Configuration
Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/admin_ecom_db"

# JWT Authentication
JWT_SECRET="your-secret-key-here"

# Google Genkit AI (Optional)
GOOGLE_GENAI_API_KEY="your-google-ai-key"
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at:
- Main app: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin
- User portal: http://localhost:3000/user

## 🔐 Authentication

### Default Accounts
```bash
# Admin Account
Email: admin@test.com
Password: admin123

# User Account  
Email: user@test.com
Password: user123
```

## 📊 Database Schema

### Core Tables
- **users**: User profiles and account information
- **wallets**: User wallet balances and financial data
- **services**: Available services catalog
- **orders**: Customer orders and status tracking
- **transactions**: Financial transaction history
- **order_items**: Individual items within orders

### Relationships
- Users have one wallet (1:1)
- Users can have multiple orders (1:many)
- Orders contain multiple order items (1:many)
- Users have multiple transactions (1:many)

## 🎯 Key Features

### Admin Capabilities
- **Dashboard Overview**: Quick stats and recent activity
- **User Management**: Full CRUD operations for user accounts
- **Service Catalog**: Manage available services and pricing
- **Order Processing**: View and update order statuses
- **Financial Tracking**: Monitor transactions and revenue
- **AI Content Tools**: Optimize service descriptions

### User Experience
- **Service Browsing**: Explore available services
- **Order Management**: Place and track orders
- **Wallet System**: Secure payment processing
- **Transaction History**: Complete financial records
- **Profile Management**: Update personal information

## 🔧 Development

### Adding New Features
1. **API Routes**: Add to `src/app/api/`
2. **Pages**: Add to appropriate `src/app/` subdirectory
3. **Components**: Add to `src/components/`
4. **Database Changes**: Update Prisma schema and migrate

### Code Quality
- TypeScript for type safety
- ESLint and Prettier for code formatting
- Zod for runtime validation
- Error boundaries for graceful error handling

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT signing
- `GOOGLE_GENAI_API_KEY`: For AI features (optional)

## 🔒 Security Features

- JWT-based authentication with secure token handling
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection with proper data sanitization
- CSRF protection through SameSite cookies
- Rate limiting on sensitive endpoints

## 📈 Performance

- Server-side rendering with Next.js
- Optimized database queries with Prisma
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient state management with React Context

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the codebase comments and TypeScript types

---

**Built with ❤️ using Next.js 15, TypeScript, and PostgreSQL**
