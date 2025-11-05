import { useState, useMemo } from 'react';

// Define the function to calculate the visible page range (similar to before)
const calculatePageRange = (currentPage, totalPages, pageLimit) => {
    let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    let endPage = startPage + pageLimit - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - pageLimit + 1); 
    }
    
    // Create the array of numbers [1, 2, 3, 4, 5]
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
};


export const usePagination = (data, itemsPerPage = 10, pageLimit = 5) => {
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Calculate the total number of pages
    const totalPages = useMemo(() => {
        return Math.ceil(data.length / itemsPerPage);
    }, [data.length, itemsPerPage]);
    
    // 2. Slice the data based on the current page
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);

    // 3. Calculate which page buttons to show
    const pageRange = useMemo(() => {
        return calculatePageRange(currentPage, totalPages, pageLimit);
    }, [currentPage, totalPages, pageLimit]);

    // Function to handle switching pages
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        paginatedData,
        currentPage,
        totalPages,
        pageRange,
        goToPage,
        itemsPerPage,
        setCurrentPage // Keep this for external control if needed
    };
};