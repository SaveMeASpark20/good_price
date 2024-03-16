import Product from "@/lib/model/product.model";
import { connectToDB } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request : Request) {
  try {
    connectToDB();

    const products = await Product.find({});
    
    if(!products) throw new Error("No Product found");

    const updatedProducts = await Promise.all(products.map(async (currentProduct) => { // from database

      const scrapedProduct = await scrapeAmazonProduct(currentProduct.url); //from scrape

      if(!scrapedProduct) return;

      const updatedPriceHistory = [
        ...currentProduct.priceHistory,
        {
          price: scrapedProduct.currentPrice
        },
      ];

      const product = {
        ...scrapedProduct,
        priceHistory : updatedPriceHistory,
        lowestPrice : getLowestPrice(updatedPriceHistory),
        highestPrice : getHighestPrice(updatedPriceHistory),
        averagePrice : getAveragePrice(updatedPriceHistory),
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        {url : product.url, },
        product
      )

      const emailNotifType = getEmailNotifType(scrapedProduct, currentProduct)

      if(emailNotifType && updatedProduct.users.length > 0){
        const productInfo = {
          title: updatedProduct.title,
          url: updatedProduct.url,
        };

        const emailContent = await generateEmailBody(productInfo, emailNotifType);
        const usersEmail = updatedProduct.user.map((user: any )=> user.email)
        await sendEmail(emailContent, usersEmail)
        
      }
      return updatedProduct;

    }));

    return NextResponse.json({
      message: 'ok',
      data : updatedProducts,
    })


  } catch (error) {
    throw new Error(`There's an Error ${error}`);
  }
}