CREATE TABLE IF NOT EXISTS "models" (
	"model_id" INTEGER NOT NULL UNIQUE,
	"model_name" VARCHAR,
	"huggingface_name" VARCHAR,
	"quantized" BOOLEAN DEFAULT true,
	PRIMARY KEY("model_id"),
	FOREIGN KEY ("model_id") REFERENCES "calculated_topics"("model_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "phrases" (
	"phrase_id" INTEGER NOT NULL UNIQUE,
	"topic_id" INTEGER NOT NULL,
	"phrase" TEXT,
	PRIMARY KEY("phrase_id")	
);

CREATE TABLE IF NOT EXISTS "topics" (
	"topic_id" INTEGER NOT NULL UNIQUE,
	"topic_name" VARCHAR,
	PRIMARY KEY("topic_id"),
	FOREIGN KEY ("topic_id") REFERENCES "phrases"("topic_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS "calculated_topics" (
	"calculated_topic_id" INTEGER NOT NULL UNIQUE,
	"model_id" INTEGER NOT NULL,
	"topic_id" INTEGER NOT NULL,
	"calculated_weights" TEXT,
	PRIMARY KEY("calculated_topic_id")	
);

CREATE TABLE IF NOT EXISTS "tracked_calculations" (
	"calculated_topic_id" INTEGER NOT NULL,
	"phrase_id" INTEGER NOT NULL,
	"embedding" TEXT,
	PRIMARY KEY("calculated_topic_id", "phrase_id"),
	FOREIGN KEY ("calculated_topic_id") REFERENCES "calculated_topics"("calculated_topic_id")
	ON UPDATE NO ACTION ON DELETE NO ACTION
);
