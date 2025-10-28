"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react';
export default function AdminMenu() {
    const router = useRouter()

    
    const onLogOut= async ()=>{
      const res =  await fetch(`/api/auth/logout`,{
        method:'POST',
      })

      let response = await res.json()
      if(res.status == 200){
        router.push('/', { scroll: false })
      }
    }
    
    return (
       <div className={`w-full overflow-x-auto`}>
                       <header className="py-4 px-6 bg-gray-800 w-full rounded-xs min-w-[300px]">

          <nav className="w-full">
            <div className="max-w-5xl mx-auto px-6 md:px-12 xl:px-6">
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <a href="/admin" className="text-white font-semibold">Admin Panel</a>
                </div>
               
                <div >
                  <ul className="flex flex-row gap-6">
                    <li className="mt-1">
                      <a className="btn-link text-white" href="/admin/daftarBarang">Daftar Barang</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link text-white" href="/admin/inventori">Inventori</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link text-white" href="/admin/pengguna">Pengguna</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link text-white" href="/admin/permintaan">Permintaan</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link text-white" href="/admin/laporan">Laporan</a>
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
        
    )
}