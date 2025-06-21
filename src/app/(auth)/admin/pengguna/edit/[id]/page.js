"use client"
import { useRouter, useParams } from 'next/navigation';
import Card from '../../../../../../components/card';
import { useEffect, useState, useRef } from 'react';
import ConfigDialog from '../../../../../../components/ConfirmDialog'
import { Editor } from '@tinymce/tinymce-react';

export default function EditPengguna() {
    const router= useRouter()
    const editorRef = useRef(null);
    const params = useParams()
    const [modal, setModal] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [isOkOnly, setIsOkOnly] = useState(true)
    const [data, setData] = useState({
        nama:'',
        email:'',
        password:'',
        _id:'',
        updated_at:new Date()
    });


    const fetchDataById = async ()=>{
        try{
            const res = await fetch(`/api/pengguna/${params.id}`);
            let responseData = await res.json()
            setData(responseData.data)
            console.log(data)


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
        router.push('/admin/pengguna')
    }

    const inputHandler= (e) =>{
        setData({...data, [e.target.name]: e.target.value })
    }

    const onSubmitData= async ()=>{
try{
        const res =  await fetch(`/api/pengguna/${data._id}`,{
            method:'PUT',
            body: JSON.stringify(data),
        })
           let resData = await res.json()
                if(!resData.data){
                throw Error(resData.message)
                }
                setModal(true)
                setModalTitle('Info')
                setModalMessage(resData.message)
            
        }catch(err){
          console.error("ERR", err.message)
          setModal(true)
          setModalTitle('Err')
          setModalMessage(err.message)
        }
    
      
    }
    // const onSubmitData=async ()=>{
    //     try{
          
    //             const body = data
    //             body.content = editorRef.current.getContent();

    //             let res = await fetch(`/api/pengguna/${data._id}`, {
    //                 method:'PUT',
    //                 body: JSON.stringify(body),
    //             })

    //          

    useEffect(()=>{
        fetchDataById()
    },[])

    return (
      <>
        <Card title="Pengguna Edit Form">
            <div className="w-full my-2">
                <label>Nama</label>
                    <input 
                        name='nama'
                        value={data.nama}
                        onChange={inputHandler}
                        type="text" 
                        className="w-full border my-input-text"/>
            </div>

            <div className="w-full my-2">
                <label>Email</label>
                    <input 
                        name='email'
                        value={data.email}
                        onChange={inputHandler}
                        className="w-full border my-input-text"/>
            </div>
            <div className="w-full my-2">
                <label>Password</label>
                    <input 
                        name='password'
                      
                        type='password'
                        onChange={inputHandler}
                        className="w-full border my-input-text"/>
            </div>
            {/* <div className="w-full my-2">
                <label>Confirm Password</label>
                    <input 
                        name='confirmpassword'
                        value={data.confirmpassword}
                        onChange={inputHandler}
                        className="w-full border my-input-text"/>
            </div> */}


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
  