import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';


export async function GET() {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();

  const projects = await Project.find({
    $or: [
      { owner: user.id },
      { members: user.id },
    ],
  })
    .populate('owner', 'name email')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

  return NextResponse.json({ projects });
}


export async function POST(request) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can create projects' }, { status: 403 });
  }

  await dbConnect();
  const body = await request.json();
  const { name, description, color } = body;

  if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

  const project = await Project.create({
    name,
    description: description || '',
    color: color || '#6366f1',
    owner: user.id,
    members: [user.id],
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);

  return NextResponse.json({ project: populated }, { status: 201 });
}
