'use client'
import Card from '../../../../../components/card';
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
    
    

    return (

      <div class="overflow-x-auto">
        <SearchBar 
                      onSearchChange={handleSearchChange}
                      searchTerm={searchTerm}
          />
        <Card title="List Daftar Barang" style="mt-5" >
      
          <table className="w-full min-w-max">
            
                <thead>
                    <tr>
                        <th className='table-head border-blue-gray-100'>No</th>
                        <th className='table-head border-blue-gray-100'>Kategori</th>
                        <th className='table-head border-blue-gray-100'>Nama</th>
                        <th className='table-head border-blue-gray-100'>Stok</th>
                        <th className='table-head border-blue-gray-100'>Satuan</th>
                        <th className='table-head border-blue-gray-100'>Kode Barang</th>
                    </tr>
                </thead>
                <tbody>
                  
                {!isLoading && filteredData.map((item, key)=>{
                        return (
                            <tr key={key} className='border-b border-blue-gray-50 '>
                                <td className='p-2 text-center'>{key+1}</td>
                                <td className='p-2 text-center'>{item.namaKategori} </td>
                                <td className='p-2 text-center'>{item.namaBarang} </td>
                                <td className='p-2 text-center'>{item.stok} </td>
                                <td className='p-2 text-center'>{item.satuan} </td>
                                <td className='p-2 text-center'>{item.kodeBarang} </td>
                               
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