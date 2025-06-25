import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    const userName = req.headers['x-user-name'] as string | undefined;

    async function getNextKodeBarang(db, namaKategori) {
        const counterId = `kodeBarangCounter_${namaKategori.replace(/\s+/g, '')}`; // Membuat ID counter unik per kategori
        const result = await db.collection('counters').findOneAndUpdate(
            { _id: counterId },
            { $inc: { seq: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
    
    }

    switch (req.method) {
        
        case "POST":
            try {
                const body = JSON.parse(req.body);
                const validasi = await db.collection('barang').findOne({ namaBarang: body.namaBarang }); 

                 if (typeof body !== "object") {
                    throw new Error('invalid request');
                }

                if (body.namaKategori === "") {
                    throw new Error('kategori is required');
                }
                if (body.namaBarang === "") {
                    throw new Error('nama barang is required');
                }
                if (body.satuan === "") {
                    throw new Error('satuan is required');
                }


                    if (validasi) {
                        throw new Error('nama barang sudah ada'); // Jika ditemukan, artinya duplikat
                    }else {

                await getNextKodeBarang(db, body.namaKategori);
                const isiId = `kodeBarangCounter_${body.namaKategori.replace(/\s+/g, '')}`; // Membuat ID counter unik per kategori

                const kodeBarang = await db.collection("counters")
                    .find({_id:isiId }).toArray();
                   
                 let newId =kodeBarang[0].seq|| 0;
                 let gabungan=`${body.namaKategori.replace(/\s+/g, '').toUpperCase()}-${newId.toString().padStart(4, '0')}`;
                const barangData = {
                    namaKategori: body.namaKategori,
                    namaBarang: body.namaBarang,
                    satuan: body.satuan,
                    kodeBarang: gabungan,
                    stok: 0,
                    created_at: new Date(),
                    updated_at: "",
                    created_by: userName,
                };

                let barang = await db.collection("barang").insertOne(barangData);
                res.status(200).json({ data: barang, message: 'data berhasil di simpan' });

                    }
            
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;

        default:
            const barangData = await db.collection("barang").find({}).toArray();
            res.json({ data: barangData });
            break;
    }
}