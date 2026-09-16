import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase, clearDatabase, getDatabaseStats } from '@/lib/seedData';
import { connectDatabase } from '@/lib/database';
import Notice from '@/models/Notice';

export async function GET(request: NextRequest) {
  try {
    const stats = await getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to get database stats', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'seed') {
      const result = await seedDatabase();
      return NextResponse.json(result);
    } else if (action === 'clear') {
      const result = await clearDatabase();
      return NextResponse.json(result);
    } else if (action === 'insert-performance-notice') {
      // Insert the performance notice
      await connectDatabase();
      
      const noticeData = {
        title: 'IMPORTANT NOTICE - Temporary System Performance Update',
        message: `Dear Students,

SYSTEM PERFORMANCE ADVISORY

We would like to inform you that our system may experience slower response times during peak usage hours. This is due to our current use of free-tier backend services while we work diligently on upgrading our infrastructure to provide you with a better experience.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLEASE NOTE THE FOLLOWING GUIDELINES:

• Avoid refreshing the page repeatedly - This may further slow down the system
• Be patient with page loading - If a page takes time to load, please wait for a few moments before trying again
• Your data is secure - All your data and progress are completely safe and secure
• Improvements underway - We are actively working to enhance system performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR COOPERATION MATTERS:

We understand this may cause some inconvenience, and we sincerely appreciate your patience and understanding during this transitional period. Your cooperation is highly valued - please be patient and avoid rushing through actions on the platform. Give the system adequate time to process your requests.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEED HELP?

If you encounter any critical issues or have urgent concerns, please feel free to contact the administration immediately. We're here to support you!

Thank you for your understanding, patience, and continued support.

With Regards,
ANIKET SINGH
Lead Developer, Raven Tutorials`,
        isImportant: true,
        postedBy: 'ANIKET SINGH'
      };

      const notice = new Notice(noticeData);
      await notice.save();

      return NextResponse.json({
        success: true,
        message: 'Performance notice inserted successfully',
        data: {
          id: notice._id,
          title: notice.title,
          createdAt: notice.createdAt
        }
      });
    } else if (action === 'update-performance-notice') {
      // Update the existing performance notice
      await connectDatabase();
      
      const updatedData = {
        title: 'IMPORTANT NOTICE - Temporary System Performance Update',
        message: `Dear Students,

SYSTEM PERFORMANCE ADVISORY

We would like to inform you that our system may experience slower response times during peak usage hours. This is due to our current use of free-tier backend services while we work diligently on upgrading our infrastructure to provide you with a better experience.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLEASE NOTE THE FOLLOWING GUIDELINES:

• Avoid refreshing the page repeatedly - This may further slow down the system
• Be patient with page loading - If a page takes time to load, please wait for a few moments before trying again
• Your data is secure - All your data and progress are completely safe and secure
• Improvements underway - We are actively working to enhance system performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR COOPERATION MATTERS:

We understand this may cause some inconvenience, and we sincerely appreciate your patience and understanding during this transitional period. Your cooperation is highly valued - please be patient and avoid rushing through actions on the platform. Give the system adequate time to process your requests.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEED HELP?

If you encounter any critical issues or have urgent concerns, please feel free to contact the administration immediately. We're here to support you!

Thank you for your understanding, patience, and continued support.

With Regards,
ANIKET SINGH
Lead Developer, Raven Tutorials`,
        isImportant: true,
        postedBy: 'ANIKET SINGH'
      };

      const result = await Notice.findOneAndUpdate(
        { title: { $regex: /Temporary.*System Performance/i } },
        updatedData,
        { new: true }
      );

      if (!result) {
        return NextResponse.json({
          success: false,
          message: 'Notice not found. Use "insert-performance-notice" action instead.'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Performance notice updated successfully',
        data: {
          id: result._id,
          title: result.title,
          createdAt: result.createdAt
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "seed", "clear", "insert-performance-notice", or "update-performance-notice"' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process request', error },
      { status: 500 }
    );
  }
}
