import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "b88d1b44a934d35217899c6f7afdabc3";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "758db794de5220a089407cf30cfc761b";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "d13ab7320c877524383733acf1ff5aa817b73397d46751a4eff78f22fe61ceb9";
const R2_BUCKET = process.env.R2_BUCKET_NAME || "unicrm-storefronts";
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || "https://cdn.dfyunicrm.com";

export interface StoreCatalogProduct {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
  description?: string;
  imageUrl: string; // External CDN URL (Instagram, Shopify, Imgur)
  inStock?: boolean;
}

export interface StoreCatalog {
  slug: string;
  businessName: string;
  tagline?: string;
  phone: string; // WhatsApp number
  city?: string;
  category?: string;
  currency?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  products: StoreCatalogProduct[];
  updatedAt: string;
}

/**
 * Returns an S3 client configured for Cloudflare R2
 */
export function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Uploads a static store.json to Cloudflare R2
 * Accessible publicly at https://cdn.dfyunicrm.com/{slug}/store.json
 */
export async function publishStorefrontToR2(catalog: StoreCatalog): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const s3 = getR2Client();
    const key = `${catalog.slug}/store.json`;
    const body = JSON.stringify(catalog, null, 2);

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: "application/json",
        CacheControl: "public, max-age=60, s-maxage=300", // Edge cache 5 mins
      })
    );

    const publicUrl = `${R2_PUBLIC_DOMAIN}/${key}`;
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("[R2 Storefront] Upload error:", err);
    return { success: false, url: "", error: err.message };
  }
}

/**
 * Fetches store.json from Cloudflare R2
 */
export async function fetchStorefrontFromR2(slug: string): Promise<StoreCatalog | null> {
  try {
    // 1. Try public CDN fetch first (cached at Cloudflare edge)
    const cdnUrl = `${R2_PUBLIC_DOMAIN}/${slug}/store.json`;
    const res = await fetch(cdnUrl, { next: { revalidate: 60 } }).catch(() => null);
    if (res && res.ok) {
      return (await res.json()) as StoreCatalog;
    }

    // 2. Direct S3 fallback if CDN domain is still propagating
    const s3 = getR2Client();
    const getRes = await s3.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: `${slug}/store.json`,
      })
    );

    if (getRes.Body) {
      const text = await getRes.Body.transformToString();
      return JSON.parse(text) as StoreCatalog;
    }
  } catch {
    // Not found or error
  }
  return null;
}
