'use client'
import PaginatedTable from '../../../../../components/PaginatedTable';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../../components/ConfirmDialog';
  import SearchBar from "../../../../../components/SearchBar"
  import{useFilter} from '../../../../../customHooks/useFilter';

  
export default function StaffDaftarBarang() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [data,setData]=useState([])
        const {searchTerm,filteredData,handleSearchChange}=useFilter(data,['namaBarang','kodeBarang','namaKategori'])

 

 
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
        { header: 'Nama', field: 'namaBarang' },
        { header: 'Kategori', field: 'namaKategori' },
        { header: 'Stok', field: 'stok' },

        { header: 'Satuan', field: 'satuan' },
        { header: 'Kode Barang', field: 'kodeBarang' }
  ];
    return (

      <div class="overflow-x-auto">
        <SearchBar 
                      onSearchChange={handleSearchChange}
                      searchTerm={searchTerm}
          />
        <PaginatedTable data={filteredData} columns={ITEM_COLUMNS} itemsPerPage={10} title="List Daftar Barang" />
        
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