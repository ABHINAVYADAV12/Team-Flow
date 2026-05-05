import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
}, { timestamps: true });


ProjectSchema.pre('save', function () {
  if (!this.members.map(m => m.toString()).includes(this.owner.toString())) {
    this.members.push(this.owner);
  }
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
