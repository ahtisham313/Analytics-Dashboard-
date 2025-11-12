import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;

