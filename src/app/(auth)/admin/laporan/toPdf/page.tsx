"use client"; // Untuk Next.js App Router

import React, { useEffect, useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import fungsi autoTable sebagai default export
import { useSearchParams } from 'next/navigation'; // Hook useSearchParams dari Next.js

// Interface (opsional tapi bagus untuk TypeScript)
interface LaporanItem {
    _id: string;
    date: string;
    namaKategori: string; // "in" atau "out" (dari transaksi)
    jumlah: number | string;
    kodeBarang: string;
    // ... properti lain ...
}

interface BarangItem {
    _id: string;
    kodeBarang: string;
    namaBarang: string;
    satuan: string;
    namaKategori: string; // Kategori dari data barang master (misal: "ATK", "RTK")
    // ... properti lain ...
}

interface ProcessedItem {
    no: number;
    kodeBarang: string;
    namaBarang: string;
    satuan: string;
    kategoriBarang: string; // Kategori dari data barang master
    stokMasuk: number;
    stokKeluar: number;
    jumlahStok: number; // Netto (masuk - keluar)
}

// Interface baru untuk data yang dikelompokkan per kategori
interface CategoryGroupedData {
    items: ProcessedItem[];
    totalMasuk: number;
    totalKeluar: number;
    totalJumlah: number; // Netto untuk kategori ini
}

// Type untuk state data yang sudah dikelompokkan
type GroupedTableData = {
    [key: string]: CategoryGroupedData; // Key adalah nama kategori (contoh: "ATK", "RTK")
};


export default function StockOpnameTable () {
  const searchParams = useSearchParams();
  const bulan = searchParams?.get('bulan');
  const tahun = searchParams?.get('tahun');

  const [inventarisMasukData, setInventarisMasukData] = useState<LaporanItem[]>([]);
  const [inventarisKeluarData, setInventarisKeluarData] = useState<LaporanItem[]>([]);
  const [barangListData, setBarangListData] = useState<BarangItem[]>([]);

  const [grandTotalMasuk, setGrandTotalMasuk] = useState(0);
  const [grandTotalKeluar, setGrandTotalKeluar] = useState(0);

  // State baru untuk menampung data yang sudah diolah dan DIKELOMPOKKAN
  const [groupedProcessedTableData, setGroupedProcessedTableData] = useState<GroupedTableData>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


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

        const apiUrl = `/api/laporan?tahun=${tahun}${bulan ? `&bulan=${bulan}` : ''}`;
        console.log("Melakukan fetch ke:", apiUrl);

        const res = await fetch(apiUrl);
        if (!res.ok) {
           const errorDetail = await res.text();
           throw new Error(`HTTP error! status: ${res.status} - ${errorDetail || res.statusText}`);
        }

        const result = await res.json();

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
  }, [bulan, tahun]);

  // --- Effect untuk mengolah dan mengelompokkan data ---
  useEffect(() => {
      const itemTotals = new Map<string, { masuk: number; keluar: number; }>();

      inventarisMasukData.forEach(item => {
          if (item.kodeBarang) {
              const currentTotals = itemTotals.get(item.kodeBarang) || { masuk: 0, keluar: 0 };
              currentTotals.masuk += Number(item.jumlah || 0);
              itemTotals.set(item.kodeBarang, currentTotals);
          }
      });

      inventarisKeluarData.forEach(item => {
           if (item.kodeBarang) {
              const currentTotals = itemTotals.get(item.kodeBarang) || { masuk: 0, keluar: 0 };
              currentTotals.keluar += Number(item.jumlah || 0);
              itemTotals.set(item.kodeBarang, currentTotals);
           }
      });

      // Inisialisasi objek untuk menampung data yang dikelompokkan
      const newGroupedData: GroupedTableData = {};

      // Iterasi melalui SEMUA item di dataBarangList untuk membuat item laporan
      barangListData.forEach(barangItem => {
          if(barangItem.kodeBarang) {
              const category = barangItem.namaKategori || 'Lain-lain'; // Default jika kategori kosong
              
              // Inisialisasi kategori jika belum ada di newGroupedData
              if (!newGroupedData[category]) {
                  newGroupedData[category] = { items: [], totalMasuk: 0, totalKeluar: 0, totalJumlah: 0 };
              }

              const totals = itemTotals.get(barangItem.kodeBarang) || { masuk: 0, keluar: 0 };
              const stokMasuk = totals.masuk;
              const stokKeluar = totals.keluar;
              const jumlahStok = stokMasuk - stokKeluar;

              const processedItem: ProcessedItem = {
                  no: 0, // Nomor akan diatur ulang setelah pengelompokan
                  kodeBarang: barangItem.kodeBarang,
                  namaBarang: barangItem.namaBarang,
                  satuan: barangItem.satuan,
                  kategoriBarang: category,
                  stokMasuk: stokMasuk,
                  stokKeluar: stokKeluar,
                  jumlahStok: jumlahStok,
              };

              newGroupedData[category].items.push(processedItem);
              newGroupedData[category].totalMasuk += stokMasuk;
              newGroupedData[category].totalKeluar += stokKeluar;
              newGroupedData[category].totalJumlah += jumlahStok;
          } else {
             console.warn("Item di barangListData tanpa kodeBarang:", barangItem);
          }
      });

      // Finalisasi: Urutkan dan beri nomor urut di setiap kategori
      // Urutan kategori yang diinginkan
      const categoryOrder = ['ATK', 'RTK'];
      const finalGroupedData: GroupedTableData = {};

      // Proses kategori sesuai urutan yang diinginkan
      categoryOrder.forEach(catName => {
          if (newGroupedData[catName]) {
              newGroupedData[catName].items.sort((a, b) => a.kodeBarang.localeCompare(b.kodeBarang));
              newGroupedData[catName].items.forEach((item, index) => item.no = index + 1);
              finalGroupedData[catName] = newGroupedData[catName];
          }
      });

      // Tambahkan kategori lain jika ada (yang tidak di ATK/RTK)
      Object.keys(newGroupedData).forEach(catName => {
          if (!categoryOrder.includes(catName)) {
              newGroupedData[catName].items.sort((a, b) => a.kodeBarang.localeCompare(b.kodeBarang));
              newGroupedData[catName].items.forEach((item, index) => item.no = index + 1);
              finalGroupedData[catName] = newGroupedData[catName];
          }
      });

      console.log("Data olahan dan dikelompokkan:", finalGroupedData);
      setGroupedProcessedTableData(finalGroupedData);

  }, [inventarisMasukData, inventarisKeluarData, barangListData]);


  // Fungsi untuk membuat dan mengunduh PDF
  const handleDownloadPDF = () => {
    // Pastikan ada data untuk dibuat PDF di kategori manapun
    const hasData = Object.values(groupedProcessedTableData).some(group => group.items.length > 0);
    if (!hasData) {
        alert("Tidak ada data laporan yang diolah untuk dibuat PDF.");
        return;
    }

    const doc = new jsPDF();
    let currentY = 15; // Posisi Y awal untuk header

    // --- Header Laporan Utama PDF ---
    doc.setFontSize(16); doc.text('STOCK OPNAME ATK & RTK', 105, currentY, { align: 'center' }); currentY += 6;
    doc.setFontSize(12); doc.text('KANTOR YAYASAN', 105, currentY, { align: 'center' }); currentY += 6;
    doc.setFontSize(10);
    const tanggalLaporan = `:${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.text('Tanggal', 150, currentY); doc.text(tanggalLaporan, 170, currentY); currentY += 5;

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
    doc.text('Periode', 150, currentY); doc.text(periodeText, 170, currentY); currentY += 15; // Tambah spasi setelah header utama


    // Header Tabel untuk jsPDF-AutoTable
    const head = [
      ['No', 'Kode Barang', 'Nama Barang', 'Satuan', 'Kategori', 'Stok Masuk', 'Stok Keluar', 'Jumlah Stok'],
    ];

    const tableOptions = {
        startY: currentY, // Akan diupdate untuk setiap tabel
        headStyles: { fillColor: [171, 130, 204], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: {
            0: { halign: 'center' }, // No
            5: { halign: 'center' }, // Stok Masuk
            6: { halign: 'center' }, // Stok Keluar
            7: { halign: 'center' }, // Jumlah Stok
        },
        margin: { left: 10, right: 10 },
        // Jangan gunakan didDrawPage di sini karena akan di-trigger setiap tabel.
        // Grand total keseluruhan akan ditambahkan secara manual di akhir
    };

    const categoriesInOrder = ['ATK', 'RTK']; // Urutan kategori yang diinginkan
    const otherCategories = Object.keys(groupedProcessedTableData).filter(cat => !categoriesInOrder.includes(cat)).sort();
    const allCategoriesToProcess = [...categoriesInOrder, ...otherCategories];


    for (const categoryName of allCategoriesToProcess) {
        const categoryData = groupedProcessedTableData[categoryName];
        if (categoryData && categoryData.items.length > 0) {
            // Tambahkan judul kategori
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Kategori: ${categoryName}`, tableOptions.margin.left, currentY + 5); // Beri sedikit spasi
            currentY += 10; // Geser Y untuk tabel

            // Siapkan body tabel untuk kategori ini
           const body = categoryData.items.map(item => [
    { content: item.no },
    { content: item.kodeBarang },
    { content: item.namaBarang },
    { content: item.satuan },
    { content: item.kategoriBarang },
    { content: item.stokMasuk.toLocaleString('id-ID') },
    { content: item.stokKeluar.toLocaleString('id-ID') },
    { content: item.jumlahStok.toLocaleString('id-ID') }
]);

// Tambahkan baris sub-total untuk kategori ini
const subTotalRow = [
    { content: `Sub Total ${categoryName}`, colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220] } },
    { content: categoryData.totalMasuk.toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] } },
    { content: categoryData.totalKeluar.toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] } },
    { content: categoryData.totalJumlah.toLocaleString('id-ID'), styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] } },
];

body.push(subTotalRow);// Tambahkan sub total ke body tabel ini

            // Membuat Tabel dengan data yang sudah diolah untuk kategori ini
            autoTable(doc, {
                head,
                body,
                startY: currentY,
                headStyles: tableOptions.headStyles,
                columnStyles: tableOptions.columnStyles,
                margin: tableOptions.margin,
                // Pastikan startY selalu diatur untuk tabel berikutnya
                didParseCell: function(data) {
                    if (data.row.index === body.length - 1 && data.section === 'body') {
                         data.cell.styles.fontStyle = 'bold';
                         data.cell.styles.fillColor = [220, 220, 220]; // Warna abu-abu muda
                    }
                }
            });

            currentY = (doc as any).lastAutoTable.finalY + 10; // Update currentY untuk tabel berikutnya
            if (currentY > doc.internal.pageSize.height - 30) { // Jika mendekati akhir halaman, tambahkan halaman baru
                doc.addPage();
                currentY = 20; // Set Y awal di halaman baru
            }
        }
    }

    // --- Tambahkan Grand Total Keseluruhan ke PDF di halaman terakhir ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Pastikan posisi Grand Total tidak menabrak tabel terakhir
    if (currentY + 20 > doc.internal.pageSize.height - 30) {
        doc.addPage();
        currentY = 20;
    }

    // Hitung posisi X untuk Grand Total Keseluruhan
    const totalWidth = doc.internal.pageSize.width - tableOptions.margin.left - tableOptions.margin.right;
    const colWidth = totalWidth / 8; // Assuming 8 columns for simplicity in positioning

    // Posisi X untuk setiap kolom total (disesuaikan agar rata tengah di kolom masing-masing)
    const grandTotalLabelX = tableOptions.margin.left + colWidth * 4; // Akhir kolom Kategori
    const grandTotalMasukX = tableOptions.margin.left + colWidth * 5 + colWidth / 2;
    const grandTotalKeluarX = tableOptions.margin.left + colWidth * 6 + colWidth / 2;
    const grandTotalNettoX = tableOptions.margin.left + colWidth * 7 + colWidth / 2;


    doc.text(`GRAND TOTAL:`, grandTotalLabelX, currentY + 10, { align: 'right'});
    doc.text(`${grandTotalMasuk.toLocaleString('id-ID')}`, grandTotalMasukX, currentY + 10, { align: 'center'});
    doc.text(`${grandTotalKeluar.toLocaleString('id-ID')}`, grandTotalKeluarX, currentY + 10, { align: 'center'});
    doc.text(`${(grandTotalMasuk - grandTotalKeluar).toLocaleString('id-ID')}`, grandTotalNettoX, currentY + 10, { align: 'center'});


    // Menyimpan atau membuka PDF
    const fileNamePeriode = bulan && typeof bulan === 'string' && bulan.toLowerCase() === 'all' ? `Tahun_${tahun}` : `${tahun}-${bulan}`;
    doc.save(`laporan_stock_opname_${fileNamePeriode}.pdf`);
  };

  // --- Render tampilan HTML ---
  return (
    <div>
      <h2>Laporan Stock Opname ATK & RTK</h2>

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

        {/* --- Tampilkan Grand Total Masuk dan Keluar Keseluruhan --- */}
        {!loading && !error && Object.values(groupedProcessedTableData).some(group => group.items.length > 0) && (
            <div>
                <p>Grand Total Barang Masuk Periode: <strong>{grandTotalMasuk.toLocaleString('id-ID')}</strong></p>
                <p>Grand Total Barang Keluar Periode: <strong>{grandTotalKeluar.toLocaleString('id-ID')}</strong></p>
                <p>Grand Total Netto Periode: <strong>{(grandTotalMasuk - grandTotalKeluar).toLocaleString('id-ID')}</strong></p>
            </div>
        )}

      <button onClick={handleDownloadPDF} disabled={loading || !Object.values(groupedProcessedTableData).some(group => group.items.length > 0)}>
        {loading ? 'Memuat Data...' : (Object.values(groupedProcessedTableData).some(group => group.items.length > 0) ? 'Download PDF' : 'Tidak ada Data untuk PDF')}
      </button>

      {loading && <p>Memuat data laporan...</p>}
      {error && <p>Error memuat data: {error.message}</p>}
      {!loading && !error && !Object.values(groupedProcessedTableData).some(group => group.items.length > 0) && tahun && <p>Tidak ada data ditemukan untuk periode ini.</p>}


      {/* --- Tampilkan Data dalam Tabel HTML Per Kategori --- */}
       {!loading && !error && Object.keys(groupedProcessedTableData).length > 0 && (
         <>
           {/* Loop melalui kategori yang sudah diurutkan */}
           {['ATK', 'RTK'].concat(Object.keys(groupedProcessedTableData).filter(cat => !['ATK', 'RTK'].includes(cat)).sort())
            .map(categoryName => {
                const categoryData = groupedProcessedTableData[categoryName];
                // Hanya render tabel jika ada data untuk kategori ini
                if (categoryData && categoryData.items.length > 0) {
                    return (
                        <div key={categoryName} style={{ marginBottom: '40px' }}>
                            <h3 style={{ marginTop: '30px', marginBottom: '10px' }}>Kategori: {categoryName}</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{backgroundColor:'#ab82d4',color:'black'}}>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>No</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Kode Barang</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Nama Barang</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Satuan</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Kategori</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Stok Masuk</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Stok Keluar</th>
                                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>Jumlah Stok</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryData.items.map(item => (
                                        <tr key={item.kodeBarang}>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.no}</td>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>{item.kodeBarang}</td>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>{item.namaBarang}</td>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>{item.satuan}</td>
                                            <td style={{ border: '1px solid black', padding: '8px' }}>{item.kategoriBarang}</td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.stokMasuk.toLocaleString('id-ID')}</td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.stokKeluar.toLocaleString('id-ID')}</td>
                                            <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{item.jumlahStok.toLocaleString('id-ID')}</td>
                                        </tr>
                                    ))}
                                    {/* Baris Sub Total HTML */}
                                    <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                                        <td colSpan={5} style={{ border: '1px solid black', padding: '8px', textAlign: 'right' }}>SUB TOTAL {categoryName}:</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{categoryData.totalMasuk.toLocaleString('id-ID')}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{categoryData.totalKeluar.toLocaleString('id-ID')}</td>
                                        <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>{categoryData.totalJumlah.toLocaleString('id-ID')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                }
                return null;
            })}
         </>
       )}
    </div>
  );
};