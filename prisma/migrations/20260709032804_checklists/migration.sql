-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChecklistTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ChecklistTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChecklistAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistAssignment_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistItemCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChecklistItemCompletion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ChecklistAssignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistItemCompletion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChecklistTemplateItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChecklistTemplate_createdById_idx" ON "ChecklistTemplate"("createdById");

-- CreateIndex
CREATE INDEX "ChecklistTemplateItem_templateId_idx" ON "ChecklistTemplateItem"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistTemplateItem_templateId_order_key" ON "ChecklistTemplateItem"("templateId", "order");

-- CreateIndex
CREATE INDEX "ChecklistAssignment_recruitId_idx" ON "ChecklistAssignment"("recruitId");

-- CreateIndex
CREATE INDEX "ChecklistAssignment_templateId_idx" ON "ChecklistAssignment"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistAssignment_templateId_recruitId_key" ON "ChecklistAssignment"("templateId", "recruitId");

-- CreateIndex
CREATE INDEX "ChecklistItemCompletion_assignmentId_idx" ON "ChecklistItemCompletion"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItemCompletion_assignmentId_itemId_key" ON "ChecklistItemCompletion"("assignmentId", "itemId");
