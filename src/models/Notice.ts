import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
  title: string;
  message: string;
  documentUrl?: string;
  postedBy?: string;
  class?: string;
  createdBy?: mongoose.Types.ObjectId;
  isImportant?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notice message is required'],
    },
    documentUrl: {
      type: String,
    },
    postedBy: {
      type: String,
      default: 'Admin',
    },
    class: {
      type: String,
      default: 'All',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ class: 1, createdAt: -1 });

const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;

