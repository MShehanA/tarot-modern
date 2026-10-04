require('dotenv').config();
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const mysql=require('mysql2/promise');
const crypto=require('crypto');
const path=require('path');
const app=express();
const PORT=process.env.PORT||3000;
const pool=mysql.createPool({host:process.env.DB_HOST||'localhost',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'tarot_modern',waitForConnections:true,connectionLimit:10,timezone:'+07:00'});
app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.CORS_ORIGIN||true}));
app.use(express.json({limit:'100kb'}));
app.use(rateLimit({windowMs:15*60*1000,max:120,standardHeaders:true,legacyHeaders:false}));
function publicId(){return 'TM-'+crypto.randomBytes(5).toString('base64url').replace(/[^A-Z0-9]/gi,'').toUpperCase().slice(0,7).padEnd(7,'X')}
function validDate(s){if(typeof s!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s))return false;const d=new Date(s+'T00:00:00');return !Number.isNaN(d.getTime())&&d>=new Date('1900-01-01')&&d<=new Date()}
function cleanText(v,max=100){return typeof v==='string'?v.trim().slice(0,max):''}
function validate(body){const name=cleanText(body.name),birthPlace=cleanText(body.birthPlace),topic=cleanText(body.topic,50),birthDate=body.birthDate;const visibility=['private','unlisted','public'].includes(body.visibility)?body.visibility:'unlisted';const cards=Array.isArray(body.cards)?body.cards:[];if(!name||!birthPlace||!validDate(birthDate)||!['asmara','karier','keuangan','diri'].includes(topic)||cards.length!==5)throw new Error('Data pembacaan tidak valid.');const ids=cards.map(c=>cleanText(c.card,100));if(new Set(ids).size!==5)throw new Error('Kartu tidak boleh duplikat.');return {name,birthPlace,birthDate,topic,visibility,cards,overview:cleanText(body.overview,5000),interpretations:Array.isArray(body.interpretations)?body.interpretations:cards.map(c=>c.interpretation||''),conclusion:cleanText(body.conclusion,5000)} }
app.post('/api/readings',async(req,res)=>{try{const v=validate(req.body);let id;for(let i=0;i<5;i++){id=publicId();const [x]=await pool.execute('SELECT id FROM tarot_readings WHERE public_id=?',[id]);if(!x.length)break}const [result]=await pool.execute(`INSERT INTO tarot_readings (public_id,name,birth_place,birth_date,topic,cards,overview,interpretations,conclusion,visibility,session_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[id,v.name,v.birthPlace,v.birthDate,v.topic,JSON.stringify(v.cards),v.overview,JSON.stringify(v.interpretations),v.conclusion,v.visibility,cleanText(req.headers['x-session-id'],128)||null]);res.status(201).json({success:true,publicId:id,insertId:result.insertId})}catch(e){res.status(400).json({success:false,message:'Pembacaan belum dapat disimpan. Periksa data dan coba lagi.'})}});
app.get('/api/readings/:publicId',async(req,res)=>{try{const [rows]=await pool.execute('SELECT public_id,name,topic,cards,overview,interpretations,conclusion,visibility,created_at FROM tarot_readings WHERE public_id=? LIMIT 1',[cleanText(req.params.publicId,32)]);if(!rows.length)return res.status(404).json({message:'Pembacaan tidak ditemukan atau sudah dihapus.'});const r=rows[0];if(r.visibility==='private')return res.status(403).json({message:'Pembacaan ini bersifat privat.'});r.cards=typeof r.cards==='string'?JSON.parse(r.cards):r.cards;r.interpretations=typeof r.interpretations==='string'?JSON.parse(r.interpretations):r.interpretations;res.json({...r,publicId:r.public_id,createdAt:r.created_at});}catch(e){res.status(500).json({message:'Server sedang tidak tersedia.'})}});
app.delete('/api/readings/:publicId',async(req,res)=>{try{const id=cleanText(req.params.publicId,32);const [r]=await pool.execute('DELETE FROM tarot_readings WHERE public_id=?',[id]);if(!r.affectedRows)return res.status(404).json({message:'Pembacaan tidak ditemukan atau sudah dihapus.'});res.json({success:true})}catch(e){res.status(500).json({message:'Server sedang tidak tersedia.'})}});
app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true})}catch{res.status(503).json({ok:false})}});
app.use(express.static(path.join(__dirname,'..')));
app.listen(PORT,()=>console.log(`Tarot-Modern API berjalan di http://localhost:${PORT}`));
