'use server'

import { revalidatePath } from "next/cache";
import Product from "../model/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl : string) {

  if(!productUrl) return;

  try {

    connectToDB(); // i think it will need to have a await

    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if(!scrapedProduct) return

    let product = scrapedProduct;

    //The point of this is to update the data of the database
    const existingProduct = await Product.findOne({url: scrapedProduct.url});
    console.log(existingProduct);

    if(existingProduct){
      const updatePriceHistory : any = [
        ...existingProduct.priceHistory,
        { price : scrapedProduct.currentPrice }
      ]

      product = {
        ...scrapedProduct,
        priceHistory: updatePriceHistory,
        lowestPrice: getLowestPrice(updatePriceHistory),
        highestPrice: getHighestPrice(updatePriceHistory),
        averagePrice: getAveragePrice(updatePriceHistory)
      }
    }

    const newProduct = await Product.findOneAndUpdate(
      {url: scrapedProduct.url}, 
      product,
      { upsert: true, new: true }
      );

    revalidatePath(`/products/${newProduct._id}`);  

  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`)
  }
}

export async function getProductById(productId: string){
  try{
    connectToDB();
    const product = await Product.findById({_id : productId});
  
    return product;

  }catch(error: any){
    console.log(error.message);
  }
}

export async function getAllProduct(){
  try{
    connectToDB();
    const products = await Product.find();
  
    return products;
  }catch(error: any) {
    console.log(error.message);
  }
}

export async function getSimilarProducts(productId: string){
  try{
    connectToDB();
    const currentProduct = await Product.findById({_id : productId});
    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id : {$ne : productId},
    }).limit(3)
    
    return similarProducts;

  }catch(error: any) {
    console.log(error.message);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string){
  try {
    // connectToDB();
    const product = await Product.findById(productId);

    if(!product) return

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({email: userEmail});

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [userEmail]);

    }

  } catch (error) {
    console.log(error);
  }
}