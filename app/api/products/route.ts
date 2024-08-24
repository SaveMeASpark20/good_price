import Product from "@/lib/model/product.model";
import { connectToDB } from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDB();
    const products = await Product.find({});
    return Response.json(products);
  } catch (error: any) {
    console.log(error.message);
  }
}
