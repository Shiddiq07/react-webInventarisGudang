"use client"
import { create } from 'domain';
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register(){
    const router = useRouter();
    const [data, setData] = useState({
        name:'',
        email:'',
        role:'staff',
        password:'',
       
        created_at:new Date(),
    });

    const onSubmitRegister= async ()=>{

        const res =  await fetch(`/api/auth/register`,{
            method:'POST',
            body: JSON.stringify(data),
        })
        let response = await res.json()

        if(res.status == 200){
            router.push('/')
        }
    }

    const inputHandler= (e) =>{
        setData({...data, [e.target.name]: e.target.value })
      }

    return (
        <>
           <div className="container-fluid flex justify-center mt-12 ">
        
        <div className="flex min-h-full flex-1 flex-col justify-center px-4 py-12 lg:px-8 ">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="LP3I Jakarta Logo"
                    src="https://www.lp3i.ac.id/wp-content/uploads/2022/06/logo.svg"
                    className="mx-auto h-13 w-18"
                />
            <h3 className="mt-2 text-white text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                General Affair
            </h3>
           
            </div>

            <div className="p-5 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="" method="POST" className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                Full Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                       

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        {/* <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                confirm password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    required
                                    onChange={inputHandler}
                                    className="pl-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div> */}

                        <div>
                            <button
                                type="button"
                                onClick={onSubmitRegister}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Register
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Already have account?{' '}
                        <a href="/" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            login noew
                        </a>
                    </p>
                </div>
            </div>
            </div>
        </>
    )
}