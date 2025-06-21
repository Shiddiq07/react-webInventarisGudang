import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../../lib/mongodb";
import { hashPassword } from "../../../lib/session"

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    const userName = req.headers['x-user-name'] as string | undefined;

    switch (req.method) {
        case "POST":
            try{
                const body = JSON.parse(req.body)
                const hashPwd= await hashPassword(body.confirm_password)
                const userData = {
                    nama: body.nama,
                    email:body.email,
                    role:body.role,
                    password: hashPwd,
                    created_at: new Date(),
                    updated_at: "",
                    created_by: userName,
                }

                let user = await db.collection("pengguna").insertOne(userData);
                res.json({ data: user });

            } catch(err){
                res.status(422).json({ message: err.message});
            }
            break;
        default:
         
        const DataPengguna = await db.collection("pengguna").find({}).toArray();
        res.json({ data: DataPengguna });
        break;
        break;
    }
}