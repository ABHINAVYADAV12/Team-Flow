import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';


export async function GET(request) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');
  const myTasks = searchParams.get('mine');

  let query = {};
  if (projectId) {
    query.project = projectId;
  } else {

    const userProjects = await Project.find({ members: user.id }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    query.project = { $in: projectIds };
  }

  if (myTasks === 'true') {
    query.assignedTo = user.id;
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('project', 'name color')
    .sort({ createdAt: -1 });

  return NextResponse.json({ tasks });
}


export async function POST(request) {
  const { user, error, status } = await requireAuth();
  if (error) return NextResponse.json({ error }, { status });

  await dbConnect();
  const body = await request.json();
  const { title, description, projectId, assignedTo, priority, dueDate } = body;

  if (!title) return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
  if (!projectId) return NextResponse.json({ error: 'Project is required' }, { status: 400 });

  const project = await Project.findById(projectId);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 });
  }

  const taskAssignee = assignedTo || null;

  const task = await Task.create({
    title,
    description: description || '',
    project: projectId,
    assignedTo: taskAssignee,
    createdBy: user.id,
    priority: priority || 'medium',
    dueDate: dueDate || null,
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'project', select: 'name color' },
  ]);

  return NextResponse.json({ task: populated }, { status: 201 });
}
