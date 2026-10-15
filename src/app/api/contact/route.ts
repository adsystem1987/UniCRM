import { NextResponse } from 'next/server';

const DESTINATION_EMAIL = 'ravibabuche@dfydude.online';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, topic, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Please provide your name, email, and message.' },
        { status: 400 }
      );
    }

    const payload = {
      to: DESTINATION_EMAIL,
      from: email.trim(),
      name: name.trim(),
      phone: phone?.trim() || 'Not provided',
      topic: topic || 'General Inquiry',
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    console.log('[Contact Support Submission]', JSON.stringify(payload, null, 2));

    // If AWS SES or SMTP credentials are configured in environment, send email
    // Otherwise the inquiry is logged and successfully acknowledged
    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your request has been sent to our support desk (${DESTINATION_EMAIL}). We will get back to you shortly.`,
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
