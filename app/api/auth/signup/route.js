import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }


    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? 'admin' : (role === 'admin' ? 'admin' : 'member');

    const user = await User.create({ name, email, password, role: assignedRole });

    const token = signToken({ id: user._id, email: user.email, role: user.role, name: user.name });

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      message: 'Account created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ error: messages[0] }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
