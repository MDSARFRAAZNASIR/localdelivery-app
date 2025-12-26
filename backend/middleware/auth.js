// middleware/auth.js
const jwt = require('jsonwebtoken');
// const User = require('../db/models/userSchemaDefined');
const User = require('../db/models/userSchemaDefined');


const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret'); // set JWT_SECRET in env
    const user = await User.findById(payload.id).lean();
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    console.error('auth error', err && err.message);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;
