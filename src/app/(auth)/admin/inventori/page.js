'use client'
import Card from '../../../../components/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';
import SearchBar from "../../../../components/SearchBar"
import{useFilter} from '../../../../customHooks/useFilter';
export default function AdminBarang() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [barang, setKategori] = useState([]); // Stores all barang
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [data,setData]=useState([])

     const {searchTerm,filteredData,handleSearchChange}=useFilter(data,['kodeBarang','namaKategori'])
 

    const onAddNew = ()=>{
        router.push('/admin/inventori/form')
    }

    const onConfirmDelete=(id)=>{
        setDeleteId(id)
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
            const res = await fetch(`/api/inventaris/${deleteId}`,{method:'DELETE'});
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
            let res = await fetch("/api/inventaris");
          let data = await res.json();
          setData(data.data);
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
    
    
    
    return (
        <>
         <SearchBar 
                    onSearchChange={handleSearchChange}
                    searchTerm={searchTerm}
        />
        <Card title="List Inventaris Masuk/Keluar" style="mt-5" showAddBtn onAddNew={onAddNew}>
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className='table-head border-blue-gray-100'>No</th>
                        <th className='table-head border-blue-gray-100'>Kode Barang</th>
                        <th className='table-head border-blue-gray-100'>Nama</th>
                        <th className='table-head border-blue-gray-100'>Jumlah</th>
                        <th className='table-head border-blue-gray-100'>Kategori</th>
                        <th className='table-head border-blue-gray-100'>Keterangan</th>
                        <th className='table-head border-blue-gray-100'>Date</th>
                        <th className='table-head border-blue-gray-100'>Action</th>
                    </tr>
                </thead>
                <tbody>
                  
                {!isLoading && filteredData.map((item, key)=>{
                        return (
                            <tr key={key} className='border-b border-blue-gray-50 '>
                                <td className='p-2 text-center'>{key+1}</td>
                                <td className='p-2 text-center'>{item.kodeBarang} </td>
                                <td className='p-2 text-center'>{item.created_by}</td>
                                <td className='p-2 text-center'>{item.jumlah} </td>
                                <td className='p-2 text-center'>{item.namaKategori} </td>
                                <td className='p-2 text-center'>{item.keterangan} </td>
                                <td className='p-2 text-center'>{item.date} </td>
                                 <td className='p-2 text-center'>
                                    <div className="inline-flex text-[12px]">
                                     
                                        <button 
                                            onClick={()=>onConfirmDelete(item._id)}
                                            className="bg-red-300 hover:bg-red-400 text-gray-800 py-2 px-4 rounded-r">
                                            Batalkan
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
      </>
    );
}