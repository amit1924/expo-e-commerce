import { Router } from 'express';
import {
  addAddress,
  addToWishList,
  deleteAddress,
  getAddress,
  getWishList,
  removeFromWishList,
  updateAddress,
} from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protectRoute);

//address routes
router.post('/addresses', addAddress);
router.get('/addresses', getAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

//wishlist routes
router.post('/wishlist', addToWishList);
router.get('/wishlist', getWishList);
router.delete('/wishlist/:productId', removeFromWishList);

export default router;
