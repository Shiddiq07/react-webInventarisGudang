'use client'
import { create } from 'domain';
import Card from '../../../components/card';
import ConfigDialog from '../../../components/ConfirmDialog'
import { useState ,useRef} from 'react'

export default function StaffPermintaanForm() {
    const editorRef = useRef(null);
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
        created_at:new Date(),

    });

    
    const clearData = ()=>{
        setData({
    kodeBarang:'',
    namaPemohon:'',
    jumlah:'',
    date:'',
    keterangan:'',
    status:'',     
           
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
        router.push('/admin/permintaan')
    }

    async function onSubmitData() {
        try{
            
                const body = data
               
                let res = await fetch('/api/staffPermintaan', {
                    method:'POST',
                    body: JSON.stringify(body),
                })

                
                let resData = await res.json()
                if(!resData.data){
                throw Error(resData.message)
                }
                setModal(true)
                setModalTitle('Info')
                setModalMessage(resData.message)
                
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

    return (
    <>

        <Card title="Form Buat Permintaan">
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