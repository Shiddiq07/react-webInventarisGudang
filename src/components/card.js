'use client'
export default function Card({ 
    children, 
    title, 
    style, 
    showAddBtn=false,
    onAddNew
}) {

    return (
        <div className={`w-full  px-4 my-2 ${style}`}>
            <div className=" bg-white p-10  rounded-xl">
                <div className="flex">
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

                { children }
            </div>
        </div>
    );
  }
  