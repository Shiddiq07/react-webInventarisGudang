'use client'
import Card from '../../../../components/card';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConfigDialog from '../../../../components/ConfirmDialog';

export default function AdminBarang() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [barang, setKategori] = useState([]); // Stores all barang
  const [isOkOnly, setIsOkOnly] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm,setSearchTerm]=useState('')
  const [data,setData]=useState([])
  const [filteredData,setFilteredData]=useState([])

 

    const onAddNew = ()=>{
        router.push('/admin/permintaan/form')
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
            const res = await fetch(`/api/permintaan/${deleteId}`,{method:'DELETE'});
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
            let res = await fetch("/api/permintaan");
          let data = await res.json();
          setData(data.data);
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
        router.push(`/admin/permintaan/edit/${id}`)
    }
//     const goToDetail=(id)=>{
// router.push(`/admin/barang/detail/${id}`)
//     }
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const results = data.filter((item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(results);
      };
  console.log(searchTerm)
    return (
        <>
        <Card title="List Permintaan Barang" style="mt-5" showAddBtn onAddNew={onAddNew}>
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
                        <th className='table-head border-blue-gray-100'>Kode Barang</th>
                        <th className='table-head border-blue-gray-100'>Nama</th>
                        <th className='table-head border-blue-gray-100'>Jumlah</th>
                        <th className='table-head border-blue-gray-100'>Keterangan</th>
                        <th className='table-head border-blue-gray-100'>Date</th>
                        <th className='table-head border-blue-gray-100'>status</th>
                        <th className='table-head border-blue-gray-100'>Action</th>
                    </tr>
                </thead>
                <tbody>
                  
                {!isLoading && filteredData.map((item, key)=>{
                        return (
                            <tr key={key} className='border-b border-blue-gray-50 '>
                                <td className='p-2 text-center'>{key+1}</td>
                                <td className='p-2 '>{item.kodeBarang} </td>
                                <td className='p-2 text-center'>{item.namaPemohon}</td>
                                <td className='p-2 '>{item.jumlah} </td>
                                <td className='p-2 '>{item.keterangan} </td>
                                <td className='p-2 '>{item.date} </td>
                                <td className='p-2 '>{item.status} </td>
                                 <td className='p-2 '>
                                    <div className="inline-flex text-[12px]">
                                        <button 
                                            onClick={()=>gotoEditPage(item._id)}
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4">
                                            Edit
                                        </button>
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