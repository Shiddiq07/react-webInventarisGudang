"use client"; // Untuk Next.js App Router

import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import fungsi autoTable sebagai default export
import { useSearchParams } from 'next/navigation'; // Hook useSearchParams dari Next.js

// Interface (opsional tapi bagus untuk TypeScript)
interface LaporanItem {//item data laporan inventaris yang diharapkan akan diterima dari API backend.
    _id: string; // Jika _id sebagai ObjectId string
    date: string; // Format "YYYY-MM-DDTHH:mm:ss.sssZ"
    namaKategori: string; // "in" atau "out"
    jumlah: number | string; // Terima string atau number dari API
    kodeBarang: string;
    // ... properti lain ...
}

interface BarangItem { //item data barang yang diharapkan akan diterima dari API backend
    _id: string;
    kodeBarang: string;
    namaBarang: string;
    satuan: string;
    namaKategori: string; // Tambahkan jika kategori barang ada di data barang
    // ... properti lain ...
}

interface ProcessedItem {//baris data yang sudah diolah dan siap ditampilkan dalam tabel laporan stok opname. 
    no: number;
    kodeBarang: string;
    namaBarang: string;
    satuan: string;
    kategoriBarang: string; // Kategori dari data barang
    stokMasuk: number; // Total masuk untuk item ini di periode ini
    stokKeluar: number; // Total keluar untuk item ini di periode ini
    jumlahStok: number; // Total masuk - Total keluar (netto)
}


// --- Fungsi helper untuk menjumlahkan array objek (gunakan yang dari backend atau definisikan lagi) ---
// function jumlahkanValueDalamArray(arr: any[], fieldName: string): number {
//   if (!Array.isArray(arr) || typeof fieldName !== 'string') { return 0; }
//   const total = arr.reduce((akumulator, item) => {
//     if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, fieldName)) {
//       const value = item[fieldName];
//       const numericValue = Number(value || 0);
//       if (!isNaN(numericValue)) {
//         return akumulator + numericValue;
//       }
//     }
//     return akumulator;
//   }, 0);
//   return total;
// }


export default function StockOpnameTable () {
  const searchParams = useSearchParams();
  const bulan = searchParams.get('bulan');
  const tahun = searchParams.get('tahun');

  // State untuk data mentah dari API
  const [inventarisMasukData, setInventarisMasukData] = useState<LaporanItem[]>([]); // Data 'in' dari API
  const [inventarisKeluarData, setInventarisKeluarData] = useState<LaporanItem[]>([]); // Data 'out' dari API
  const [barangListData, setBarangListData] = useState<BarangItem[]>([]); // Data barang dari API

  // State untuk total GRAND Masuk dan Keluar (dari API)
  const [grandTotalMasuk, setGrandTotalMasuk] = useState(0);
  const [grandTotalKeluar, setGrandTotalKeluar] = useState(0);

  // --- State baru untuk data yang sudah diolah untuk tabel ---
  const [processedTableData, setProcessedTableData] = useState<ProcessedItem[]>([]);

  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  // Effect hook untuk fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      if (!tahun) {
        console.log("Parameter tahun tidak ada di URL, tidak melakukan fetch.");
        setLoading(false);
        setInventarisMasukData([]);
        setInventarisKeluarData([]);
        setBarangListData([]);
        setGrandTotalMasuk(0);
        setGrandTotalKeluar(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Pastikan URL API sesuai dengan backend
        const apiUrl = `/api/laporan?tahun=${tahun}${bulan ? `&bulan=${bulan}` : ''}`;
        console.log("Melakukan fetch ke:", apiUrl);

        const res = await fetch(apiUrl);
        if (!res.ok) {
           const errorDetail = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errorDetail || res.statusText}`);
        }

        const result = await res.json(); // result adalah objek { inventarisMasuk: [...], inventarisKeluar: [...], barangList: [...], totalMasuk: ..., totalKeluar: ... }

        if (result) {
           setInventarisMasukData(result.inventarisMasuk || []);
           setInventarisKeluarData(result.inventarisKeluar || []);
           setBarangListData(result.barangList || []);

           setGrandTotalMasuk(result.totalMasuk || 0);
           setGrandTotalKeluar(result.totalKeluar || 0);

           console.log("Data API diterima:", result);

        } else {
          console.warn("API response is empty or invalid.");
          setInventarisMasukData([]);
          setInventarisKeluarData([]);
          setBarangListData([]);
          setGrandTotalMasuk(0);
          setGrandTotalKeluar(0);
        }

      } catch (err) {
        console.error("Gagal fetching data:", err);
        setError(err as Error);
        setInventarisMasukData([]);
        setInventarisKeluarData([]);
        setBarangListData([]);
        setGrandTotalMasuk(0);
        setGrandTotalKeluar(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bulan, tahun]); // Dependencies

  // --- Effect baru untuk mengolah data mentah menjadi format tabel (Memproses SEMUA data barang) ---
  // Berjalan setiap kali data inventaris masuk/keluar atau data barang berubah
  useEffect(() => {
      // Buat Map untuk mengakumulasi total masuk/keluar per kodeBarang dari inventaris
      const itemTotals = new Map<string, { masuk: number; keluar: number; }>();

      // Akumulasi total masuk dari data inventaris masuk
      inventarisMasukData.forEach(item => {
          if (item.kodeBarang) {
              const currentTotals = itemTotals.get(item.kodeBarang) || { masuk: 0, keluar: 0 };
              currentTotals.masuk += Number(item.jumlah || 0); // Jumlahkan field kuantitas
              itemTotals.set(item.kodeBarang, currentTotals);
          }
      });

      // Akumulasi total keluar dari data inventaris keluar
      inventarisKeluarData.forEach(item => {
           if (item.kodeBarang) {
              const currentTotals = itemTotals.get(item.kodeBarang) || { masuk: 0, keluar: 0 };
              currentTotals.keluar += Number(item.jumlah || 0); // Jumlahkan field kuantitas 
              itemTotals.set(item.kodeBarang, currentTotals);
          }
      });

      // Buat array data untuk tabel DENGAN MENGULANG SEMUA DATA BARANG
      const processedData: ProcessedItem[] = [];
      let itemNo = 1;

      // --- Iterasi melalui SEMUA item di dataBarangList ---
      barangListData.forEach(barangItem => {
          if(barangItem.kodeBarang) {
               // Ambil total pergerakan untuk item barang ini (jika ada)
              const totals = itemTotals.get(barangItem.kodeBarang) || { masuk: 0, keluar: 0 }; // Akan default ke {0, 0} jika tidak ada pergerakan

              const stokMasuk = totals.masuk;
              const stokKeluar = totals.keluar;
              // Jumlah Stok kita definisikan sebagai Total Masuk - Total Keluar untuk periode ini
              const jumlahStok = stokMasuk - stokKeluar; // Atau logika lain jika Stok Awal diketahui

              processedData.push({
                  no: itemNo++,
                  kodeBarang: barangItem.kodeBarang,
                  namaBarang: barangItem.namaBarang,
                  satuan: barangItem.satuan,
                  kategoriBarang: barangItem.namaKategori, // Asumsi namaKategori ada di barangItem, GANTI jika di inventaris atau hardcoded
                  stokMasuk: stokMasuk,
                  stokKeluar: stokKeluar,
                  jumlahStok: jumlahStok,
              });
          } else {
             // Handle kasus jika ada item di dataBarangList tanpa kodeBarang
             console.warn("Item di barangListData tanpa kodeBarang:", barangItem);
          }
      });

      // Opsional: Urutkan processedData jika perlu (misal, berdasarkan kodeBarang)
      // processedData.sort((a, b) => a.kodeBarang.localeCompare(b.kodeBarang));

      console.log("Data olahan untuk tabel:", processedData);

      setProcessedTableData(processedData); // Simpan data yang sudah diolah ke state

  }, [inventarisMasukData, inventarisKeluarData, barangListData]); // Effect ini bergantung pada data mentah dari API


  // Fungsi untuk membuat dan mengunduh PDF
  const handleDownloadPDF = () => {
    // Gunakan processedTableData.length untuk cek data
    if (processedTableData.length === 0) {
        alert("Tidak ada data laporan yang diolah untuk dibuat PDF.");
        return;
    }

    const doc = new jsPDF();

    // ... (Bagian header PDF - sama seperti sebelumnya) ...
    doc.setFontSize(16); doc.text('STOCK OPNAME ATK & RTK', 105, 15, { align: 'center' });
    doc.setFontSize(12); doc.text('KANTOR YAYASAN', 105, 21, { align: 'center' });
    doc.setFontSize(10);
    // doc.text('Nomor', 150, 15); doc.text(': FR-ATK-24', 170, 15);
    const tanggalLaporan = `:${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.text('Tanggal', 150, 20); doc.text(tanggalLaporan, 170, 20);

    let periodeText;
    if (bulan && typeof bulan === 'string' && bulan.toLowerCase() === 'all') {
        periodeText = `: Tahun ${tahun}`;
    } else if (bulan && tahun && !isNaN(parseInt(bulan, 10))) {
        const bulanNum = parseInt(bulan, 10);
        if (bulanNum >= 1 && bulanNum <= 12) {
             const namaBulan = new Date(parseInt(tahun || '0', 10), bulanNum - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
             periodeText = `: ${namaBulan} ${tahun}`;
        } else { periodeText = `: Parameter bulan tidak valid`; }
    } else { periodeText = `: Parameter periode tidak lengkap`; }
    doc.text('Periode', 150, 25); doc.text(periodeText, 170, 25);
    doc.text('Revisi', 150, 30); doc.text(': ', 170, 30);


    // --- Header Tabel untuk jsPDF-AutoTable (SESUAIKAN DENGAN FORMAT BARU) ---
    const head = [
      ['No', 'Kode Barang', 'Nama Barang', 'Satuan', 'Kategori', 'Stok Masuk', 'Stok Keluar', 'Jumlah Stok'],
    ];

    // --- Data Tabel untuk jsPDF-AutoTable (Gunakan data yang sudah diolah) ---
    const body = processedTableData.map(item => [
        item.no,
        item.kodeBarang,
        item.namaBarang,
        item.satuan,
        item.kategoriBarang,
        item.stokMasuk.toLocaleString('id-ID'),
        item.stokKeluar.toLocaleString('id-ID'),
        item.jumlahStok.toLocaleString('id-ID'),
    ]);

    // --- Tambahkan Grand Total ke PDF ---
    // Ini adalah total keseluruhan, bukan total per item
    const grandTotalRow = [
      { content: 'GRAND TOTAL', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right' } }, // Kolom 1-5 digabung
      { content: grandTotalMasuk.toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center' } }, // Grand Total Masuk
      { content: grandTotalKeluar.toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center' } }, // Grand Total Keluar
      { content: (grandTotalMasuk - grandTotalKeluar).toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center' } } // Grand Total Netto
    ];
    // Anda bisa tambahkan grandTotalRow ini di foot atau setelah tabel


    const options = {
      startY: 45,
      headStyles: { fillColor: [171, 130, 204], textColor: [0, 0, 0], fontStyle: 'bold' },
      // Sesuaikan columnStyles dengan jumlah dan posisi kolom baru (8 kolom)
      columnStyles: {
          0: { halign: 'center' }, // No
        
          5: { halign: 'center' }, // Stok Masuk
          6: { halign: 'center' }, // Stok Keluar
          7: { halign: 'center' }, // Jumlah Stok
       },
      margin: { left: 10, right: 10 },
      // Tambahkan footer untuk grand total di setiap halaman (opsional)
      // foot: [grandTotalRow],
      // Callback untuk menambahkan grand total di akhir dokumen, bukan di setiap halaman footer
      didDrawPage: function(data: any) { // Gunakan data.pageCount untuk tahu halaman terakhir
          if (data.pageNumber === data.pageCount) {
               // Tambahkan grand total di halaman terakhir setelah tabel
               const finalY = data.cursor.y; // Posisi Y setelah tabel di halaman ini

               doc.setFontSize(10);
               doc.setFont('helvetica', 'bold');

               // Hitung posisi X berdasarkan margin dan lebar kolom (ulangi logika dari atas jika perlu)
               const colStokMasukX = options.margin.left + (doc.internal.pageSize.width - options.margin.left - options.margin.right) * (5/8);
               const colStokKeluarX = options.margin.left + (doc.internal.pageSize.width - options.margin.left - options.margin.right) * (6/8);
               const colJumlahStokX = options.margin.left + (doc.internal.pageSize.width - options.margin.left - options.margin.right) * (7/8);

                doc.text(`GRAND TOTAL:`, options.margin.left + (doc.internal.pageSize.width - options.margin.left - options.margin.right) * (4/8), finalY + 10, { align: 'right', fontStyle: 'bold'});
                doc.text(`${grandTotalMasuk.toLocaleString('id-ID')}`, colStokMasukX + (doc.internal.pageSize.width - options.margin.left - options.margin.right)/8/2, finalY + 10, { align: 'center', fontStyle: 'bold'});
                doc.text(`${grandTotalKeluar.toLocaleString('id-ID')}`, colStokKeluarX + (doc.internal.pageSize.width - options.margin.left - options.margin.right)/8/2, finalY + 10, { align: 'center', fontStyle: 'bold'});
                doc.text(`${(grandTotalMasuk - grandTotalKeluar).toLocaleString('id-ID')}`, colJumlahStokX + (doc.internal.pageSize.width - options.margin.left - options.margin.right)/8/2, finalY + 10, { align: 'center', fontStyle: 'bold'});
          }
      }
    };

    // Membuat Tabel dengan data yang sudah diolah
    autoTable(doc,{head, body, ...options});

    // --- Cara lama menambahkan total manual (sudah dipindahkan ke didDrawPage callback) ---
    // const finalY = (doc as any).lastAutoTable.finalY;
    // ... doc.text total manual ...


    // Menyimpan atau membuka PDF
    const fileNamePeriode = bulan && typeof bulan === 'string' && bulan.toLowerCase() === 'all' ? `Tahun_${tahun}` : `${tahun}-${bulan}`;
    doc.save(`laporan_stock_opname_${fileNamePeriode}.pdf`);
  };

  // --- Render tampilan ---
  return (
    <div>
      <h2>Laporan Stock Opname ATK & RTK</h2>

       {/* Tampilkan informasi bulan/tahun yang sedang dilihat */}
       {tahun && (
           <p>Laporan untuk Periode:
           {' '}
           {bulan && typeof bulan === 'string' && bulan.toLowerCase() === 'all'
               ? `Tahun ${tahun}`
               : (bulan && !isNaN(parseInt(bulan, 10)) && parseInt(bulan, 10) >= 1 && parseInt(bulan, 10) <= 12
                   ? new Date(parseInt(tahun || '0', 10), parseInt(bulan, 10) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                   : (bulan ? `Bulan "${bulan}" tidak valid di tahun ${tahun}` : `Pilih Bulan (1-12 atau 'all') untuk tahun ${tahun}`)
                 )
           }
           </p>
       )}
       {!tahun && <p>Harap masukkan parameter tahun di URL (contoh: ?tahun=2025&bulan=05 atau ?tahun=2025&bulan=all)</p>}

        {/* --- Tampilkan Grand Total Masuk dan Keluar --- */}
        {!loading && !error && processedTableData.length > 0 && ( // Tampilkan total jika ada data di tabel
            <div>
                <p>Grand Total Barang Masuk Periode: <strong>{grandTotalMasuk.toLocaleString('id-ID')}</strong></p>
                <p>Grand Total Barang Keluar Periode: <strong>{grandTotalKeluar.toLocaleString('id-ID')}</strong></p>
                <p>Grand Total Netto Periode: <strong>{(grandTotalMasuk - grandTotalKeluar).toLocaleString('id-ID')}</strong></p> {/* Hitung Grand Total Netto */}
            </div>
        )}


      <button onClick={handleDownloadPDF} disabled={loading || processedTableData.length === 0}> {/* Cek processedTableData.length */}
        {loading ? 'Memuat Data...' : (processedTableData.length > 0 ? 'Download PDF' : 'Tidak ada Data untuk PDF')} {/* Cek processedTableData.length */}
      </button>

      {loading && <p>Memuat data laporan...</p>}
      {error && <p>Error memuat data: {error.message}</p>}
      {/* Pesan jika tidak ada data setelah fetch DAN parameter tahun ada */}
      {!loading && !error && processedTableData.length === 0 && tahun && <p>Tidak ada data ditemukan untuk periode ini.</p>} {/* Cek processedTableData.length */}


      {/* --- Tampilkan Data dalam Tabel HTML (Menggunakan data yang sudah diolah) --- */}
       {!loading && !error && processedTableData.length > 0 && ( // Cek processedTableData.length
         <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
           <thead>
             {/* Header SESUAIKAN DENGAN FORMAT BARU */}
            <tr style={{backgroundColor:'#ab82d4',color:'black'}}>
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>No</th>
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Kode Barang</th>
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Nama Barang</th>
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Satuan</th>
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Kategori</th> {/* Kategori Barang */}
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Stok Masuk</th> {/* Total masuk item ini */}
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Stok Keluar</th> {/* Total keluar item ini */}
               <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Jumlah Stok</th> {/* Netto item ini */}
             </tr>
           </thead>
           <tbody>
       {/* Mapping data dari state processedTableData */}
       {processedTableData.map(item => ( // Mapping processedTableData
         <tr key={item.kodeBarang}> {/* Gunakan kodeBarang sebagai key */}
           <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.no}</td>
           <td style={{ border: '1px solid black', padding: '8px' }}>{item.kodeBarang}</td>
           <td style={{ border: '1px solid black', padding: '8px' }}>{item.namaBarang}</td>
           <td style={{ border: '1px solid black', padding: '8px' }}>{item.satuan}</td>
           <td style={{ border: '1px solid black', padding: '8px' }}>{item.kategoriBarang}</td>
           <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.stokMasuk.toLocaleString('id-ID')}</td> {/* Tampilkan stokMasuk item */}
           <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.stokKeluar.toLocaleString('id-ID')}</td> {/* Tampilkan stokKeluar item */}
           <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.jumlahStok.toLocaleString('id-ID')}</td> {/* Tampilkan jumlahStok item */}
         </tr>
       ))}
     </tbody>
         </table>
       )}

    </div>
  );
};