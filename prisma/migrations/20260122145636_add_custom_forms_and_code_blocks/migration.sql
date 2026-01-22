-- CreateTable
CREATE TABLE "CustomCodeBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "pagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "position" TEXT NOT NULL DEFAULT 'BOTTOM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE TABLE "CustomForm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "formFields" TEXT NOT NULL,
    "submitUrl" TEXT,
    "pagePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "position" TEXT NOT NULL DEFAULT 'BOTTOM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE INDEX "CustomCodeBlock_pagePath_idx" ON "CustomCodeBlock"("pagePath");
CREATE INDEX "CustomCodeBlock_isActive_idx" ON "CustomCodeBlock"("isActive");
CREATE INDEX "CustomCodeBlock_order_idx" ON "CustomCodeBlock"("order");
CREATE INDEX "CustomForm_pagePath_idx" ON "CustomForm"("pagePath");
CREATE INDEX "CustomForm_isActive_idx" ON "CustomForm"("isActive");
CREATE INDEX "CustomForm_order_idx" ON "CustomForm"("order");
