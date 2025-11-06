import mongoose from 'mongoose';
const RedistSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  suggestedDiscount: Number,
  status: { type: String, enum: ['open','claimed','closed'], default: 'open' }
}, { timestamps: true });
export default mongoose.model('Redistribution', RedistSchema);
