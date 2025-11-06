import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();
router.post('/register', async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({error:'Email exists'});
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash, role: role||'pharmacist' });
    await user.save();
    res.json({ success: true, id: user._id });
  }catch(e){ res.status(500).json({ error: e.message }); }
});
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  }catch(e){ res.status(500).json({ error: e.message }); }
});
export default router;
