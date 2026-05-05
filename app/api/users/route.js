import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';


export async function GET() {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return NextResponse.json({ users });
}
