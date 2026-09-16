import { connectDatabase } from './database';
import Admin from '@/models/Admin';
import Notice from '@/models/Notice';
import Video from '@/models/Video';

export async function seedDatabase() {
  try {
    await connectDatabase();
    console.log('[SEED] Starting database seeding...');

    // Seed Admin Users
    const adminExists = await Admin.findOne({ email: 'admin@raventutorials.com' });
    if (!adminExists) {
      await Admin.create({
        email: 'admin@raventutorials.com',
        password: 'Admin@123',
        name: 'Super Admin',
        role: 'super-admin',
        isActive: true,
      });
      console.log('[SUCCESS] Admin user created');
    }

    // Seed additional admin provided by user
    const userAdminExists = await Admin.findOne({ email: 'vs.aniket07@gmail.com' });
    if (!userAdminExists) {
      await Admin.create({
        email: 'vs.aniket07@gmail.com',
        password: 'Aniket1812@',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });
      console.log('[SUCCESS] User-provided admin created: vs.aniket07@gmail.com');
    }

    // Seed Sample Notices
    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      await Notice.insertMany([
        {
          title: 'Welcome to Raven Tutorials',
          content: 'We are excited to have you join our learning community. Explore our courses and start your journey!',
          category: 'general',
          priority: 'high',
          isActive: true,
          publishedAt: new Date(),
        },
        {
          title: 'New Course Updates',
          content: 'We have added new study materials and video lectures. Check them out in your dashboard.',
          category: 'academic',
          priority: 'medium',
          isActive: true,
          publishedAt: new Date(),
        },
        {
          title: 'Exam Schedule Released',
          content: 'Monthly test schedules have been published. Please check your test section for details.',
          category: 'exam',
          priority: 'high',
          isActive: true,
          publishedAt: new Date(),
        },
      ]);
      console.log('[SUCCESS] Sample notices created');
    }

    // Seed Sample Videos
    const videoCount = await Video.countDocuments();
    if (videoCount === 0) {
      await Video.insertMany([
        {
          title: 'Introduction to Web Development',
          description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
          url: 'https://example.com/video1.mp4',
          thumbnail: 'https://example.com/thumb1.jpg',
          duration: 1200,
          subject: 'Web Development',
          class: '11th',
          views: 0,
          isActive: true,
        },
        {
          title: 'Advanced JavaScript Concepts',
          description: 'Deep dive into advanced JavaScript topics including closures, promises, and async/await',
          url: 'https://example.com/video2.mp4',
          thumbnail: 'https://example.com/thumb2.jpg',
          duration: 1800,
          subject: 'Programming',
          class: '12th',
          views: 0,
          isActive: true,
        },
      ]);
      console.log('[SUCCESS] Sample videos created');
    }

    console.log('[DONE] Database seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('[ERROR] Error seeding database:', error);
    return { success: false, message: 'Failed to seed database', error };
  }
}

export async function clearDatabase() {
  try {
    await connectDatabase();
    console.log('[CLEAR] Clearing database...');

    await Admin.deleteMany({});
    await Notice.deleteMany({});
    await Video.deleteMany({});

    console.log('[SUCCESS] Database cleared successfully');
    return { success: true, message: 'Database cleared successfully' };
  } catch (error) {
    console.error('[ERROR] Error clearing database:', error);
    return { success: false, message: 'Failed to clear database', error };
  }
}

export async function getDatabaseStats() {
  try {
    await connectDatabase();

    const stats = {
      admins: await Admin.countDocuments(),
      notices: await Notice.countDocuments(),
      videos: await Video.countDocuments(),
    };

    return { success: true, stats };
  } catch (error) {
    console.error('[ERROR] Error getting database stats:', error);
    return { success: false, message: 'Failed to get stats', error };
  }
}
