import sqlite3 from 'sqlite3';
import { seedEmbeddingModels } from '../data/seed-embeddingModels.js';

// --------------------------------------------
// -- create inital DB connection and tables --
// --------------------------------------------
const initializeDatabase = () => {
    let db = new sqlite3.Database('./data/embedding-forge.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
            return;
        } else {
            console.log('Connected to the SQLite database.');

            // Use serialize to ensure that database operations are executed in sequence
            db.serialize(() => {
                // -------------------------
                // -- create models table --
                // -------------------------
                db.run(`CREATE TABLE IF NOT EXISTS "models" (
                    "model_id" INTEGER NOT NULL UNIQUE,
                    "model_name" VARCHAR,
                    "huggingface_name" VARCHAR,
                    "quantized" BOOLEAN DEFAULT true,
                    PRIMARY KEY("model_id"),
                    FOREIGN KEY ("model_id") REFERENCES "calculated_topics"("model_id")
                    ON UPDATE NO ACTION ON DELETE NO ACTION
                )`, (err) => {
                    if (err) {
                        console.error("Error creating models table", err.message);
                    }
                });
                
                // --------------------------
                // -- create phrases table --
                // --------------------------
                db.run(`CREATE TABLE IF NOT EXISTS "phrases" (
                    "phrase_id" INTEGER NOT NULL UNIQUE,
                    "topic_id" INTEGER NOT NULL,
                    "phrase" TEXT,
                    PRIMARY KEY("phrase_id")	
                )`, (err) => {
                    if (err) {
                        console.error("Error creating phrases table", err.message);
                    }
                });
                
                // -------------------------
                // -- create topics table --
                // -------------------------
                db.run(`CREATE TABLE IF NOT EXISTS "topics" (
                    "topic_id" INTEGER NOT NULL UNIQUE,
                    "topic_name" VARCHAR,
                    PRIMARY KEY("topic_id"),
                    FOREIGN KEY ("topic_id") REFERENCES "phrases"("topic_id")
                    ON UPDATE NO ACTION ON DELETE NO ACTION
                )`, (err) => {
                    if (err) {
                        console.error("Error creating topics table", err.message);
                    }
                });
                
                // ------------------------------------
                // -- create calculated_topics table --
                // ------------------------------------
                db.run(`CREATE TABLE IF NOT EXISTS "calculated_topics" (
                    "calculated_topic_id" INTEGER NOT NULL UNIQUE,
                    "model_id" INTEGER NOT NULL,
                    "topic_id" INTEGER NOT NULL,
                    "calculated_weights" TEXT,
                    PRIMARY KEY("calculated_topic_id")	
                )`, (err) => {
                    if (err) {
                        console.error("Error creating calculated_topics table", err.message);
                    }
                });
                
                // ---------------------------------------
                // -- create tracked_calculations table --
                // ---------------------------------------
                db.run(`CREATE TABLE IF NOT EXISTS "tracked_calculations" (
                    "calculated_topic_id" INTEGER NOT NULL,
                    "phrase_id" INTEGER NOT NULL,
                    "embedding" TEXT,
                    PRIMARY KEY("calculated_topic_id", "phrase_id"),
                    FOREIGN KEY ("calculated_topic_id") REFERENCES "calculated_topics"("calculated_topic_id")
                    ON UPDATE NO ACTION ON DELETE NO ACTION
                )`, (err) => {
                    if (err) {
                        console.error("Error creating tracked_calculations table", err.message);
                    }
                });

                setTimeout(() => {
                    console.log("seed data initialized...");
                }, 500);

                // -----------------------------------------------------------------------------------------
                // -- if models table is empty, loop through data/seed-embeddingModels.js and insert each --
                // -----------------------------------------------------------------------------------------
                db.all('SELECT model_id FROM models', [], (err, rows) => {
                    if (err) {
                        console.error("Error selecting from models table", err.message);
                    } else if (rows.length === 0) {
                        // Use serialize to ensure that database operations are executed in sequence
                        db.serialize(() => {
                            seedEmbeddingModels.forEach((model) => {
                                const insert = 'INSERT INTO models (model_name, huggingface_name, quantized) VALUES (?, ?, ?)';
                                db.run(insert, [model.model, model.huggingFaceName, model.quantized], function(err) {
                                    if (err) {
                                        console.error("Error inserting into models table", err);
                                    } else {
                                        console.log(`A model has been inserted with rowid ${this.lastID}`);
                                    }
                                });
                            });
                        });
                    }
                });
            });
        }
    });

    return db;
};



// ----------------------
// -- get all models --
// ----------------------
export function getAllModels() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM models';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err.message);
            } else {
                resolve(rows);
            }
        });
    });
}
// -----------------
// -- list models --
// -----------------
export function listModels(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM models LIMIT ? OFFSET ?';
        const countSql = 'SELECT COUNT(*) AS total FROM models';

        db.get(countSql, [], (err, countResult) => {
            if (err) {
                reject(err.message);
            } else {
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve({ 
                            models: rows,
                            total: countResult.total
                        });
                    }
                });
            }
        });
    });
}
// -----------------------------------------
// -- add a new model to the models table --
// -----------------------------------------
export function addModel(model_name, huggingface_name, quantized) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO models (model_name, huggingface_name, quantized) VALUES (?, ?, ?)';
        db.run(sql, [model_name, huggingface_name, quantized], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`A row has been inserted with rowid ${this.lastID}`);
            }
        });
    });
}
// ----------------------------------------
// -- update a model in the models table --
// ----------------------------------------
export function updateModel(model_id, model_name, huggingface_name, quantized) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE models SET model_name = ?, huggingface_name = ?, quantized = ? WHERE model_id = ?';
        db.run(sql, [model_name, huggingface_name, quantized, model_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Model updated with model_id: ${model_id}`);
            }
        });
    });
}
// ------------------------------------------
// -- delete a model from the models table --
// ------------------------------------------
export function deleteModel(model_id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM models WHERE model_id = ?';
        db.run(sql, [model_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Row(s) deleted: ${this.changes}`);
            }
        });
    });
}


// ---------------------
// -- drop all tables --
// ---------------------
export async function dropTables() {
    return new Promise((resolve, reject) => {
        const sql = `
            DROP TABLE IF EXISTS models;
            DROP TABLE IF EXISTS phrases;
            DROP TABLE IF EXISTS topics;
            DROP TABLE IF EXISTS calculated_topics;
            DROP TABLE IF EXISTS tracked_calculations;
        `;
        db.exec(sql, function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve('All tables have been dropped.');
            }
        });
    });
}


// < ----------------------------------- >
// < ----------------------------------- >
// < ----------------------------------- >

let db = initializeDatabase();

export const resetDatabase = () => {
    db.close();  // Close the existing connection
    db = initializeDatabase();  // Reinitialize the database
};

export default db;

// -----------------------
// -- list topics (paged) --
// -----------------------
export function listTopics(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM topics LIMIT ? OFFSET ?';
        const countSql = 'SELECT COUNT(*) AS total FROM topics';

        db.get(countSql, [], (err, countResult) => {
            if (err) {
                reject(err.message);
            } else {
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve({ 
                            topics: rows,
                            total: countResult.total
                        });
                    }
                });
            }
        });
    });
}

// -----------------------
// -- add a new topic --
// -----------------------
export function addTopic(topic_name) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO topics (topic_name) VALUES (?)';
        db.run(sql, [topic_name], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`A new topic has been added with ID ${this.lastID}`);
            }
        });
    });
}

// -----------------------
// -- update a topic --
// -----------------------
export function updateTopic(topic_id, topic_name) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE topics SET topic_name = ? WHERE topic_id = ?';
        db.run(sql, [topic_name, topic_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Topic updated with ID: ${topic_id}`);
            }
        });
    });
}

// -----------------------
// -- delete a topic --
// -----------------------
export function deleteTopic(topic_id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM topics WHERE topic_id = ?';
        db.run(sql, [topic_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Topic deleted with ID: ${topic_id}`);
            }
        });
    });
}

// -----------------------
// -- list phrases (paged) --
// -----------------------
export function listPhrases(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT p.phrase_id, p.phrase
            FROM phrases p
            LIMIT ? OFFSET ?
        `;
        const countSql = 'SELECT COUNT(*) AS total FROM phrases';

        db.get(countSql, [], (err, countResult) => {
            if (err) {
                reject(err.message);
            } else {
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) {
                        reject(err.message);
                    } else {
                        resolve({ 
                            phrases: rows,
                            total: countResult.total
                        });
                    }
                });
            }
        });
    });
}

// -----------------------
// -- add a new phrase --
// -----------------------
export function addPhrase(phrase, topic_ids) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO phrases (phrase) VALUES (?)';
        db.run(sql, [phrase], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`A new phrase has been added with ID ${this.lastID}`);
            }
        });
    });
}

// -----------------------
// -- update a phrase --
// -----------------------
export function updatePhrase(phrase_id, phrase, topic_ids) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE phrases SET phrase = ? WHERE phrase_id = ?';
        db.run(sql, [phrase, phrase_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Phrase updated with ID: ${phrase_id}`);
            }
        });
    });
}

// -----------------------
// -- delete a phrase --
// -----------------------
export function deletePhrase(phrase_id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM phrases WHERE phrase_id = ?';
        db.run(sql, [phrase_id], function(err) {
            if (err) {
                reject(err.message);
            } else {
                resolve(`Phrase deleted with ID: ${phrase_id}`);
            }
        });
    });
}
