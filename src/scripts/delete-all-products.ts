
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function deleteAllProducts({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const productModule = container.resolve(Modules.PRODUCT);

    logger.info("Starting DELETION of all products...");

    try {
        const [products] = await productModule.listAndCountProducts({}, { take: 1000 });

        if (products.length === 0) {
            logger.info("No products found to delete.");
            return;
        }

        const productIds = products.map(p => p.id);
        await productModule.softDeleteProducts(productIds);

        logger.info(`✅ Successfully deleted ${products.length} products.`);
    } catch (error) {
        logger.error("Error during product deletion:", error);
    }
}
