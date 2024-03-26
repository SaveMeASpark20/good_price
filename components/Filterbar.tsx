import { Product } from "@/types";
import { ChangeEvent, useState } from "react";

interface Props  {
    products : Product[];
}

const Filterbar = ({products} : Props) => {
    const [filterText, setFilterText] = useState('');

    const handleFilterText = (event: ChangeEvent<HTMLInputElement>) => {
        
    }

    const filteredProducts = () => {
        
    }

    const handleFilteringProduct = (searchtext : string) => {
        const compareSearch = new RegExp(searchtext, "i");
        console.log(searchtext)
        return 
    }
    return (
        <form>
            <input type="text" value={filterText}  onChange={handleFilterText} placeholder="Search product"></input>
        </form>
  )
}

export default Filterbar