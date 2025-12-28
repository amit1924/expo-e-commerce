import User from '../models/user.model.js';

export const addAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;
    const user = req.user;

    //if this is default,unset all other addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }
    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false,
    });
    await user.save();
    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error });
  }
};

export const getAddress = (req, res) => {
  try {
    const user = req.user;
    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res
        .status(400)
        .json({ message: 'Incomplete address information' });
    }
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving addresses', error });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;
    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    if (!isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }
    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();
    res.status(200).json({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating address', error });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = req.user;

    const address = user.addresses.pull(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await user.save();
    res.status(200).json({
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address', error });
  }
};

export const addToWishList = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!user.wishlist) {
      user.wishlist = [];
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    user.wishlist.push(productId);

    await user.save();
    res.status(201).json({
      message: 'Product added to wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error });
  }
};

export const getWishList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wishlist', error });
  }
};

export const removeFromWishList = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    user.wishlist.pull(productId);
    // check if product was in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    await user.save();
    res.status(200).json({
      message: 'Product removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
};
