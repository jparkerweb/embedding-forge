// -------------------------------------------------
// -- import environment variables from .env file --
// -------------------------------------------------
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import dedent from 'dedent';
import express from 'express';
import { fileURLToPath } from 'url';
import {
    dropTables,
    getAllModels, listModels, addModel, updateModel, deleteModel,
    listTopics, addTopic, updateTopic, deleteTopic,
    listPhrases, addPhrase, updatePhrase, deletePhrase
} from './modules/db.js';

const app = express();
const port = process.env.SERVER_PORT;

// Define the directory where the server.js file is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware to include the navigation bar in all pages
const navPath = path.join(__dirname, 'public', '/nav.html');
let navContent = fs.readFileSync(navPath, 'utf8');
app.use((req, res, next) => {
    res.locals.nav = navContent;
    next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JS) from a specified directory
app.use(express.static(path.join(__dirname, 'public')));


// ---------------------
// -- web page routes --
// ---------------------
// ROOT
app.get('/', (req, res) => {
    console.log("Serving home page");
    const pagePath = path.join(__dirname, 'public', 'home.html');
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace('<!--nav-->', res.locals.nav);
    res.send(pageContent);
});
// Models
app.get('/models', (req, res) => {
    console.log("Serving models page");
    const pagePath = path.join(__dirname, 'public', 'models.html');
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace('<!--nav-->', res.locals.nav);
    res.send(pageContent);
});
// Topics
app.get('/topics', (req, res) => {
    console.log("Serving topics page");
    const pagePath = path.join(__dirname, 'public', 'topics.html');
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace('<!--nav-->', res.locals.nav);
    res.send(pageContent);
});
// Phrases
app.get('/phrases', (req, res) => {
    console.log("Serving phrases page");
    const pagePath = path.join(__dirname, 'public', 'phrases.html');
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace('<!--nav-->', res.locals.nav);
    res.send(pageContent);
});


// ----------------
// -- API routes --
// ----------------
// -- list models (paged) --
app.get('/admin/models', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const { models, total } = await listModels(page, limit);
        res.send({ models, total });
    } catch (err) {
        res.status(500).send(err);
    }
});
// -- add model --
app.post('/admin/models', async (req, res) => {
    const { model_name, huggingface_name, quantized } = req.body;
    try {
        let feedback = await addModel(model_name, huggingface_name, quantized);
        res.status(200).json({ feedback: feedback });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
// -- update model --
app.put('/admin/models/:model_id', async (req, res) => {
    const { model_id } = req.params;
    const { model_name, huggingface_name, quantized } = req.body;
    try {
        const feedback = await updateModel(model_id, model_name, huggingface_name, quantized);
        res.status(200).json({ feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -- delete model --
app.delete('/admin/models/:model_id', async (req, res) => {
    const { model_id } = req.params;
    try {
        await deleteModel(model_id);
        res.status(200).json({ message: 'Model deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
// -- list topics (paged) --
app.get('/admin/topics', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const { topics, total } = await listTopics(page, limit);
        res.send({ topics, total });
    } catch (err) {
        res.status(500).send(err);
    }
});
// -- add topic --
app.post('/admin/topics', async (req, res) => {
    const { topic_name } = req.body;
    try {
        let feedback = await addTopic(topic_name);
        res.status(200).json({ feedback: feedback });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
// -- update topic --
app.put('/admin/topics/:topic_id', async (req, res) => {
    const { topic_id } = req.params;
    const { topic_name } = req.body;
    try {
        const feedback = await updateTopic(topic_id, topic_name);
        res.status(200).json({ feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -- delete topic --
app.delete('/admin/topics/:topic_id', async (req, res) => {
    const { topic_id } = req.params;
    try {
        await deleteTopic(topic_id);
        res.status(200).json({ message: 'Topic deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
// -- list phrases (paged) --
app.get('/admin/phrases', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const { phrases, total } = await listPhrases(page, limit);
        res.send({ phrases, total });
    } catch (err) {
        res.status(500).send(err);
    }
});

// -- add phrase --
app.post('/admin/phrases', async (req, res) => {
    const { phrase, topic_ids } = req.body;
    try {
        let feedback = await addPhrase(phrase, topic_ids);
        res.status(200).json({ feedback: feedback });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// -- update phrase --
app.put('/admin/phrases/:phrase_id', async (req, res) => {
    const { phrase_id } = req.params;
    const { phrase, topic_ids } = req.body;
    try {
        const feedback = await updatePhrase(phrase_id, phrase, topic_ids);
        res.status(200).json({ feedback });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -- delete phrase --
app.delete('/admin/phrases/:phrase_id', async (req, res) => {
    const { phrase_id } = req.params;
    try {
        await deletePhrase(phrase_id);
        res.status(200).json({ message: 'Phrase deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});
// *********************


// Start the server on the specified port
app.listen(port, () => {
    setTimeout(() => {
        console.log('\n\n\n');
        console.log(`Server running on port ${port}`);
        console.log(`http://localhost:${port}`);
        console.log('\n\n');
    }, 3000);
});
