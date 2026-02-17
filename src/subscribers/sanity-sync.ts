
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { createClient } from "@sanity/client";

// Initialize Sanity Client
const sanity = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || "production",
    token: process.env.SANITY_API_TOKEN,
    apiVersion: "2023-05-03",
    useCdn: false,
});

export default async function productSanitySync({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const productService = container.resolve("product");
    const logger = container.resolve("logger");

    try {
        const productId = data.id;
        const product = await productService.retrieveProduct(productId);

        logger.info(`Syncing product ${product.title} to Sanity...`);

        // Map Medusa Product to Sanity Schema
        const sanityDoc = {
            _type: "product",
            _id: product.id, // Use Medusa ID as Sanity ID for easy reference
            title: product.title,
            medusaId: product.id,
            handle: { current: product.handle },
            subtitle: product.subtitle,
            description: product.description,
            // Default placeholder for images if needed, or map them if available
            // images: product.images?.map(img => ...) 
        };

        // Create or Replace in Sanity
        await sanity.createOrReplace(sanityDoc);

        logger.info(`✅ Successfully synced product '${product.title}' to Sanity!`);

    } catch (error) {
        logger.error(`❌ Failed to sync product to Sanity: ${error.message}`);
    }
}

export const config: SubscriberConfig = {
    event: ["product.created", "product.updated"],
};
