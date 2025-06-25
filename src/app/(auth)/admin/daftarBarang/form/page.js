'use client'
// import { create } from 'domain';
import Card from '../../../../../components/card';
import { useRouter } from 'next/navigation';

import ConfigDialog from '../../../../../components/ConfirmDialog'
import { useState ,useRef} from 'react'

export default function AdminKategoriForm() {
        const router= useRouter()
    const [modal, setModal] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [isOkOnly, setIsOkOnly] = useState(true)
    
    const [data, setData] = useState({
    namaKategori:'',
    namaBarang:'',
    satuan:'',
        created_at:new Date(),

    });

    
    const clearData = ()=>{
        setData({
            namaKategori:'',
    namaBarang:'',
            satuan:'',
                
           
        })
    }

    const inputHandler= (e) =>{
        setData({...data, [e.target.name]: e.target.value })
    }

    const onCancel=()=>{
        setModal(false)
        setModalTitle('')
        setModalMessage('')
        clearData()
    }
    const onOkOnly=()=>{
        setModal(false)
        router.push('/admin/daftarBarang/')
    }
const validasi=()=>{
 setModal(true)
         setIsOkOnly(false)

                setModalTitle('Confirm')
                setModalMessage(`Apakah Anda yakin ingin menyimpan ${namaBarang.value} sebagai ${namaKategori.value} dengan satuan ${satuan.value}?`)

            }

  const onConfirmOk = () => {
onSubmitData()

        setModal(false)
  }
    async function onSubmitData() {
        try{
            
                const body = data
               
                let res = await fetch('/api/daftarBarang', {
                    method:'POST',
                    body: JSON.stringify(body),
                })

                
                let resData = await res.json()
                if(!resData.data){
                throw Error(resData.message)
                }
                setModal(true)
                         setIsOkOnly(true)

                setModalTitle('Info')
                setModalMessage(resData.message)
        }catch(err){
          console.error("ERR", err.message)
          setModal(true)
          setModalTitle('Err')
                   setIsOkOnly(true)

          setModalMessage(err.message)
        }
      }

    return (
    <>

        <Card title="Daftar Barang Form">
        <div>
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                                Kategori
                                                            </label>
                            <div className="mt-2">
                                <select
                                    id="namaKategori"
                                    name="namaKategori"
                                    value={data.namaKategori}
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                      <option value="">--pilih--</option>
                                      <option value="atk">ATK</option>
                                      <option value="rtk">RTK</option>
        </select>
                            </div>
                        </div>
            <div className="w-full my-2">
                <label>nama</label>
                    <input 
                       id="namaBarang"
                        name='namaBarang'
                        value={data.namaBarang}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>
           
            <div>
                            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                                Satuan
                                                            </label>
                            <div className="mt-2">
                                <select
                                    id="satuan"
                                    name="satuan"
                                    value={data.satuan}
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                      <option value="">--pilih--</option>
                                      <option value="pcs">PCS</option>
                                      <option value="botol">Botol</option>
                                      <option value="rim">Rim</option>
                                      <option value="lembar">Lembar</option>
                                      <option value="box">Box</option>
                                      <option value="pack">Pack</option>
                                      <option value="disc">Disc</option>
        </select>
                            </div>
                        </div>
          
            <button  className="btn-primary" onClick={validasi}>
                <span className="relative text-sm font-semibold text-white">
                    Save Data
                </span>
            </button>
        </Card>

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