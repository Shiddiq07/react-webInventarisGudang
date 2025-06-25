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
             const hashPwd= await hashPassword(body.password)
                
                const updateDoc: any = {
                    $set: {
                        nama: body.nama,
                        email: body.email,
                        updated_at: new Date(),
                        updated_by: userName
                    },
                };

                // Hanya set password jika body.password ada
                if (body.password) {
                    updateDoc.$set.password = hashPwd;
                }
                if (body.created_by) {
                    updateDoc.$set.created_by = body.created_by;
                   
                }
                if (body.created_at) {
                    updateDoc.$set.created_at = body.created_by;
                   
                }

                console.log('filter', filter);
                const pengguna = await db.collection("pengguna")
                    .updateOne(filter, updateDoc, { upsert: true });

                res.status(200).json({ data: pengguna, message: 'data berhasil di perbaharui' });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
        case "DELETE":
            try {
                 const validasiHapus = await db.collection('barang').findOne({ _id: id });
                const kodeBarang = validasiHapus?.kodeBarang;
                console.log( kodeBarang);
                const hapusLanjutan = await db.collection('inventaris').find({ kodeBarang: kodeBarang }).toArray();
                console.log( hapusLanjutan);
                if (hapusLanjutan == null || hapusLanjutan.length === 0) {
                const resDelete = await db.collection("pengguna").deleteOne({
                    _id: id
                });

                if (resDelete.deletedCount < 1) {
                    throw new Error('data tidak ditemukan');
                }

                res.json({ data: [resDelete], message: "data berhasil dihapus" });
                  }else {
                    res.status(422).json({ message: "data tidak bisa dihapus" });
                }
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
        default:
            try {
                const pengguna = await db.collection("pengguna")
                    .findOne({ _id: id });
                res.json({ data: pengguna });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
    }
}