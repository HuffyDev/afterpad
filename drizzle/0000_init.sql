CREATE TABLE "launches" (
	"launch_id" text PRIMARY KEY NOT NULL,
	"mint" text NOT NULL,
	"name" text NOT NULL,
	"ticker" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_uri" text,
	"banner_uri" text,
	"metadata_uri" text NOT NULL,
	"website" text,
	"twitter" text,
	"telegram" text,
	"creator" text NOT NULL,
	"dev_buy_sol" double precision DEFAULT 0 NOT NULL,
	"signature" text,
	"status" text DEFAULT 'building' NOT NULL,
	"simulated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"x_handle" text NOT NULL,
	"wallet" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "launches_mint_idx" ON "launches" USING btree ("mint");--> statement-breakpoint
CREATE INDEX "launches_created_idx" ON "launches" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_x_idx" ON "waitlist" USING btree ("x_handle");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_wallet_idx" ON "waitlist" USING btree ("wallet");