import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Notice from '@/models/Notice';
import { authenticateAdmin } from '@/lib/apiMiddleware';

// GET all notices (public API)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const targetClass = searchParams.get('class');

    const query = targetClass && targetClass !== 'All'
      ? { class: { $in: [targetClass, 'All'] } }
      : {};

    const notices = await Notice.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      { success: true, data: notices },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching notices from DB:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST a new notice (admin only)
export async function POST(req: NextRequest) {
  try {
    const { admin, error } = await authenticateAdmin();
    if (error || !admin) {
      return error || NextResponse.json({ success: false, message: 'Admin authentication required' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const noticeClass = (formData.get('class') as string) || 'All';
    const isImportant = formData.get('isImportant') === 'true';
    let documentUrl = '';

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Handle document upload if present
    const file = formData.get('document') as File | null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const fs = require('fs').promises;
      const path = require('path');

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);

      documentUrl = `/uploads/${filename}`;
    }

    const notice = await Notice.create({
      title,
      message,
      postedBy: admin.name || 'Admin',
      class: noticeClass,
      documentUrl,
      isImportant,
      createdBy: admin._id,
    });

    return NextResponse.json({ success: true, data: notice }, { status: 201 });
  } catch (error: any) {
    console.error('Error posting notice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to post notice' },
      { status: 500 }
    );
  }
}

