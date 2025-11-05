'use client'
import Card from '../../../../components/card';
import PaginatedTable from '../../../../components/PaginatedTable';

import { useRouter} from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';
import SearchBar from "../../../../components/SearchBar"
import{useFilter} from '../../../../customHooks/useFilter';

export default function AdminPengguna() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [data,setData]=useState([])
     const {searchTerm,filteredData,handleSearchChange}=useFilter(data,['nama','email'])

 

    const onAddNew = ()=>{
        router.push('/admin/pengguna/form')
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
            const res = await fetch(`/api/pengguna/${deleteId}`,{method:'DELETE'});
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
            let res = await fetch("/api/pengguna");
          let data = await res.json();
     
          setData(data.data);
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
        router.push(`/admin/pengguna/edit/${item._id}`)
    }

 const ITEM_COLUMNS = [
        { header: 'Nama', field: 'nama' },
        { header: 'Email', field: 'email' },
        { header: 'role', field: 'role' },

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
        <>
           <SearchBar 
                    onSearchChange={handleSearchChange}
                    searchTerm={searchTerm}
        />
       <PaginatedTable data={filteredData} columns={ITEM_COLUMNS} itemsPerPage={10} title="List Pengguna" showAddBtn onAddNew={onAddNew} />
       

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