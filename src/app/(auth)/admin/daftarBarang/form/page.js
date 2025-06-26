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
    const satuanOptions = {
    'ATK': ['Pcs', 'Box', 'Pack', 'Set', 'Rim', 'Buah', 'Lusin', 'Papan', 'Lembar'], // Tambah 'Lembar' untuk ATK jika relevan
    'RTK': ['Pcs', 'Botol', 'Liter', 'Meter', 'Rol', 'Buah', 'Pack', 'Sachet', 'Dus', 'Gram', 'Kg'], // Tambah 'Gram', 'Kg' untuk RTK jika relevan
    // Tambahkan kategori lain jika Anda memiliki lebih dari ATK dan RTK
    '': [], // Jika tidak ada kategori yang dipilih, daftar satuan kosong
};
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
  // 5. Perbaiki akses nilai dari state 'data'
        if (!data.namaKategori || !data.namaBarang || !data.satuan) {
            setModal(true);
            setIsOkOnly(true); // Ini adalah info/error, jadi OK Only
            setModalTitle('Validasi Input');
            setModalMessage('Harap lengkapi semua bidang: Kategori, Nama Barang, dan Satuan.');
            return; // Hentikan proses jika ada input yang kosong
        }

        setModal(true)
        setIsOkOnly(false) // Ini adalah konfirmasi, jadi bukan OK Only (ada Cancel)

        setModalTitle('Konfirmasi Penyimpanan')
        setModalMessage(`Apakah Anda yakin ingin menyimpan "${data.namaBarang}" sebagai kategori "${data.namaKategori.toUpperCase()}" dengan satuan "${data.satuan.toUpperCase()}"?`)
    }

  const onConfirmOk = () => {
onSubmitData()

         setModal(false) // Modal ditutup setelah konfirmasi (dan onSubmitData dipanggil)
  }
    async function onSubmitData() {
        try{
            
                const body = data
               
                let res = await fetch('/api/daftarBarang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Penting: tambahkan header ini
                },
                body: JSON.stringify(body),
            })
                let resData = await res.json()
            if (!res.ok) { // Cek res.ok untuk status HTTP >= 200 dan < 300
                throw Error(resData.message)
                }
                setModal(true)
                         setIsOkOnly(true)

                setModalTitle('Info')
                setModalMessage(resData.message)
                 clearData()
        }catch(err){
          console.error("ERR", err.message)
          setModal(true)
          setModalTitle('Err')
                   setIsOkOnly(true)

          setModalMessage(err.message)
        }
      }
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
                            {/* Loop melalui kunci (kategori) dari satuanOptions */}
                            {Object.keys(satuanOptions).filter(key => key !== '').map(kategori => (
                                <option key={kategori} value={kategori}>
                                    {kategori}
                                </option>
                            ))}
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
                                     disabled={!data.namaKategori}

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