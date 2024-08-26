import { NextResponse } from "next/server";
import {
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  getEmailNotifType,
} from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/model/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Connect to the database
    await connectToDB();

    // Fetch all products from the database
    const products = await Product.find({});

    if (!products || products.length === 0) {
      throw new Error("No products fetched");
    }

    // Process each product
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        try {
          // Scrape product data
          const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

          if (!scrapedProduct) {
            console.error(
              `Failed to scrape product at URL: ${currentProduct.url}`
            );
            return null;
          }

          // Update product price history
          const updatedPriceHistory = [
            ...currentProduct.priceHistory,
            { price: scrapedProduct.currentPrice },
          ];

          // Prepare the updated product data
          const product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          };

          // Update the product in the database
          const updatedProduct = await Product.findOneAndUpdate(
            { url: product.url },
            product,
            { new: true } // Return the updated document
          );

          if (!updatedProduct) {
            console.error(
              `Failed to update product in DB: ${currentProduct.url}`
            );
            return null;
          }

          // Determine if email notification is needed
          const emailNotifType = getEmailNotifType(
            scrapedProduct,
            currentProduct
          );

          if (emailNotifType && updatedProduct.users.length > 0) {
            const productInfo = {
              title: updatedProduct.title,
              url: updatedProduct.url,
            };

            // Generate email content
            const emailContent = await generateEmailBody(
              productInfo,
              emailNotifType
            );

            // Get user emails
            const userEmails = updatedProduct.users.map(
              (user: any) => user.email
            );

            // Send email notification
            await sendEmail(emailContent, userEmails);
          }

          return updatedProduct;
        } catch (productError: any) {
          console.error(
            `Error processing product ${currentProduct.url}: ${productError.message}`
          );
          return null;
        }
      })
    );

    // Filter out any null values in updatedProducts
    const successfulUpdates = updatedProducts.filter(
      (product) => product !== null
    );

    return NextResponse.json({
      message: "Ok",
      data: successfulUpdates,
    });
  } catch (error: any) {
    console.error(`Failed to get all products: ${error.message}`);
    return NextResponse.json(
      {
        message: `Failed to get all products: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
