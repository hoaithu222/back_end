-- CreateTable
CREATE TABLE "category_attribute_types" (
    "category_id" INTEGER NOT NULL,
    "attribute_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_attribute_types_pkey" PRIMARY KEY ("category_id","attribute_type_id")
);

-- AddForeignKey
ALTER TABLE "category_attribute_types" ADD CONSTRAINT "category_attribute_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute_types" ADD CONSTRAINT "category_attribute_types_attribute_type_id_fkey" FOREIGN KEY ("attribute_type_id") REFERENCES "attribute_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
