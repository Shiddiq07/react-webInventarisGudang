import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from 'mongodb';


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
                   namaPemohon: body.namaPemohon,
                    status: body.status,
                    kodeBarang:body.kodeBarang,
                    jumlah: body.jumlah,
                    keterangan: body.keterangan,
                    date: body.date, 
                        updated_at: new Date(),
                        updated_by: userName
                    },
                };
              
                if( body.kodeBarang == ""){
                    throw new Error('kode barang is required')
                }
                
                if( body.status == ""){
                    throw new Error(' status is required')
                }
                
                if( body.namaPemohon == ""){
                    throw new Error('Nama is required')
                }
                
                if( body.jumlah == ""){
                    throw new Error('jumlah is required')
                }
                if( body.keterangan == ""){
                    throw new Error('keterangan is required')
                }
                if( body.date == ""){
                    throw new Error('date is required')
                }

                console.log('filter', filter);
                const permintaan = await db.collection("permintaan")
                    .updateOne(filter, updateDoc, { upsert: true });

                res.status(200).json({ data: [permintaan], message: 'data berhasil di perbaharui' });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
        case "DELETE":
            try {
                const resDelete = await db.collection("permintaan").deleteOne({
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
                const permintaan = await db.collection("permintaan")
                    .findOne({ _id: id });
                res.json({ data: permintaan });
            } catch (err: any) {
                res.status(422).json({ message: err.message });
            }
            break;
    }
}