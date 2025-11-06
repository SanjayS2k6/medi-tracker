import mongoose from 'mongoose';
const MedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batch: String,
  quantity: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export default mongoose.model('Medicine', MedSchema);
