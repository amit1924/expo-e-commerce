import { requireAuth } from '@clerk/express';
import User from '../models/user.model.js';

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await User.findOne({ clerkId });
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized-user not found' });
  }

  if (req.user.email !== process.env.ADMIN_EMAIl) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
