'use client'
import Card from '../../../../components/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';
import "./../../../(auth)/global.css"

export default function AdminBarang() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [barang, setKategori] = useState([]); // Stores all barang
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [kodeBarang, setKodeBarang] = useState(null);
  const [searchTerm,setSearchTerm]=useState('')
  const [data,setData]=useState([])
  const [filteredData,setFilteredData]=useState([])

 

    const onAddNew = ()=>{
        router.push('/admin/daftarBarang/form')
    }

    const onConfirmDelete=(id,kodeBarang)=>{
        setDeleteId(id)
        setKodeBarang(kodeBarang)
        setIsOkOnly(false)
        setModalTitle('Confirm')
        setModalMessage('Apakah and yakin ingin menghapus data ini?')
        setModal(true)
        

    }

    const onCancel=()=>{
        setModal(false)
    }

    const onConfirmOk=async ()=>{
        try{
      
            const res = await fetch(`/api/daftarBarang/${deleteId}`,{method:'DELETE'});
            let data = await res.json()

            setIsOkOnly(true)
            setModalTitle('Info')
            setModalMessage(data.message)
            setModal(true)
            fetchData()
        }catch(err){
            console.error("ERR", err.message)
            setModal(true)
            setModalTitle('Err')
            setModalMessage(err.message)
        }
    
    }


 
    
    const fetchData = async () => {
        try {
            let res = await fetch("/api/daftarBarang");
          let data = await res.json();
          setData(data.data);//menerima objek data dari api dan memasukkannya ke dalam state data
          setFilteredData(data.data);
          setLoading(false);

        } catch (err) {
            console.log("err", err);
            setData([]);
            setLoading(false);

        }
      };
      useEffect(() => {
        fetchData();
      }, []); // Re-run fetchData on searchTerm change
    
    const gotoEditPage=(id)=>{
        router.push(`/admin/daftarBarang/edit/${id}`)
    }

    return (
       <div class="overflow-x-auto">
  
        <Card title="List Daftar Barang" class="w-full sm:w-[500px] md:w-[700px] lg:w-[900px]" style="mt-5" showAddBtn onAddNew={onAddNew}>
        {/* <form
        onSubmit={handleSearchSubmit}
        className="flex items-center space-x-4 max-w-md mb-6"
      >
        <input
          type="text"
          placeholder="Cari berdasarkan judul..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring focus:ring-indigo-300"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Submit
        </button>
      </form> */}
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className='table-head border-blue-gray-100'>No</th>
                        <th className='table-head border-blue-gray-100'>Kategori</th>
                        <th className='table-head border-blue-gray-100'>Nama</th>
                        <th className='table-head border-blue-gray-100'>Stok</th>
                        <th className='table-head border-blue-gray-100'>Satuan</th>
                        <th className='table-head border-blue-gray-100'>Kode Barang</th>
                        <th className='table-head border-blue-gray-100'>Action</th>
                    </tr>
                </thead>
                <tbody>
                  
                {!isLoading && filteredData.map((item, key)=>{
                        return (
                            <tr key={key} className='border-b border-blue-gray-50 '>
                                <td className='p-2 text-center'>{key+1}</td>
                                <td className='p-2 '>{item.namaKategori} </td>
                                <td className='p-2 '>{item.namaBarang} </td>
                                <td className='p-2 '>{item.stok} </td>
                                <td className='p-2 '>{item.satuan} </td>
                                <td className='p-2 '>{item.kodeBarang} </td>

                                 <td className='p-2 '>
                                    <div className="inline-flex text-[12px]">
                                        <button 
                                            onClick={()=>gotoEditPage(item._id)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4">
                                            Edit
                                        </button>
                                        <button 
                                            onClick={()=>onConfirmDelete(item._id,item.kodeBarang)}
                                            className="bg-red-300 hover:bg-red-400 text-gray-800 py-2 px-4 rounded-r">
                                            Delete
                                        </button>
                                    </div>
                                </td> 
                            </tr>
                        )
                    })
                    }
                </tbody>
            </table>
        </Card>

        <ConfigDialog
        onOkOny={() => onCancel()}
        showDialog={modal}
        title={modalTitle}
        message={modalMessage}
        onCancel={() => onCancel()}
        onOk={() => onConfirmOk()}
        isOkOnly={isOkOnly}
      />
     </div>
        
    );
}