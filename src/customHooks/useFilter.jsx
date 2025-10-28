// src/hooks/useFilter.js (Ini adalah custom hook Anda)

import { useState, useMemo } from 'react';

// 1. Hook menerima data awal, kriteria, dan field mana yang harus dicek
export const useFilter = (initialData, filterFields) => {
    const [searchTerm, setSearchTerm] = useState('');
 const handleSearchChange = (event)=>{
        setSearchTerm(event.target.value);
    }
    // 2. Gunakan useMemo untuk memastikan filtering hanya dilakukan 
    //    ketika data, searchTerm, atau filterFields berubah.
    const filteredData = useMemo(() => {
        if (!searchTerm || !initialData) {
            return initialData; // Jika tidak ada search term, kembalikan data asli.
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return initialData.filter(item => {
            // Check if ANY of the specified fields contains the search term
            return filterFields.some(field => {
                const value = item[field]; // Ambil nilai field berdasarkan nama
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerCaseSearchTerm);
                }
                // Jika field bukan string (misal number), konversi dulu
                return String(value).toLowerCase().includes(lowerCaseSearchTerm);
            });
        });
    }, [initialData, searchTerm, filterFields]); // Dependencies

    return {
        filteredData,
        searchTerm,
        handleSearchChange,
    };
};