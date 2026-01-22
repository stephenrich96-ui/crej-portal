import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
