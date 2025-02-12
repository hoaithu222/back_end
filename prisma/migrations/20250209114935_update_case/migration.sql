-- DropForeignKey
ALTER TABLE "attribute_values" DROP CONSTRAINT "attribute_values_type_id_fkey";

-- DropForeignKey
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_attribute_value_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "attribute_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
