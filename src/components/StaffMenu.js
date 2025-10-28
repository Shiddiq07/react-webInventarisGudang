"use client"
import { useRouter,useParams } from 'next/navigation'
import React, { useState } from 'react';
export default function StaffMenu() {
    const router = useRouter()
    const params = useParams();

    
    const onLogOut= async ()=>{
      const res =  await fetch(`/api/auth/logout`,{
        method:'POST',
      })

      let response = await res.json()
      if(res.status == 200){
        router.push('/', { scroll: false })
      }
    }

     const ambilId =params.id;
let home=`/staff/${params.id}`;
let tujuanStatus=`/staff/status/${params.id}`;
let tujuanListBarang=`/staff/daftarBarang/${params.id}`;
   
    return (
        <div className={`w-full overflow-x-auto`}>
            <header className="py-4 px-6 bg-gray-800 w-full rounded-xs min-w-[300px]">
          <nav className="w-full">
            <div className="max-w-5xl mx-auto px-6 md:px-12 xl:px-6">
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <a href="/staff" className="text-white font-semibold">Staff Panel</a>
                </div>
                <div className="burger-menu-container">
   
    </div>
                <div>
                  <ul className="flex flex-row gap-6">
                    <li className="mt-1">
                                             <a className="btn-link text-white" href={home} >Home</a>

                    </li>
                    <li className="mt-1">
                                             <a className="btn-link text-white" href={tujuanStatus} >Status Permintaan</a>

                    </li>
                  
                    <li className="mt-1">
                      <a className="btn-link text-white" href={tujuanListBarang}>Daftar Barang</a>
                    </li>
                    <li className="mt-1">
                        <button  className="btn-primary" onClick={onLogOut}>
                            <span className="relative text-sm font-semibold text-white">
                                Log Out
                            </span>
                         </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        
        </header>
</div>
       
    );
}