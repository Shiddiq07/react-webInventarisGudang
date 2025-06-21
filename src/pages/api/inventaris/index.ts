import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../../lib/mongodb";
// import { useRouter } from 'next/navigation'
// import { kMaxLength } from 'buffer';


export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    const userName = req.headers['x-user-name'] as string | undefined;
    const userId = req.headers['x-user-id'] as string | undefined;

    switch (req.method) {
        case "POST":
            try{
                // const body = req.body
                const body = JSON.parse(req.body)
                if(typeof body !== "object"){
                    throw new Error('invalid request')
                }
               
                
                if( body.namaKategori == ""){
                    throw new Error('kategori is required')
                }
                if( body.kodeBarang == ""){
                    throw new Error('kode barang is required')
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
                
               

                const barang = await db.collection("barang")
                    .find({kodeBarang: body.kodeBarang }).toArray(); 
                console.log(barang[0].kodeBarang)
                console.log(body.kodeBarang)
                                if(body.kodeBarang == barang[0].kodeBarang ){
                                    let newStok =parseInt( barang[0].stok ) || 0;
                let updateStok = false;

                if (body.namaKategori === "in") {
                    newStok +=parseInt( body.jumlah);
                    updateStok = true;
                } else if (body.namaKategori === "out") {
                    if (newStok >= parseInt( body.jumlah)) {
                        newStok -=parseInt( body.jumlah);
                        updateStok = true;
                    } else {
                        throw new Error('Stok tidak mencukupi untuk kategori "out"');
                    }
                }
                if (updateStok) {
                                    const  userData = {
                    pengguna_id: userId,
                    kodeBarang:body.kodeBarang,
                    jumlah: body.jumlah,
                    namaKategori: body.namaKategori,
                    keterangan: body.keterangan,
                    date: body.date,
                    created_at: new Date(),
                    updated_at: "",
                    updated_by: "",
                    created_by: userName,
                }
                const updateStokBarang = {
                    $set: {
                        stok:newStok,
                        updated_at: new Date(),
                        updated_by: userName,
                    },
                }
                  let inventaris = await db.collection("inventaris").insertOne(userData);
             await db.collection("barang")
    .updateOne({ kodeBarang: body.kodeBarang }, updateStokBarang);
                res.status(200).json({ data: inventaris, message:'data berhasil di simpan'});
                }
            }else{
                                    throw new Error('invalid kode barang')
                                }
                
              
            }catch(err){
                res.status(422).json({ message: err.message});
            }
            break;
            
        default:

        const inventarisData = await db.collection("inventaris").find({}).toArray();
        res.json({ data: inventarisData });
        break;
    }
}