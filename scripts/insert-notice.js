/**
 * Script to insert system performance notice
 * Run with: node scripts/insert-notice.js
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI || 'mongodb://localhost:27017/raven-tutorials';

console.log('🔍 MongoDB URI loaded:', MONGODB_URI ? 'Yes' : 'No');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  documentUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  isImportant: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);

async function insertNotice() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const noticeData = {
      title: 'NOTICE TO ALL STUDENTS - Temporary Slowness in System Performance',
      message: `Dear Students,

We would like to inform you that our system may experience slower response times during peak usage hours. This is because we are currently using free backend services while we work on upgrading our infrastructure.

We understand that this may cause some inconvenience, and we sincerely appreciate your patience and understanding during this time.

Please Note:
- Avoid refreshing the page repeatedly as this may further slow down the system
- If a page takes time to load, please wait for a few moments before trying again
- All your data and progress are safe and secure
- We are working to improve the system performance soon

Your cooperation in this matter is highly valued. Please be patient, and avoid rushing through actions on the platform. Give the system some time to process your requests.

If you face any critical issues, please feel free to contact the administration.

Thank you for your understanding and support.

Regards,
ANIKET SINGH
DEVELOPER`,
      isImportant: true
    };

    console.log('📝 Inserting notice...');
    const notice = new Notice(noticeData);
    await notice.save();

    console.log('✅ Notice inserted successfully!');
    console.log('📋 Notice Details:');
    console.log(`   ID: ${notice._id}`);
    console.log(`   Title: ${notice.title}`);
    console.log(`   Created: ${notice.createdAt}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

insertNotice();
