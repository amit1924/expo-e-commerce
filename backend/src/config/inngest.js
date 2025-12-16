import { Inngest } from 'inngest';
import { connectDB } from './db.js';
import User from '../models/user.model.js';

export const inngest = new Inngest({
  id: 'ecommerce-app',
});

/* ==============================
   USER CREATED
================================ */
const syncUser = inngest.createFunction(
  { id: 'sync-user' },
  { event: 'user.created' }, // ✅ CORRECT
  async ({ event }) => {
    console.log('🔥 user.created received');

    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    await User.create({
      clerkId: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim(),
      image: image_url || '',
      addresses: [],
      wishlist: [],
    });

    console.log('✅ User saved to MongoDB');
  },
);

/* ==============================
   USER DELETED
================================ */
const deleteUserFromDB = inngest.createFunction(
  { id: 'delete-user-from-db' },
  { event: 'user.deleted' }, // ✅ CORRECT
  async ({ event }) => {
    await connectDB();
    await User.deleteOne({ clerkId: event.data.id });
    console.log('🗑️ User deleted');
  },
);

export const functions = [syncUser, deleteUserFromDB];
