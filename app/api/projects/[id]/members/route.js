import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';


export async function POST(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await dbConnect();
  const { id } = await params;
  const { userId } = await request.json();

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  const memberUser = await User.findById(userId);
  if (!memberUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (!project.members.map(m => m.toString()).includes(userId)) {
    project.members.push(userId);
    await project.save();
  }

  const populated = await project.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members', select: 'name email role' },
  ]);

  return NextResponse.json({ project: populated });
}


export async function DELETE(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await dbConnect();
  const { id } = await params;
  const { userId } = await request.json();

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (project.owner.toString() === userId) {
    return NextResponse.json({ error: 'Cannot remove the project owner' }, { status: 400 });
  }

  project.members = project.members.filter(m => m.toString() !== userId);
  await project.save();

  return NextResponse.json({ message: 'Member removed' });
}
