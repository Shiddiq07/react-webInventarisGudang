// src/components/PaginatedTable.jsx

import React from 'react';
import { usePagination } from '../customHooks/usePagination'; 


// 1. Define the reusable Table Component
export default function PaginatedTable({ data, columns, itemsPerPage = 10 , title,
        showAddBtn=false,
    onAddNew}) {
    
    // Use the custom hook to manage data and state
    const {
        paginatedData,
        currentPage,
        totalPages,
        pageRange,
        goToPage,
       
    } = usePagination(data, itemsPerPage);

    // A reusable function for the page buttons styling
    const getPageButtonClasses = (page) => {
        return `
            px-3 py-1 text-sm rounded transition-colors duration-200 
            ${page === currentPage 
                ? 'bg-blue-600 text-white font-semibold shadow-md' // Active Style (Tailwind Utilities)
                : 'text-gray-700 hover:bg-gray-100'              // Inactive Style
            }
        `;
    };

 
    return (
        <div className="flex flex-col">
            
            {/* --- The Table Display --- */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                 <div className="flex mt-10">
                    <h3 className="flex-1 text-2xl py-2">{title}</h3>

                    {   showAddBtn && 
                        <div>
                            <button 
                                onClick={onAddNew}
                                className="text-[12px] bg-green-300 hover:bg-green-400 text-gray-80 py-2 px-4 rounded">
                                Add New
                            </button> 
                        </div>
                    }
                    
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-600 text-white">
                        <tr>
              <th className='p-2 text-center text-white'>No</th>

                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item, itemIndex) => (
                            <tr key={itemIndex} className="hover:bg-gray-50">
   <td className='p-2 text-center'>{itemIndex+1}</td>
                                {columns.map((col, colIndex) => (
                                    
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900"
                                    >
                                     {col.render ? (
                        // If 'render' function exists, execute it, passing the current item object
                        col.render(item)
                    ) : (
                        // Otherwise, display the data field normally
                        item[col.field]
                    )}
                                    </td>
                                    
                                ))}
                               
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- The Pagination Controls --- */}
            <div className="mt-4 flex justify-between items-center px-4 py-2">
                <p className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
                </p>

                <nav className="flex items-center space-x-1" aria-label="Pagination">
                    {/* Previous Button */}
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={getPageButtonClasses(0) + (currentPage === 1 ? ' opacity-50 cursor-not-allowed' : '')}
                    >
                        Previous
                    </button>

                    {/* Page Numbers */}
                    {pageRange.map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={getPageButtonClasses(page)}
                        >
                            {page}
                        </button>
                    ))}
                    
                    {/* Next Button */}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={getPageButtonClasses(0) + (currentPage === totalPages ? ' opacity-50 cursor-not-allowed' : '')}
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    );
}