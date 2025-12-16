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
  { event: 'clerk/user.created' },
  async ({ event }) => {
    console.log('📩 Clerk user.created event received');

    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const userData = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
      image: image_url || '',
      addresses: [],
      wishlist: [],
    };

    await User.create(userData);

    console.log('✅ User saved to database');
  },
);

/* ==============================
   USER DELETED
================================ */
const deleteUserFromDB = inngest.createFunction(
  { id: 'delete-user' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    console.log('🗑️ Clerk user.deleted event received');

    await connectDB();
    await User.deleteOne({ clerkId: event.data.id });

    console.log('✅ User deleted from database');
  },
);

export const functions = [syncUser, deleteUserFromDB];
