import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    //validate product and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with id ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });
      }

      const order = new Order({
        user: user._id,
        clerkId: user.clerkId,
        orderItems,
        shippingAddress,
        paymentResult,
        totalPrice,
      });
      //update product stock
      for (const item of orderItems) {
        const product = await Product.findById(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }
      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating order', error });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    // Check if each order is reviewed
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const review = await Review.findOne({
          orderId: order._id,
        });

        return {
          ...order.toObject(),
          hasReviewed: !!review,
        };
      }),
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
}
