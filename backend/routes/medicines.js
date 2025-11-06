import express from 'express';
import jwt from 'jsonwebtoken';
import Medicine from '../models/Medicine.js';
import Redistribution from '../models/Redistribution.js';
const router = express.Router();
const auth = (req,res,next)=>{
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error:'No token' });
  const token = h.split(' ')[1];
  try{ const data = jwt.verify(token, process.env.JWT_SECRET || 'devsecret'); req.user = data; next(); }catch(e){ return res.status(401).json({ error:'Invalid token' }); }
};
router.post('/medicines', auth, async (req,res)=>{
  try{ const { name, batch, quantity, expiryDate, notes } = req.body; if(!name||!expiryDate) return res.status(400).json({ error:'name & expiryDate required' }); const med = new Medicine({ name, batch, quantity: Number(quantity)||0, expiryDate: new Date(expiryDate), notes, createdBy: req.user.id }); await med.save(); res.json(med);}catch(e){ res.status(500).json({ error: e.message }); }
});
router.get('/medicines', auth, async (req,res)=>{ const list = await Medicine.find().sort({ expiryDate: 1 }); res.json(list); });
router.delete('/medicines/:id', auth, async (req,res)=>{ await Medicine.findByIdAndDelete(req.params.id); res.json({ success:true }); });
router.get('/alerts', auth, async (req,res)=>{ const days = Number(req.query.days) || 14; const now = new Date(); const soon = new Date(now.getTime() + days*24*60*60*1000); const list = await Medicine.find({ expiryDate: { $lte: soon } }).sort({ expiryDate: 1 }); res.json(list); });
router.post('/redistribute', auth, async (req,res)=>{ const { medicineId, reason, suggestedDiscount } = req.body; const med = await Medicine.findById(medicineId); if(!med) return res.status(404).json({ error:'medicine not found' }); const entry = new Redistribution({ medicine: med._id, from: req.user.id, reason, suggestedDiscount }); await entry.save(); res.json(entry); });
router.get('/redistributions', auth, async (req,res)=>{ const list = await Redistribution.find().populate('medicine').populate('from'); res.json(list); });
export default router;
