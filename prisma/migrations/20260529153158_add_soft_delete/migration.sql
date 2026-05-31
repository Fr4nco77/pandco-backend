/*
  Warnings:

  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - Added the required column `type_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_type_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "type",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "type_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
