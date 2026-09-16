import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Lazy initialization of Razorpay
let razorpayInstance: Razorpay | null = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not found in environment variables');
    }
    
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
};

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amount * 100, // amount in paise
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error creating payment order'
    }, { status: 500 });
  }
}
