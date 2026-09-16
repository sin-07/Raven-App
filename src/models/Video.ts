import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  subject: string;
  class: string;
  duration?: number;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['9th standard', '10th standard', '11th standard', '12th standard']
  },
  duration: {
    type: Number
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', videoSchema);

export default Video;
