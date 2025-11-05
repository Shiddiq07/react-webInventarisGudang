'use client'
import PaginatedTable from '../../../../components/PaginatedTable';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';
import SearchBar from "../../../../components/SearchBar"
import{useFilter} from '../../../../customHooks/useFilter';
export default function AdminBarang() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [data,setData]=useState([])

     const {searchTerm,filteredData,handleSearchChange}=useFilter(data,['kodeBarang','namaKategori'])
 

    const onAddNew = ()=>{
        router.push('/admin/inventori/form')
    }

    const onConfirmDelete=(item)=>{
      const itemId = item._id; // <-- The ID is extracted here
  

        setDeleteId(itemId)
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
    
    
    const ITEM_COLUMNS = [
        { header: 'Kode Barang', field: 'kodeBarang' },
        { header: 'Pengguna', field: 'created_by' },
        { header: 'Jumlah', field: 'jumlah' },
        { header: 'Kategori', field: 'namaKategori' },

        { header: 'keterangan', field: 'keterangan' },
        { header: 'date', field: 'date' },
      { 
        header: 'Action', 
        field: 'actions', 
        render: (item) => (
            <div className="inline-flex text-[12px]">
              <button 
                                            onClick={()=>onConfirmDelete(item)}
                                            className="bg-red-300 hover:bg-red-400 text-gray-800 py-2 px-4 rounded-r">
                                            Batalkan
                                        </button>
            </div>
        )
    }

];
    
    return (
        <>
         <SearchBar 
                    onSearchChange={handleSearchChange}
                    searchTerm={searchTerm}
        />
       <PaginatedTable data={filteredData} columns={ITEM_COLUMNS} itemsPerPage={10} title="List Inventaris Keluar/Masuk" showAddBtn onAddNew={onAddNew} />
       

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