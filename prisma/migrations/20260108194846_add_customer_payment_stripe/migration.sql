ALTER TABLE "CustomerPayment"
ADD COLUMN "stripe_customer_id" TEXT,
ADD COLUMN "stripe_payment_method_id" TEXT,
ADD COLUMN "stripe_setup_intent_id" TEXT;
