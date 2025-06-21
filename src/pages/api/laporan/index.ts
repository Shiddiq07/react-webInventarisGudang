// pages/api/admin/laporan.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId } from 'mongodb'; // Import ObjectId jika Anda butuh
import clientPromise from "../../../lib/mongodb"; // Sesuaikan path jika berbeda

// --- Definisikan fungsi helper untuk menjumlahkan array objek (copy-paste atau import) ---
/**
 * Menjumlahkan nilai dari properti numerik tertentu di dalam array objek.
 * @param {Array<Object>} arr - Array objek yang akan dijumlahkan.
 * @param {string} fieldName - Nama properti (field) yang nilainya ingin dijumlahkan.
 * @returns {number} Total penjumlahan nilai properti. Mengembalikan 0 jika input tidak valid.
 */
function jumlahkanValueDalamArray(arr: any[], fieldName: string): number {
  if (!Array.isArray(arr) || typeof fieldName !== 'string') {
    console.error("Input tidak valid untuk jumlahkanValueDalamArray.");
    return 0;
  }
  const total = arr.reduce((akumulator, item) => {
    if (item && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, fieldName)) {
      const value = item[fieldName];
      const numericValue = Number(value || 0); // Gunakan || 0 untuk handle null/undefined/kosong string
      if (!isNaN(numericValue)) {
        return akumulator + numericValue;
      }
      // console.warn(`Nilai properti '${fieldName}' bukan angka pada item`, item); // Opsional: log warning
    }
    // console.warn(`Item bukan objek valid atau tidak punya field '${fieldName}':`, item); // Opsional: log warning
    return akumulator;
  }, 0);
  return total;
}

// --- Definisikan tipe data untuk respons ---
// Ini akan membantu frontend Anda mengetahui struktur data yang diharapkan
type LaporanItem = { // Sesuaikan properti ini dengan struktur dokumen inventaris Anda
    _id: ObjectId;
    date: string; // Format "YYYY-MM-DDTHH:mm:ss.sssZ"
    namaKategori: string; // "in" atau "out"
    jumlah: number; // Atau string, sesuaikan dan pastikan Number() berfungsi
    kodeBarang: string; // Kode barang untuk lookup
    // ... properti lain dari dokumen inventaris ...
};

type BarangItem = { // Sesuaikan properti ini dengan struktur dokumen barang Anda
    _id: ObjectId;
    kodeBarang: string;
    namaBarang: string;
    satuan: string;
    // ... properti lain dari dokumen barang ...
};

type LaporanApiResponse = {
  inventarisMasuk: LaporanItem[];
  inventarisKeluar: LaporanItem[];
  barangList?: BarangItem[]; // Barang bisa opsional tergantung kebutuhan frontend
  totalMasuk: number;
  totalKeluar: number;
  message?: string;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LaporanApiResponse | { message: string }> // Response bisa sukses atau error message
) {
  // Pastikan hanya method GET yang diperbolehkan
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Ambil parameter tahun dan bulan dari query string URL
  const tahunStr = req.query.tahun as string;
  const bulanStr = req.query.bulan as string; // Nilai bisa "all" atau angka "01"-"12"

  // --- Validasi Parameter Tahun ---
  if (!tahunStr) {
    return res.status(400).json({ message: 'Parameter tahun diperlukan' });
  }
  const tahunNum = parseInt(tahunStr, 10);
  if (isNaN(tahunNum)) {
    return res.status(400).json({ message: 'Format parameter tahun tidak valid' });
  }

  // --- Buat Tahap $match untuk Filter Tanggal (menggunakan Agregasi) ---
  // Ini mengakomodasi format string tanggal "YYYY-MM-DDTHH:mm:ss.sssZ"
  let dateMatchStage: any; // Ini akan menjadi bagian dari filter agregasi

  if (!bulanStr || bulanStr.toLowerCase() === 'all') {
    console.log(`Filtering data for ALL months in year: ${tahunStr}`);

    // Filter untuk SELURUH tahun menggunakan operator agregasi pada field "date"
    dateMatchStage = {
      $expr: { // $expr memungkinkan penggunaan operator agregasi di dalam $match
        $eq: [
          { $year: { $dateFromString: { dateString: "$date" } } }, // Ekstrak tahun dari field "date" string
          tahunNum // Bandingkan dengan tahun dari URL
        ]
      }
    };

  } else {
    // Jika bulan memiliki nilai spesifik (angka 1-12)
    const bulanNum = parseInt(bulanStr, 10);

    // Validasi parameter bulan jika BUKAN "all"
    if (isNaN(bulanNum) || bulanNum < 1 || bulanNum > 12) {
      return res.status(400).json({ message: 'Format parameter bulan tidak valid (harus angka 1-12 atau "all")' });
    }
    console.log(`Filtering data for specific month/year: ${bulanStr}-${tahunStr}`);

    // Filter untuk BULAN dan TAHUN spesifik menggunakan operator agregasi pada field "date"
    dateMatchStage = {
       $expr: {
         $and: [
           {
             $eq: [
               { $month: { $dateFromString: { dateString: "$date" } } }, // Ekstrak bulan (1-12)
               bulanNum // Bandingkan dengan bulan dari URL
             ]
           },
           {
             $eq: [
               { $year: { $dateFromString: { dateString: "$date" } } }, // Ekstrak tahun
               tahunNum // Bandingkan dengan tahun dari URL
             ]
           }
         ]
       }
     };

    // Deskripsi periode untuk log (tidak digunakan dalam filter MongoDB)
    // const namaBulan = new Date(tahunNum, bulanNum - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
    // const filterPeriodDescription = `Periode ${namaBulan} ${tahunStr}`;
  }

  // Dapatkan info user dari header jika diperlukan (sesuai kode awal )
  // const userName = req.headers['x-user-name'] as string | undefined;
  // const userId = req.headers['x-user-id'] as string | undefined;


  let client: MongoClient;
  try {
    client = await clientPromise;
    const db = client.db("talp3i"); 
    const inventarisCollection = db.collection("inventaris"); 
    const barangCollection = db.collection("barang"); 

    // --- Buat Filter Gabungan untuk Masing-masing Kategori ---
    // Menggabungkan filter tanggal (dateMatchStage) dengan filter namaKategori
    const filterInventarisMasuk = { $and: [dateMatchStage, { namaKategori: "in" }] };
    const filterInventarisKeluar = { $and: [dateMatchStage, { namaKategori: "out" }] };

    // --- Eksekusi Query Inventaris (Agregasi dengan $match) ---
    // Karena dateMatchStage mengandung $expr, kita harus menggunakan aggregate dengan $match
    const dataInventarisMasuk = await inventarisCollection.aggregate([{ $match: filterInventarisMasuk }]).toArray();
    const dataInventarisKeluar = await inventarisCollection.aggregate([{ $match: filterInventarisKeluar }]).toArray();

    console.log(`Query executed. Found ${dataInventarisMasuk.length} incoming and ${dataInventarisKeluar.length} outgoing items.`);

    // --- Eksekusi Query Data Barang ---
    // Ambil semua data barang (atau filter jika perlu)
    const dataBarangList = await barangCollection.find({}).toArray() as BarangItem[]; // Ambil semua barang


    // --- Hitung Total untuk Masing-masing Kategori ---
    // Gunakan fungsi jumlahkanValueDalamArray
    // ASUMSIKAN nama field kuantitas di dokumen inventaris adalah 'jumlah' (ganti jika beda)
    const totalBarangMasuk = jumlahkanValueDalamArray(dataInventarisMasuk, 'jumlah'); // <<< GANTI 'jumlah' jika nama field kuantitas beda
    const totalBarangKeluar = jumlahkanValueDalamArray(dataInventarisKeluar, 'jumlah'); // <<< GANTI 'jumlah' jika nama field kuantitas beda

    console.log("Total Barang Masuk:", totalBarangMasuk);
    console.log("Total Barang Keluar:", totalBarangKeluar);


    // --- Kirim Respon ke Frontend ---
    // Menggunakan nama key yang deskriptif: inventarisMasuk, inventarisKeluar, barangList, totalMasuk, totalKeluar
    return res.status(200).json({
      inventarisMasuk: dataInventarisMasuk, // Array data inventaris 'in'
      inventarisKeluar: dataInventarisKeluar, // Array data inventaris 'out'
      barangList: dataBarangList, // Data barang
      totalMasuk: totalBarangMasuk, // Total barang masuk
      totalKeluar: totalBarangKeluar // Total barang keluar
    });

  } catch (error) {
    console.error('Error fetching laporan data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}