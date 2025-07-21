-- CreateEnum for service status
CREATE TYPE "service_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- Add status column with default ACTIVE
ALTER TABLE "services" ADD COLUMN "status" "service_status" NOT NULL DEFAULT 'ACTIVE';

-- Migrate existing data: is_active=true -> ACTIVE, is_active=false -> INACTIVE
UPDATE "services" SET "status" = CASE 
  WHEN "is_active" = true THEN 'ACTIVE'::service_status
  ELSE 'INACTIVE'::service_status
END;

-- Remove old is_active column
ALTER TABLE "services" DROP COLUMN "is_active";
