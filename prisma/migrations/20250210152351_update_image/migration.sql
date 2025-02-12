-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
