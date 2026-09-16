import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITempAdmission extends Document {
  studentName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup: string;
  category: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  standard: string;
  previousSchool: string;
  photo?: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const tempAdmissionSchema = new Schema<ITempAdmission>({
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  category: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  alternatePhoneNumber: { type: String },
  email: { type: String, required: true, lowercase: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  standard: { type: String, required: true },
  previousSchool: { type: String, required: true },
  photo: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now }
});

const TempAdmission: Model<ITempAdmission> = mongoose.models.TempAdmission || mongoose.model<ITempAdmission>('TempAdmission', tempAdmissionSchema);

export default TempAdmission;
