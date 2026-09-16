import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceStudent {
  studentId: mongoose.Types.ObjectId;
  status: 'Present' | 'Absent' | 'Late';
}

export interface IAttendance extends Document {
  class: string;
  subject: string;
  date: Date;
  students: IAttendanceStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>({
  class: {
    type: String,
    required: true,
    enum: ['6th', '7th', '8th', '9th', '10th', '11th', '12th']
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  students: [{
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Admission',
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Absent'
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same class/subject/date
attendanceSchema.index({ class: 1, subject: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
