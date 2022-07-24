/*
  Warnings:

  - Added the required column `teamid` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "teamid" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teamid" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
