
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function triggerSanitySync({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const eventBus = container.resolve(Modules.EVENT_BUS);
    // In v2, product module is resolved differently sometimes, 
    // but usually Modules.PRODUCT string key works if registered.
    const productModule = container.resolve(Modules.PRODUCT);

    logger.info("Starting manual Sanity sync...");

    try {
        // List all products
        // Using default limit of 50, increase if needed
        const [products, count] = await productModule.listAndCountProducts({}, { take: 1000 });

        logger.info(`Found ${count} products in Medusa.`);

        if (products.length === 0) {
            logger.warn("No products found to sync!");
            return;
        }

        const messages = products.map((product) => ({
            name: "product.updated",
            data: { id: product.id },
        }));

        // Emit events in batch
        await eventBus.emit(messages);

        logger.info(`Dispatched ${messages.length} 'product.updated' events to Sanity.`);
        logger.info("Please verify in your Sanity Studio if documents appear.");
    } catch (error) {
        logger.error("Error triggering Sanity sync:", error);
    }
}
