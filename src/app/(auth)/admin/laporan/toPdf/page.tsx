'use client';

import React, { Suspense } from 'react';
import Loading from './loading'; // Import loading component

// Karena ReportContent.tsx menggunakan useSearchParams, kita akan import itu
// sebagai Client Component yang dibungkus Suspense di sini.
import ReportContent from './ReportContent';

export default function Page() {
    return (
        <div>
            <h1>Halaman Laporan Stock Opname</h1>
            {/* Bungkus komponen yang melakukan fetch (ReportContent) dengan Suspense */}
            <Suspense fallback={<Loading />}>
                <ReportContent />
            </Suspense>
        </div>
    );
}