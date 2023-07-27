const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not found' });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
