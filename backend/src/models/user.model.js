import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: String,
  fullName: String,
  streetAddress: String,
  city: String,
  state: String,
  zipCode: String,
  phoneNumber: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: '',
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
