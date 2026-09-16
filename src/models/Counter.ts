import mongoose, { Schema, Model } from 'mongoose';

interface ICounter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 }
}, { _id: false });

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema);

export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return counter!.sequence;
}

export default Counter;
