
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingsRouter from './src/routes/bookings.js';

dotenv.config();
const app = express();
app.use(express.json());

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin:(o,cb)=>{ if(!o)return cb(null,true); cb(allowed.includes(o)?null:new Error('CORS blocked'), allowed.includes(o)); }}));

app.get('/api/health',(req,res)=>res.json({ok:true,time:new Date().toISOString()}));
app.use('/api/bookings', bookingsRouter);

const port = process.env.PORT || 10000;
app.listen(port,()=>console.log('API running on '+port));
