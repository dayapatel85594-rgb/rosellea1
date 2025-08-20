import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const protect = async (req,res,next)=>{
  const hdr = req.headers.authorization;
  if(hdr&&hdr.startsWith('Bearer ')){
    try{
      const token = hdr.split(' ')[1];
      const d = jwt.verify(token,process.env.JWT_SECRET);
      req.user = await User.findById(d.id).select('-password');
      if(!req.user) throw new Error('User not found');
      return next();
    }catch(e){
      return res.writeHead(401,{'Content-Type':'application/json'}) &&
        res.end(JSON.stringify({success:false,message:'Not authorized'}));
    }
  }
  res.writeHead(401,{'Content-Type':'application/json'});
  res.end(JSON.stringify({success:false,message:'No token'}));
};

export const authorize = (...roles)=> (req,res,next)=>{
  if(!roles.includes(req.user.role)){
    return res.writeHead(403,{'Content-Type':'application/json'}) &&
      res.end(JSON.stringify({success:false,message:'Forbidden'}));
  }
  next();
};
