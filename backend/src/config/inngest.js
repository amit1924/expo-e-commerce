import { Inngest } from 'inngest';
import { connectDB } from './db.js';
import User from '../models/user.model.js';

// Create Inngest client
export const inngest = new Inngest({
  id: 'ecommerce-app',
});

/* ==============================
   USER CREATED
   Event: webhook-integration/user.created
================================ */
const syncUser = inngest.createFunction(
  { id: 'sync-user' },
  { event: 'webhook-integration/user.created' }, // ✅ FIXED EVENT NAME
  async ({ event }) => {
    console.log('🔥 webhook-integration/user.created received');
    console.log('📦 Event payload:', JSON.stringify(event.data, null, 2));

    await connectDB();
    console.log('✅ MongoDB connected');

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

    console.log('🎉 User saved to MongoDB');
  },
);

/* ==============================
   USER DELETED
   Event: webhook-integration/user.deleted
================================ */
const deleteUserFromDB = inngest.createFunction(
  { id: 'delete-user-from-db' },
  { event: 'webhook-integration/user.deleted' }, // ✅ FIXED EVENT NAME
  async ({ event }) => {
    console.log('🗑️ webhook-integration/user.deleted received');

    await connectDB();
    await User.deleteOne({ clerkId: event.data.id });

    console.log('✅ User deleted from MongoDB');
  },
);

// Export all functions
export const functions = [syncUser, deleteUserFromDB];
