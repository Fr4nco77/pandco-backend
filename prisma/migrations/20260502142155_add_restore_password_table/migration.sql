-- CreateTable
CREATE TABLE "restore_passwords" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "restore_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restore_passwords_token_key" ON "restore_passwords"("token");

-- CreateIndex
CREATE UNIQUE INDEX "restore_passwords_user_id_key" ON "restore_passwords"("user_id");

-- AddForeignKey
ALTER TABLE "restore_passwords" ADD CONSTRAINT "restore_passwords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
