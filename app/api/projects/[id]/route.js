import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import Task from '@/models/Task';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';


export async function GET(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { id } = await params;

  const project = await Project.findById(id)
    .populate('owner', 'name email')
    .populate('members', 'name email role');

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const isMember = project.members.some(m => m._id.toString() === user.id);
  if (!isMember && user.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const tasks = await Task.find({ project: id })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return NextResponse.json({ project, tasks });
}


export async function PUT(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (project.owner.toString() !== user.id && user.role !== 'admin') {
    return NextResponse.json({ error: 'Only the project owner or admin can edit this project' }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, status: projectStatus, color } = body;

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (projectStatus) project.status = projectStatus;
  if (color) project.color = color;

  await project.save();
  return NextResponse.json({ project });
}


export async function DELETE(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await dbConnect();
  const { id } = await params;
  await Project.findByIdAndDelete(id);
  await Task.deleteMany({ project: id });

  return NextResponse.json({ message: 'Project deleted' });
}
