"use client"
import { useRouter } from 'next/navigation'
// import './BurgerMenu.css';
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
    // const [isOpen, setIsOpen] = useState(false);

    // const toggleMenu = () => {
    //   setIsOpen(!isOpen);
    // };
  
    // const menuItems = [
    //   {
    //     label: 'Menu 1',
    //     subItems: ['Sub Menu 1.1', 'Sub Menu 1.2', 'Sub Menu 1.3', 'Sub Menu 1.4'],
    //   },
    //   {
    //     label: 'Menu 2',
    //     subItems: ['Sub Menu 2.1', 'Sub Menu 2.2', 'Sub Menu 2.3', 'Sub Menu 2.4'],
    //   },
    //   {
    //     label: 'Menu 3',
    //     subItems: ['Sub Menu 3.1', 'Sub Menu 3.2', 'Sub Menu 3.3', 'Sub Menu 3.4'],
    //   },
    // ];
    return (
       <div className={`w-full overflow-x-auto`}>
            <div className="bg-white rounded-xl min-w-[300px]">
        <header className="py-2 ">
          <nav className="w-full">
            <div className="max-w-5xl mx-auto px-6 md:px-12 xl:px-6">
              <div className="flex flex-wrap items-center justify-between">
                <div>
                  <a href="/admin">Admin Panel</a>
                </div>
                <div className="burger-menu-container">
      {/* Tombol Burger */}
      {/* <button className="burger-button" onClick={toggleMenu}>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
      </button>

      {/* Menu Samping */}
      {/* <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleMenu}>
          &times;  Simbol Close 
        </button>
        <nav>
          <ul>
            {menuItems.map((menuItem, index) => (
              <li key={index} className="menu-item">
                {menuItem.label}
                <ul className="sub-menu">
                  {menuItem.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className="sub-item">
                      {subItem}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      Overlay (opsional) untuk menggelapkan background saat menu terbuka 
      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}  */}
    </div>
                <div >
                  <ul className="flex flex-row gap-6">
                    <li className="mt-1">
                      <a className="btn-link" href="/admin/daftarBarang">Daftar Barang</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link" href="/admin/inventori">inventori</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link" href="/admin/pengguna">pengguna</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link" href="/admin/permintaan">permintaan</a>
                    </li>
                    <li className="mt-1">
                      <a className="btn-link" href="/admin/laporan">laporan</a>
                    </li>
                    <li>
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
        </div>
    )
}