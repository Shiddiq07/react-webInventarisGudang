import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from "../../../lib/mongodb";
import { setCookie  } from 'cookies-next';
import { comparePassword, encrypt} from "../../../lib/session"


export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_NAME);
    let status: string | undefined;

    switch (req.method) {
        case "POST":
            try{
                let tokenData={};
                let token='';
                
                const body = JSON.parse(req.body)

                if( body.email == ""){
                    throw new Error('email is required')
                }

                if( body.password == ""){
                    throw new Error('password is required')
                }

                const users = await db.collection("pengguna")
                    .find({email: body.email }).toArray(); 

                if( users.length > 0 && await comparePassword(body.password, users[0].password )){
                     tokenData = {
                        id:users[0]._id,
                        email:users[0].email,
                        nama:users[0].nama,
                        role:users[0].role
                    }
                    token =await encrypt(tokenData);
                    setCookie(`${process.env.AUTH_COOKIE_NAME}`, token, { req, res, maxAge: 60 * 6 * 24 });
                }else{
                    throw new Error('invalid username or password')
                }
                

                res.status(200).json({
                    message: 'login berhasil', 
                    role: users[0].role,
                    nama: users[0].nama,
                    id:users[0]._id,

                    data: tokenData,
                    token:token
                });
            }catch(err){
                res.status(422).json({ message: err.message});
            }
            break;
        default:
            res.status(404).json({message: "page not found"});
        break;
    }
}