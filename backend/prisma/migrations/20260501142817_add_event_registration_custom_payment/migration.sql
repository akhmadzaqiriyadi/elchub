-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "customAnswers" JSONB,
ADD COLUMN     "paymentProofUrl" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "formSchema" JSONB,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" INTEGER;
