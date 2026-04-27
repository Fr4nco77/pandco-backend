/*
  Warnings:

  - A unique constraint covering the columns `[user_id,variant_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,product_id]` on the table `wishlists` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cart_items_user_id_variant_id_key" ON "cart_items"("user_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_product_id_key" ON "wishlists"("user_id", "product_id");
