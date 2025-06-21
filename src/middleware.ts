import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = [
    '/admin',
    "/admin/daftarBarang",
    "/admin/daftarBarang/edit/${id}",
    "/admin/laporan",
    "/admin/permintaan",
    "/admin/inventori",
    "/admin/pengguna/edit/${id}",   
    "/staff/status/${id}",   
    "/staff/${id}",   
    "/staff/daftarBarang/${id}",
    "/staff/daftarBarang/edit/${id}",   
    "/staff/status/${id}",   
    
];

// Daftar peran yang diizinkan untuk setiap rute yang dilindungi
const roleBasedAccess: Record<string, string[]> = {
    '/admin': ['ga'],
    "/admin/daftarBarang": ['ga'],
    "/admin/daftarBarang/edit": ['ga'],
    "/admin/daftarBarang/edit/${id}": ['ga'],
    "/admin/pengguna": ['ga'],
    "/admin/permintaan": ['ga'],
    "/admin/inventaris": ['ga'],
    "/admin/pengguna/edit": ['ga'],
    '/staff': ['staff'],
    '/staff/status': ['staff'],
    '/staff/': ['staff'],
    '/staff/daftarBarang': ['staff'],
    

};

export default async function middleware(req: NextRequest) {
    // 1. Ambil token dari cookie
    const token = req.cookies.get(process.env.AUTH_COOKIE_NAME)?.value;
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    let userRole: string | undefined;
    let userName: string | undefined;

    // 2. Periksa apakah token ada
    if (token) {
        const secretKey = process.env.SESSION_SECRET;
        const encodedKey = new TextEncoder().encode(secretKey);

        try {
            // 3. Verifikasi JWT
            const { payload } = await jwtVerify(token, encodedKey, {
                algorithms: ['HS256'],
            });

            // 4. Ekstrak informasi peran dan nama dari payload
            userRole = payload.role as string | undefined;
            userName = payload.nama as string | undefined;
            const userIdFromToken = payload.id as string | undefined; // Akses 'id' dari payload

            console.log("User Role from JWT:", userRole);
            console.log("User Name from JWT:", userName);
            console.log("User ID from Token:", userIdFromToken);

            // 5. Periksa izin akses berdasarkan peran untuk rute yang dilindungi
            if (isProtectedRoute) {
                const allowedRoles = roleBasedAccess[path];
                if (allowedRoles && !allowedRoles.includes(userRole!)) {
                    console.log(`User with role ${userRole} is not authorized to access ${path}`);
                    return NextResponse.redirect(new URL('/forbidden ', req.nextUrl));
                    // return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
                }
            }

            // Jika token valid dan (jika rute dilindungi) peran diizinkan, lanjutkan
            const requestHeaders = new Headers(req.headers);
            if (userRole) {
                requestHeaders.set('x-user-role', userRole);
            }
            if (userName) {
                requestHeaders.set('x-user-name', userName);
            }
            if (userIdFromToken) {
                requestHeaders.set('x-user-id', userIdFromToken);
        }
            
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

        } catch (error) {
            console.error("JWT Verification Failed:", error);
            // Token tidak valid, hapus cookie dan redirect ke login
            const res = NextResponse.redirect(new URL('/login', req.nextUrl));
            res.cookies.delete(process.env.AUTH_COOKIE_NAME!);
            return res;
        }
    }

    // 6. Jika rute dilindungi dan tidak ada token valid, redirect ke login
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // Jika bukan rute yang dilindungi, atau token ada dan valid, lanjutkan
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};