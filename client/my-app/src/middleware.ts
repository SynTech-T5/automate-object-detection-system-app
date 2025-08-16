import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('access_token')?.value;

    // กันลูปเมื่ออยู่หน้า /login หรือ /_next หรือ /api
    if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    if (!token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
};

export const config = {
    matcher: [
        '/cameras/:path*',
        '/alerts/:path*',
    ],
};