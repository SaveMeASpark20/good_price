
"use client";

import { Product } from '@/types';
import { ChangeEvent, useEffect, useState } from 'react';
import ProductCard from './ProductCard';


interface Props {
    data : Product[];
}

const ProductList = ({data} : Props) => {
    return(
        <div className='flex flex-wrap gap-7'>
        {data.map((post) => (
          <ProductCard
            key={post._id}
            product={post}
          />
        ))}
      </div>
       
    )
}

const Trend = () => {
    const [products, setProducts] = useState<Product[]>([]);

    const [filterText, setFilterText] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [searchProducts, setSearchProducts] = useState<Product[]>([]);

    useEffect(()  => {
        const fetchProduct = async () => {
            const response = await fetch('api/products');
            const products = await response.json();

            setProducts(products);

        }
    fetchProduct();


    },[])
    
    const handleFilterText = (event: ChangeEvent<HTMLInputElement>) => {
        
        if(searchTimeout){
            clearTimeout(searchTimeout);
        }
        
        setFilterText(event.currentTarget.value);
        

        setSearchTimeout(
            setTimeout(() => {
                const filterProduct = handleFilteringProduct(filterText);
                console.log(filterProduct);
                
                setSearchProducts(filterProduct);
            }, 500)
        )
    }

    const handleFilteringProduct = (searchtext : string) => {
        const compareSearch = new RegExp(searchtext, "i");
        
        return products.filter((product) => {
            return (
                compareSearch.test(product.title)
            )
        })
    }

   

  return (
    <>
    <div className='flex justify-between'>
        <h2 className='section-text'>Trending</h2>
        <div>
            <form>
                <input type="text" value={filterText}  onChange={handleFilterText} placeholder="Search product" className='p-3 m-w[200px] border border-gray-400 text-gray-500 focus:outline-none text-base rounded-lg shadow-xs'></input>
            </form>
        </div>
    </div>
    <div className="flex flex-wrap gap-x-8 gap-y-16">
        {filterText ? 
            (<ProductList data={searchProducts} /> ):
            (<ProductList data={products} />)
        }
    </div>
    </>
    )
}

export default Trend