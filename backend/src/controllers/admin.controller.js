import cloudinary from '../config/cloudinary.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

/* ==============================
   CREATE PRODUCT
================================ */
export async function createProduct(req, res) {
  const { name, price, description, stock, category } = req.body;

  try {
    // 🔎 Validation
    if (!name || !price || !description || !stock || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one image is required' });
    }

    if (req.files.length > 3) {
      return res
        .status(400)
        .json({ message: 'A maximum of 3 images are allowed' });
    }

    // ☁️ Upload images to Cloudinary
    const uploadResults = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
        }),
      ),
    );

    // 🖼️ Prepare image data for DB
    const imageUrls = uploadResults.map((result) => ({
      url: result.secure_url,
    }));

    // 💾 Save product (ONLY ONCE)
    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
      category,
      images: imageUrls,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ==============================
   GET ALL PRODUCTS
================================ */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ==============================
   UPDATE PRODUCT
================================ */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock, category } = req.body;

    const product = await Product.findByIdAndUpdate(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (name) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (description) product.description = description;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    //handle image updates if new images are provided
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res
          .status(400)
          .json({ message: 'A maximum of 3 images are allowed' });
      }

      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: 'products',
        }),
      );
      const uploadResults = await Promise.all(uploadPromises);

      const imageUrls = uploadResults.map((result) => ({
        url: result.secure_url,
      }));
      product.images = imageUrls;
    }

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    await order.save();
    res
      .status(200)
      .json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllCustomers(_, res) {
  try {
    const customers = await User.find().select().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getDashboardStats(_, res) {
  try {
    const totalOrders = await Order.countDocuments();
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments();

    res.status(200).json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
