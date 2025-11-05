"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation';

import "../../global.css";
import Card from '../../../../../components/card';
import ConfigDialog from '../../../../../components/ConfirmDialog'
export default function AdminFormPengguna(){
            const router= useRouter()

        const [modal, setModal] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
        const [isOkOnly, setIsOkOnly] = useState(true)

    const [data, setData] = useState({
        nama:'',
        email:'',
        role:'',
        password:'',
        created_at:new Date(),
    
    });
 const clearData = ()=>{
        setData({
         nama:'',
        email:'',
        role:'',
        password:'',
       
                
           
        })
    }
      const onCancel=()=>{
        setModal(false)
        setModalTitle('')
        setModalMessage('')
        clearData()
    }
  const validasi=()=>{
  // 5. Perbaiki akses nilai dari state 'data'
        if (!data.nama || !data.email|| !data.role || !data.password) {
            setModal(true);
            setIsOkOnly(true); // Ini adalah info/error, jadi OK Only
            setModalTitle('Validasi Input');
            setModalMessage('Harap lengkapi semua bidang: Nama, Email,Role, dan Password.');
            return; // Hentikan proses jika ada input yang kosong
        }

        setModal(true)
        setIsOkOnly(false) // Ini adalah konfirmasi, jadi bukan OK Only (ada Cancel)

        setModalTitle('Konfirmasi Penyimpanan')
        setModalMessage(`Apakah Anda yakin ingin menyimpan data pengguna?`)
    }

  const onConfirmOk = () => {
onSubmitData()

         setModal(false) // Modal ditutup setelah konfirmasi (dan onSubmitData dipanggil)
  }

   async function onSubmitData() {
        try{
            
                const body = data
               
                let res = await fetch('/api/pengguna', {
                    method:'POST',
                    body: JSON.stringify(body),
                })

                
                let resData = await res.json()
               if (!res.ok) { // Cek res.ok untuk status HTTP >= 200 dan < 300
                throw Error(resData.message)
                }
                                         setIsOkOnly(true)

                setModal(true)
                setModalTitle('Info')
                setModalMessage(resData.message)
                clearData()
                    // if (res.userRole === 'ga') {
                    //     router.push('/admin/daftarBarang');
                    // } else if (userRole === 'staff') {
                    //     router.push('/supplier');
                    // } else {
                    //     router.push('/'); // Atau halaman default lainnya
                    // }
        
                
        
                
            
        }catch(err){
          console.error("ERR", err.message)
          setModal(true)
          setModalTitle('Err')
          setModalMessage(err.message)
        }
      }

 const onOkOnly=()=>{
        setModal(false)
        router.push('/admin/pengguna')
    }

    const inputHandler= (e) =>{
        setData({...data, [e.target.name]: e.target.value })
      }

      
    return (
        <>
         <div className=" flex justify-center ">
        <div className="bodyForm">
            <Card>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Form Tambah Pengguna
                    </h2>
                </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="" method="POST" className="space-y-6">
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium leading-6 text-gray-900">
                               Nama
                            </label>
                            <div className="mt-2">
                                <input
                                    id="nama"
                                    name="nama"
                                    type="text"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                                role
                                                            </label>
                            <div className="mt-2">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                      <option value="staff">--pilih--</option>
                                      <option value="staff">staff</option>
                                      <option value="ga">Bag.GA</option>
        </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                      

                        <div>
                            <button
                                type="button"
                                onClick={validasi}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Save
                            </button>
                        </div>
                    </form>

                    
                </div>
            </div>
            </Card>
            </div>
            </div>
              <ConfigDialog  
                        onOkOny={()=>onOkOnly()} 
                        showDialog={modal}
                        title={modalTitle}
                        message={modalMessage}
                        onCancel={()=>onCancel()} 
                        onOk={()=>onConfirmOk()} 
                        isOkOnly={isOkOnly} />
        </>
    )
}