CREATE TABLE "make" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" integer PRIMARY KEY NOT NULL,
	"make_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"created_at" date DEFAULT now() NOT NULL,
	"updated_at" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_make_id_make_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."make"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "make_fk" FOREIGN KEY ("make_id") REFERENCES "public"."make"("id") ON DELETE cascade ON UPDATE no action;