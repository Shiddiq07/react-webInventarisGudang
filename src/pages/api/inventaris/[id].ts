import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';
import { hashPassword } from "../../../lib/session"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    const idParam: string = req?.query?.id as string || '';
    const id = new ObjectId(idParam);
    const userName = req.headers['x-user-name'] as string | undefined;

    switch (req.method) {
        case "PUT":
            try {
                const filter = { _id: id };
                const body = JSON.parse(req.body);
                
                const updateDoc: any = {
                    $set: {
                       kodeBarang:'',
    date:'',
    keterangan:'',
                        updated_at: new Date(),
                        updated_by: userName,
                    },
                };

                // Hanya set password jika body.password ada
                if (body.created_at) {
                    updateDoc.$set.created_at = body.created_at;
                }
                if (body.created_by) {
                    updateDoc.$set.created_by = body.created_by;
                   
                }
                if (body.created_at) {
                    updateDoc.$set.created_at = body.created_by;
                   
                }

                console.log('filter', filter);
                const inventaris = await db.collection("inventaris")
                    .updateOne(filter, updateDoc, { upsert: true });

                res.status(200).json({ data: [inventaris], message: 'data berhasil di perbaharui' });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
        case "DELETE":
            try {
                 const inventaris = await db.collection("inventaris")
                    .find({  _id: id }).toArray(); 
                    const isiId = inventaris[0].kodeBarang || "";
                    console.log(`isId =`+isiId)
        const isiJumlah = parseInt(inventaris[0].jumlah || 0); // Parse menjadi integer, default 0 jika null/undefined
                    const namaKategori = inventaris[0].namaKategori || "";
                    console.log(`iskategori =`+namaKategori)
                    console.log(`isjumlah =`+ isiJumlah)
                     const barang = await db.collection("barang")
                    .find({  kodeBarang: isiId }).toArray(); 
                    const isiStok = barang[0].stok || 0;
                    let newStok = 0;
                     let updateStok = false;

                if (namaKategori === "in") {
                    newStok = isiStok-isiJumlah;
                    updateStok = true;
                } else if (namaKategori === "out") {
                   
                        newStok = isiStok+isiJumlah;
                        updateStok = true;
                   
                }
                const updateDelete = {
                    $set: {
                        stok: newStok,
                        updated_at: new Date(),
                        updated_by: userName,
                    }
                }
               await db.collection("barang")
    .updateOne({ kodeBarang: isiId }, updateDelete);
                const resDelete = await db.collection("inventaris").deleteOne({
                    _id: id
                });

                if (resDelete.deletedCount < 1) {
                    throw new Error('data tidak ditemukan');
                }

                res.json({ data: [resDelete], message: "data berhasil dihapus" });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
        default:
            try {
                const inventaris = await db.collection("inventaris")
                    .findOne({ _id: id });
                res.json({ data: inventaris });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
    }
}