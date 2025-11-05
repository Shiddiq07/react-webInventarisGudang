'use client'
import PaginatedTable from '../../../../components/PaginatedTable';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';
import "./../../../(auth)/global.css"


import SearchBar from "../../../../components/SearchBar"
import{useFilter} from '../../../../customHooks/useFilter';

export default function AdminBarang() {
    
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [isOkOnly, setIsOkOnly] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [kodeBarang, setKodeBarang] = useState(null);
    const [data,setData]=useState([])
  
    const {searchTerm,filteredData,handleSearchChange}=useFilter(data,['namaBarang','kodeBarang','namaKategori'])

 

    const onAddNew = ()=>{
        router.push('/admin/daftarBarang/form')
    }

    const onConfirmDelete=(item)=>{
const itemId = item._id; // <-- The ID is extracted here
    const itemKode = item.kodeBarang;

        setDeleteId(itemId)
        setKodeBarang(itemKode)
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
         
          setLoading(false);
console.log(data.data)
        } catch (err) {
            console.log("err", err);
            setData([]);
            setLoading(false);

        }
      };
      useEffect(() => {
        fetchData();
      }, []); // Re-run fetchData on searchTerm change
    
    const gotoEditPage=(item)=>{

        router.push(`/admin/daftarBarang/edit/${item._id}`)
    }



    const ITEM_COLUMNS = [
        { header: 'Nama', field: 'namaBarang' },
        { header: 'Kategori', field: 'namaKategori' },
        { header: 'Stok', field: 'stok' },

        { header: 'Satuan', field: 'satuan' },
        { header: 'Kode Barang', field: 'kodeBarang' },
      { 
        header: 'Action', 
        field: 'actions', // Use a unique field name like 'actions'
        // Define the render function (or component) for this column:
        render: (item) => (
            <div className="inline-flex text-[12px]">
              <button 
                                            onClick={()=>gotoEditPage(item)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4">
                                            Edit
                                        </button>
                                        <button 
                                            onClick={()=>onConfirmDelete(item)}
                                            className="bg-red-300 hover:bg-red-400 text-gray-800 py-2 px-4 rounded-r">
                                            Delete
                                        </button>
            </div>
        )
    }
   
];
    return (
       <div className="overflow-x-auto">
    <SearchBar 
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
/>
<PaginatedTable  data={filteredData} columns={ITEM_COLUMNS} itemsPerPage={10} title="List Daftar Barang" showAddBtn onAddNew={onAddNew} />
        {/* <Card title="List Daftar Barang"  style="mt-5" showAddBtn onAddNew={onAddNew}>
      
            <table className="w-full min-w-max">
                <thead>
                    <tr>
                        <th className='table-head border-blue-gray-100'>No</th>
                        <th className='table-head border-blue-gray-100'>Nama</th>
                        <th className='table-head border-blue-gray-100'>Kategori</th>
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
                                <td className='p-2 text-center'>{item.namaBarang} </td>
                                <td className='p-2 text-center'>{item.namaKategori} </td>
                                <td className='p-2 text-center'>{item.stok} </td>
                                <td className='p-2 text-center'>{item.satuan} </td>
                                <td className='p-2 text-center'>{item.kodeBarang} </td>

                                 <td className='p-2 text-center'>
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
        </Card> */}

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