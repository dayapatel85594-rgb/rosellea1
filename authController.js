import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

// create token with safe defaults for local/dev environments
const genToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'dev_secret',
  { expiresIn: process.env.JWT_EXPIRE || '7d' }
);

export const register = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password } = req.body;
    
    if ((!name && !(firstName && lastName)) || !email || !password) {
      throw new Error('First name, last name, email, and password are required');
    }
    
    if (await User.findOne({ email })) {
      throw new Error('Email is already registered');
    }
    
    const computedName = name || `${firstName} ${lastName}`.trim();
    const user = await User.create({ 
      name: computedName,
      email, 
      password,
      profile: {
        firstName: firstName || computedName.split(' ')[0] || '',
        lastName: lastName || computedName.split(' ').slice(1).join(' ') || ''
      }
    });
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        address: user.profile?.address || {}
      }
    }));
  } catch (error) {
    console.error('Registration error:', error.message);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: error.message
    }));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Invalid email or password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is inactive');
    }
    
    const token = genToken(user._id);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      token, // token at root level
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || {},
        profilePicture: user.profilePicture || ''
      }
    }));
  } catch (error) {
    console.error('Login error:', error.message);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: error.message
    }));
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'User not found'
      }));
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || {},
        profilePicture: user.profilePicture || ''
      }
    }));
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to fetch profile'
    }));
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates._id;
    
    const profileUpdates = {};
    if (typeof updates.firstName === 'string') profileUpdates['profile.firstName'] = updates.firstName;
    if (typeof updates.lastName === 'string') profileUpdates['profile.lastName'] = updates.lastName;
    if (typeof updates.phone === 'string') profileUpdates['profile.phone'] = updates.phone;
    if (updates.address && typeof updates.address === 'object') profileUpdates['profile.address'] = updates.address;
    if (typeof updates.profilePicture === 'string') profileUpdates['profilePicture'] = updates.profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      profileUpdates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'User not found'
      }));
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || {},
        profilePicture: user.profilePicture || ''
      }
    }));
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: error.message
    }));
  }
};
