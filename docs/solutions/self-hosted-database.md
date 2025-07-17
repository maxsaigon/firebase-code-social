# Giải pháp 4: Tự xây dựng Database thay thế Supabase

## Lựa chọn 1: PostgreSQL + Prisma + NextAuth

### Bước 1: Setup PostgreSQL và Prisma

```bash
npm install prisma @prisma/client
npm install next-auth @next-auth/prisma-adapter
npm install bcryptjs
```

### Bước 2: Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  full_name     String?
  avatar_url    String?
  is_admin      Boolean   @default(false)
  status        String    @default("active")
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts     Account[]
  sessions     Session[]
  wallet       Wallet?
  orders       Order[]
  transactions Transaction[]
}

model Wallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  balance   Decimal  @default(0.00)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Service {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal
  is_active   Boolean  @default(true)
  category    String   @default("general")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orders Order[]
}

model Order {
  id          String   @id @default(cuid())
  userId      String
  serviceId   String
  quantity    Int
  unit_price  Decimal
  total_amount Decimal
  status      String   @default("pending")
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  service      Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  transactions Transaction[]
}

model Transaction {
  id           String   @id @default(cuid())
  userId       String
  orderId      String?
  amount       Decimal
  type         String
  status       String   @default("completed")
  description  String?
  reference_id String?
  createdAt    DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  order Order? @relation(fields: [orderId], references: [id], onDelete: SetNull)
}
```

### Bước 3: NextAuth Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_admin: user.is_admin,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.is_admin = token.is_admin
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.is_admin = user.is_admin
      }
      return token
    }
  },
  events: {
    async signUp({ user }) {
      // Tạo wallet khi user đăng ký
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0.00
        }
      })
    }
  }
}

export default NextAuth(authOptions)
```

### Bước 4: API Routes

```typescript
// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, full_name } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    // Kiểm tra user đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Tạo user và wallet trong transaction
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          full_name,
          is_admin: false,
          status: 'active'
        }
      })

      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: 0.00
        }
      })

      return { user, wallet }
    })

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.full_name
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

## Lựa chọn 2: MongoDB + Mongoose + NextAuth

### Bước 1: Setup MongoDB

```bash
npm install mongoose
npm install next-auth @next-auth/mongodb-adapter
```

### Bước 2: Mongoose Models

```typescript
// models/User.ts
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String },
  avatar_url: { type: String },
  is_admin: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  emailVerified: { type: Date },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', userSchema)

// models/Wallet.ts
const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0.00 },
}, { timestamps: true })

export default mongoose.models.Wallet || mongoose.model('Wallet', walletSchema)
```

## Lựa chọn 3: Firebase Authentication + Firestore

### Bước 1: Setup Firebase

```bash
npm install firebase firebase-admin
```

### Bước 2: Firebase Config

```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // Your Firebase config
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### Bước 3: Authentication Service

```typescript
// lib/auth.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export const authService = {
  async register(email: string, password: string, full_name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Tạo user profile
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        full_name,
        is_admin: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Tạo wallet
      await setDoc(doc(db, 'wallets', user.uid), {
        userId: user.uid,
        balance: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      return user
    } catch (error) {
      throw error
    }
  },

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  },

  async logout() {
    return firebaseSignOut(auth)
  },

  async getCurrentUser() {
    const user = auth.currentUser
    if (!user) return null
    
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    return userDoc.exists() ? { id: user.uid, ...userDoc.data() } : null
  }
}
```

## So sánh các lựa chọn:

| Tiêu chí | PostgreSQL + Prisma | MongoDB + Mongoose | Firebase |
|----------|---------------------|-------------------|----------|
| **Độ phức tạp** | Trung bình | Trung bình | Thấp |
| **Performance** | Cao | Cao | Trung bình |
| **Scalability** | Cao | Rất cao | Rất cao |
| **Cost** | Thấp-Trung bình | Thấp-Trung bình | Trung bình-Cao |
| **Learning curve** | Trung bình | Trung bình | Thấp |
| **Real-time** | Cần thêm tools | Cần thêm tools | Built-in |
| **Backup & Recovery** | Cần setup | Cần setup | Tự động |

## Khuyến nghị:

1. **Firebase**: Nếu muốn giải pháp nhanh, đơn giản, có real-time built-in
2. **PostgreSQL + Prisma**: Nếu cần performance cao, complex queries, và kiểm soát hoàn toàn
3. **MongoDB**: Nếu data structure linh hoạt, cần scale nhanh
