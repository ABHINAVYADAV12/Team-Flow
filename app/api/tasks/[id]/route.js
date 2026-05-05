import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import User from '@/models/User';
import Project from '@/models/Project';
import { requireAuth } from '@/lib/auth';


export async function GET(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { id } = await params;
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name color');

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  return NextResponse.json({ task });
}


export async function PUT(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { id } = await params;
  const task = await Task.findById(id);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const body = await request.json();
  const isAssignee = task.assignedTo?.toString() === user.id;
  const isCreator = task.createdBy.toString() === user.id;
  const isAdmin = user.role === 'admin';


  if (!isAdmin && !isAssignee && !isCreator) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  if (body.status) {
    task.status = body.status;
  }


  if (isAdmin || isCreator) {
    if (body.title) task.title = body.title;
    if (body.description !== undefined) task.description = body.description;
    if (body.priority) task.priority = body.priority;
    if (body.dueDate !== undefined) task.dueDate = body.dueDate;
    if (isAdmin && body.assignedTo !== undefined) task.assignedTo = body.assignedTo || null;
  }

  await task.save();
  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'project', select: 'name color' },
  ]);

  return NextResponse.json({ task: populated });
}


export async function DELETE(request, { params }) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  await dbConnect();
  const { id } = await params;
  await Task.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Task deleted' });
}
