import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractPrice, extractDescription, extractReviewStar, extractAvailability,  } from "../utils";

export async function scrapeAmazonProduct(url: string){
  if(!url) return;

  //BrightData proxy config;

  const username = String(process.env.BRIGHT_DATA_USERNAME);

  const password = String(process.env.BRIGHT_DATA_PASSWORD);

  const port = 22225;

  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,  
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    
    const currency = extractCurrency($('.a-price-symbol'));

    const title = $('#productTitle').text().trim();
    
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay'),
      $('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay span'),
      $('.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay span[1]'),
      $('.a-price.aok-align-center .a-offscreen'),
      $('.a-section.a-spacing-none.aok-align-center.aok-relative .aok-offscreen')
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price'),
      $('.a-price.a-text-price span'),
      $('.a-price.a-text-price.a-size-base'),
      $('.a-section.a-spacing-small.aok-align-center .a-price.a-text-price'),
      $('.a-price.a-text-price .a-offscreen'),

    )
    
    const isOutOfStock = extractAvailability($('#availability span') || 
      $('.a-size-medium.a-color-success') ||
      $('#outOfStock .a-box-inner .a-color-price.a-text-bold')
      );
    
      
      console.log(isOutOfStock);

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '';


    const imageUrls = Object.keys(JSON.parse(images));

    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const stars = extractReviewStar(
      $('.a-declarative a .a-size-base.a-color-base') || 
      $('.reviewCountTextLinkedHistogram.noUnderline .a-declarative .a-size-base.a-color-base')
    ) 
    
    const reviewsCount = $('.a-declarative #acrCustomerReviewLink #acrCustomerReviewText').text().trim().split(" ")[0];
    console.log(reviewsCount);


    const description = extractDescription($);
    
    const data = {
      url,
      currency: currency || '$',
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount : Number(reviewsCount.replace(",","")),
      star: Number(stars),
      isOutOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }
    
    return data;

  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`)
  }
}


// curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_a1691ac8-zone-unblocker:3w3z1bfcth28 -k https://lumtest.com/myip.json