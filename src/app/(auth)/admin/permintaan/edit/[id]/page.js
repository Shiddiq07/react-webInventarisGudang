"use client"
import { useRouter, useParams } from 'next/navigation';
import Card from '../../../../../../components/card';
import { useEffect, useState, useRef } from 'react';
import ConfigDialog from '../../../../../../components/ConfirmDialog'

export default function EditDaftarBarang() {
    const router= useRouter()
    const params = useParams()
    const [modal, setModal] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [isOkOnly, setIsOkOnly] = useState(true)
    const [data, setData] = useState({
       kodeBarang:'',
    namaPemohon:'',
    jumlah:'',
    date:'',
    keterangan:'',
    status:'',  
        updated_at:new Date()
    });


    const fetchDataById = async ()=>{
        try{
            const res = await fetch(`/api/permintaan/${params.id}`);
            let responseData = await res.json()
            setData(responseData.data)

        }catch(err){
            console.error("ERR", err.message)
            setModal(true)
            setModalTitle('Err')
            setModalMessage(err.message)
        }
    }

    const onCancel=()=>{
        setModal(false)
    }

    const onOkOnly=()=>{
        setModal(false)
        // router.push('/admin/permintaan')
    }

    const inputHandler= (e) =>{
        setData({...data, [e.target.name]: e.target.value })
    }

    const onSubmitData= async ()=>{
try{
        const res =  await fetch(`/api/permintaan/${data._id}`,{
            method:'PUT',
            body: JSON.stringify(data),
        })
        
                let resData = await res.json()
                if(!resData.data){
                throw Error(resData.message)
                }
                setModal(true)
                setModalTitle('Info')
                setModalMessage(resData.message)  
            
        }catch(err){
          console.error("ERR", err.message)
          setModal(true)
          setModalTitle('Err')
          setModalMessage(err.message)
        }
      
    }

    useEffect(()=>{
        fetchDataById()
    },[])

    return (
    <>

        <Card title="Form Edit Permintaan">
              <div className="w-full my-2">
                <label>Nama</label>
                    <input 
                       id="namaPemohon"
                        name='namaPemohon'
                        value={data.namaPemohon}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>
              <div className="w-full my-2">
                <label>Kode Barang</label>
                    <input 
                       id="kodeBarang"
                        name='kodeBarang'
                        value={data.kodeBarang}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>
           
       
            <div className="w-full my-2">
                <label>jumlah</label>
                    <input 
                       id="jumlah"
                        name='jumlah'
                        value={data.jumlah}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>
           
            <div className="w-full my-2">
                <label>Date</label>
                    <input 
                       id="date"
                        name='date'
                        value={data.date}
                        onChange={inputHandler}
                        type="date" 
                        className="w-full border my-input-text"/>
            </div>
           <div className="w-full my-2">
                <label>Keterangan</label>
                    <input 
                       id="keterangan"
                        name='keterangan'
                        value={data.keterangan}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>
               
            <div className="mt-2">
                                <select
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                      <option value="">--pilih--</option>
                                      <option value="pending">pending</option>
                                      <option value="approve">approve</option>
            </select>
          </div>
            <button  className="btn-primary" onClick={onSubmitData}>
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