DO $$ BEGIN
 CREATE TYPE "public"."contact_intent" AS ENUM('achat', 'vente');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."dpe_class" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_status" AS ENUM('a_vendre', 'vendu', 'sous_compromis');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."property_type" AS ENUM('maison', 'appartement', 'terrain', 'local', 'immeuble', 'cave');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alert_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"type" text,
	"city" text NOT NULL,
	"price_max" integer,
	"rooms" integer,
	"beds" integer,
	"area_min" integer,
	"duration" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intent" "contact_intent" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "property_type" NOT NULL,
	"title" text NOT NULL,
	"city" text NOT NULL,
	"price" integer NOT NULL,
	"status" "property_status" DEFAULT 'a_vendre' NOT NULL,
	"exclusive" boolean DEFAULT false NOT NULL,
	"description" text,
	"features" text[] DEFAULT '{}' NOT NULL,
	"near" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"beds" integer,
	"rooms" integer,
	"area" integer,
	"land" integer,
	"year" integer,
	"heat" text,
	"dpe_value" integer,
	"dpe_class" "dpe_class",
	"ges_value" integer,
	"ges_class" "dpe_class",
	"energy_cost" text,
	"has_video" boolean DEFAULT false NOT NULL,
	"has_tour" boolean DEFAULT false NOT NULL,
	"agent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "property_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"photo_url" text,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_team_members_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_photos" ADD CONSTRAINT "property_photos_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
