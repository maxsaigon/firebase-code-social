import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test query
    const users = await prisma.user.findMany({
      take: 1
    });
    console.log('✅ Query successful, users found:', users.length);
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount: users.length,
      users: users
    });
    
  } catch (error: unknown) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Database connection failed'
    }, { status: 500 });
  }
}
