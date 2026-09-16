import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant {
  participantId: mongoose.Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
}

export interface ILiveClass extends Document {
  title: string;
  description?: string;
  roomName: string;
  class: string;
  subject: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'live' | 'ended';
  isRecordingEnabled?: boolean;
  createdBy?: mongoose.Types.ObjectId;
  participants?: IParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const liveClassSchema = new Schema<ILiveClass>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String
  },
  roomName: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['9th standard', '10th standard', '11th standard', '12th standard']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  isRecordingEnabled: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  participants: [{
    participantId: {
      type: Schema.Types.ObjectId,
      ref: 'Admission'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

liveClassSchema.index({ class: 1, status: 1, scheduledAt: -1 });
liveClassSchema.index({ status: 1, scheduledAt: 1 });

const LiveClass: Model<ILiveClass> = mongoose.models.LiveClass || mongoose.model<ILiveClass>('LiveClass', liveClassSchema);

export default LiveClass;

