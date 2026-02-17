
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createClient } from "@sanity/client";

// Re-initialize for script context
const sanity = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || "production",
    token: process.env.SANITY_API_TOKEN,
    apiVersion: "2023-05-03",
    useCdn: false,
});

export default async function forceSanitySync({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const productModule = container.resolve(Modules.PRODUCT);

    logger.info("Starting FORCE Sanity sync...");

    try {
        const [products, count] = await productModule.listAndCountProducts({}, { take: 1000 });
        logger.info(`Found ${count} products in Medusa.`);

        for (const product of products) {
            logger.info(`Syncing product: ${product.title} (${product.id})`);

            const sanityDoc = {
                _type: "product",
                _id: product.id,
                title: product.title,
                medusaId: product.id,
                handle: {
                    _type: "slug",
                    current: product.handle
                },
                subtitle: product.subtitle || "",
                description: product.description || "",
            };

            await sanity.createOrReplace(sanityDoc);
            logger.info(`✅ Synced: ${product.title}`);
        }

        logger.info("FORCE Sanity sync complete!");
    } catch (error) {
        logger.error("Error during force sync:", error);
    }
}
