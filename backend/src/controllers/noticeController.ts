import { Request, Response } from 'express';
import Notice from '../models/Notice';

export async function getNotices(req: Request, res: Response) {
  try {
    const { class: targetClass } = req.query;

    const query: any = {};
    if (targetClass && targetClass !== 'All') {
      query.class = { $in: [targetClass, 'All'] };
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 }).lean();

    const formattedNotices = notices.map((notice: any) => ({
      id: notice._id.toString(),
      title: notice.title,
      message: notice.message,
      postedBy: notice.postedBy || 'Admin',
      class: notice.class || 'All',
      documentUrl: notice.documentUrl || '',
      isImportant: !!notice.isImportant,
      createdAt: notice.createdAt,
    }));

    return res.json({
      success: true,
      data: formattedNotices,
      notices: formattedNotices,
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notices', error: error.message });
  }
}
