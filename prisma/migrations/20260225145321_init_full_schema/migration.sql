-- ----------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------

CREATE TYPE "ProductStatus" AS ENUM ('active', 'draft', 'archived');
CREATE TYPE "UserRole" AS ENUM ('admin', 'customer');

-- ----------------------------------------------------------------
-- Category — already exists, just add new columns
-- ----------------------------------------------------------------

ALTER TABLE "Category"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------
-- Product
-- ----------------------------------------------------------------

CREATE TABLE "Product" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "description" TEXT,
    "price"       DECIMAL(10,2) NOT NULL,
    "stock"       INTEGER NOT NULL DEFAULT 0,
    "status"      "ProductStatus" NOT NULL DEFAULT 'draft',
    "images"      TEXT[],
    "categoryId"  TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------
-- User
-- ----------------------------------------------------------------

CREATE TABLE "User" (
    "id"            TEXT NOT NULL,
    "name"          TEXT,
    "email"         TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image"         TEXT,
    "passwordHash"  TEXT,
    "role"          "UserRole" NOT NULL DEFAULT 'customer',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------
-- Account (Auth.js OAuth)
-- ----------------------------------------------------------------

CREATE TABLE "Account" (
    "id"                TEXT NOT NULL,
    "userId"            TEXT NOT NULL,
    "type"              TEXT NOT NULL,
    "provider"          TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------
-- Unique constraints
-- ----------------------------------------------------------------

CREATE UNIQUE INDEX "Category_name_key"      ON "Category"("name");
CREATE UNIQUE INDEX "Product_slug_key"       ON "Product"("slug");
CREATE UNIQUE INDEX "User_email_key"         ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key"
    ON "Account"("provider", "providerAccountId");

-- ----------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------

CREATE INDEX "Product_createdAt_idx"  ON "Product"("createdAt");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_status_idx"     ON "Product"("status");
CREATE INDEX "Product_stock_idx"      ON "Product"("stock");
CREATE INDEX "Product_slug_idx"       ON "Product"("slug");
CREATE INDEX "User_email_idx"         ON "User"("email");
CREATE INDEX "User_role_idx"          ON "User"("role");

-- ----------------------------------------------------------------
-- Foreign keys
-- ----------------------------------------------------------------

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;