# Social Service Hub

A comprehensive admin dashboard and user-facing application for managing digital services, built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Migration Complete: Supabase → Self-Hosted PostgreSQL

This project has been successfully migrated from Supabase to a self-hosted PostgreSQL solution, providing:

- ✅ **Full Data Control**: Own your user data and business logic
- ✅ **Cost Efficiency**: No monthly Supabase subscription fees  
- ✅ **Performance**: Direct database access without API overhead
- ✅ **Flexibility**: Custom authentication and business rules
- ✅ **Scalability**: Independent database scaling

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL 14 (self-hosted)
- **Authentication**: Custom NextAuth.js with bcrypt
- **Database Client**: node-postgres (pg)
- **ORM**: Prisma (schema & migrations)
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation

## 🏗️ Features

### Admin Dashboard
- User management (CRUD operations)
- Service management with categories
- Order processing and status tracking
- Transaction monitoring and reporting
- Real-time dashboard statistics

### User Portal  
- Service browsing and ordering
- Wallet management (deposits/withdrawals)
- Order history and tracking
- Transaction history
- Profile management

### Authentication System
- Secure user registration with email verification
- Password hashing with bcrypt (12 rounds)
- Role-based access control (Admin/User)
- Automatic wallet creation for new users
- Session management ready for JWT tokens

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maxsaigon/firebase-code-social.git
   cd firebase-code-social
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew install postgresql@14
   brew services start postgresql@14
   
   # Create database
   createdb admin_ecom_db
   ```

4. **Configure environment variables**
   ```bash
   # Create .env.local
   DATABASE_URL="postgresql://localhost:5432/admin_ecom_db"
   NEXTAUTH_URL="http://localhost:9002"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

5. **Set up database**
   ```bash
   # Apply schema
   psql -d admin_ecom_db -f docs/supabase/schema.sql
   
   # Insert sample data (optional)
   psql -d admin_ecom_db -f docs/supabase/seed.sql
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:9002
   ```

## 🔐 Test Accounts

All test accounts use password: `password123`

**Admin Account:**
- Email: `admin@demo.com`
- Access: Full admin dashboard

**Regular Users:**
- `john.doe@gmail.com` - Has orders and transactions
- `jane.smith@gmail.com` - Has wallet balance
- `sarah.johnson@outlook.com` - Active user
- `david.brown@yahoo.com` - Recent orders

## 📊 Database Schema

The application uses a PostgreSQL database with the following core tables:

- **users**: User accounts with authentication
- **wallets**: User wallet balances  
- **services**: Available services for purchase
- **orders**: Service orders placed by users
- **transactions**: Financial transactions

See `docs/doc.md` for detailed schema documentation.

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- SQL injection protection with parameterized queries
- Role-based access control
- Input validation with Zod schemas
- CSRF protection ready
- Environment variable security

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication APIs
│   ├── admin/             # Admin dashboard pages
│   ├── user/              # User portal pages
│   └── auth/              # Login/register pages
├── components/
│   ├── shared/            # Reusable components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and configurations
└── types/                 # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Documentation

- [Full Documentation](docs/doc.md) - Comprehensive project documentation
- [Schema Reference](docs/supabase/schema.sql) - Database schema
- [Sample Data](docs/supabase/seed.sql) - Test data for development

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/doc.md)
2. Search existing [GitHub issues](https://github.com/maxsaigon/firebase-code-social/issues)
3. Create a new issue with detailed information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Next.js and PostgreSQL**
