import { Product } from "@/types";
import ProductCard from "./ProductCard";
import FilterSearchbar from "./FilterSearchbar";

interface Props {
  data: Product[];
}

const ProductList = ({ data }: Props) => {
  return (
    <div className="flex flex-wrap gap-7">
      {data.map((post) => (
        <ProductCard key={post._id} product={post} />
      ))}
    </div>
  );
};

const Trend = ({ data }: Props) => {
  let products = data;

  const filteredProduct = (filteredProduct: Product[]) => {
    products = filteredProduct;
  };
  return (
    <>
      <FilterSearchbar data={products} filteredProduct={filteredProduct} />
      <div className="flex flex-wrap gap-x-8 gap-y-16">
        <ProductList data={products} />
      </div>
    </>
  );
};

export default Trend;
