import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';


export async function PUT(request, { params }) {
  const { user, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { id } = await params;
  const { role } = await request.json();

  if (!['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be admin or member' }, { status: 400 });
  }

  if (id === user.id) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: updated });
}
