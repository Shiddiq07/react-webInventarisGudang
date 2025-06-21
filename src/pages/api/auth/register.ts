import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../../lib/mongodb";
import { hashPassword } from "../../../lib/session"

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);

    switch (req.method) {
        case "POST":
            try{
                const body = JSON.parse(req.body)
                const hashPwd= await hashPassword(body.password)
                const userData = {
                    nama: body.name,
                    email:body.email,
                    role:body.role,
                    password: hashPwd,
                    created_at: new Date(),
                }

                let user = await db.collection("pengguna").insertOne(userData);
                res.json({ data: user });
                console.log('berhasil')

            } catch(err){
                res.status(422).json({ message: err.message});
                                console.log('gagal')

            }
            break;
        default:
            res.status(404).json({message: "page not found"});
        break;
    }
}