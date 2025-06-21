import React, { useState, useEffect } from 'react';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  

  // Fungsi untuk melakukan pencarian
  const handleSearch = async (event) => {

    setSearchTerm(event.target.value);
     
        try{
            const response = await fetch(`/api/blogs/?search=${searchTerm}`);
            let data = await response.json();
            setSearchResults(data);

        }catch(err){
            console.error("ERR", err.message)
            setModal(true)
            setModalTitle('Err')
            setModalMessage(err.message)
        }
    

      

    
   

  };

  return (
    <div>
      <input
        type="text"
        placeholder="Cari..."
        value={searchTerm}
        onChange={handleSearch}
      />
     
    </div>
  );
}

export default SearchBar;