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
        namaKategori:'',
        namaBarang:'',
        satuan:'',
        updated_at:new Date()
    });

 const satuanOptions = {
    'ATK': ['Pcs', 'Box', 'Pack', 'Set', 'Rim', 'Buah', 'Lusin', 'Papan', 'Lembar'], // Tambah 'Lembar' untuk ATK jika relevan
    'RTK': ['Pcs', 'Botol', 'Liter', 'Meter', 'Rol', 'Buah', 'Pack', 'Sachet', 'Dus', 'Gram', 'Kg'], // Tambah 'Gram', 'Kg' untuk RTK jika relevan
    // Tambahkan kategori lain jika Anda memiliki lebih dari ATK dan RTK
    '': [], // Jika tidak ada kategori yang dipilih, daftar satuan kosong
};
    const fetchDataById = async ()=>{
        try{
            const res = await fetch(`/api/daftarBarang/${params.id}`);
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
        router.push('/admin/daftarBarang')
    }

   const inputHandler = (e) => {
        const { name, value } = e.target;
        setData(prevData => {
            if (name === 'namaKategori') {
                // Jika kategori berubah, reset satuan
                return { ...prevData, [name]: value, satuan: '' };
            }
            return { ...prevData, [name]: value };
        });
    }


    const onSubmitData= async ()=>{
  try{
        const res =  await fetch(`/api/daftarBarang/${data._id}`,{
            method:'PUT',
            body: JSON.stringify(data),
        })
        let resData = await res.json()
 if (!res.ok) { // Cek res.ok untuk status HTTP >= 200 dan < 300
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

    useEffect(()=>{
        fetchDataById()
    },[])
 // 3. Dapatkan daftar satuan yang tersedia berdasarkan kategori yang dipilih
    // Menggunakan lowercase untuk mencocokkan nilai 'value' di option kategori
    const availableSatuan = satuanOptions[data.namaKategori.toUpperCase()] || [];
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
                            {/* Loop melalui satuan yang tersedia berdasarkan kategori yang dipilih */}
                            {availableSatuan.map(satuan => (
                                <option key={satuan} value={satuan}>
                                    {satuan}
                                </option>
                            ))}
          </select>
                              </div>
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
    );
}
  