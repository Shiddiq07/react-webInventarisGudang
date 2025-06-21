import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../../lib/mongodb";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    const userName = req.headers['x-user-name'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;

    switch (req.method) {
        case "POST":
            try{
                const body = JSON.parse(req.body)
              
                   
              
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
                
                if( userName == ""){
                    throw new Error('userName required')
                }
                
                if( userId == ""){
                    throw new Error('userId required')
                }
                
                const userData = {
                    pengguna_id: userId,
                    namaPemohon: body.namaPemohon,
                    status: body.status,
                    kodeBarang:body.kodeBarang,
                    jumlah:parseInt( body.jumlah),
                    keterangan: body.keterangan,
                    date: body.date,
                    created_at: new Date(),
                    updated_at: "",
                    updated_by: "",
                    created_by: userName,
                }

                let user = await db.collection("permintaan").insertOne(userData);
                res.status(200).json({ data: user, message: 'data berhasil di simpan'  });

            } catch(err){
                res.status(422).json({ message: err.message});
            }
            break;
        default:
         
        const DataPengguna = await db.collection("permintaan").find({}).toArray();
        res.json({ data: DataPengguna });
        break;
        break;
    }
}