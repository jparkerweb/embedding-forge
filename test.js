// ---------------------
// -- library imports --
// ---------------------
import { combineEmbeddings } from "./modules/embedding.js";
import { cosineSimilarity } from "./modules/similarity.js";
import fs from 'fs';

// Function to append combined embeddings to a file
function appendToFile(data) {
  fs.appendFile('test.txt', data + '\n', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Successfully appended to file');
    }
  });
}

// Example usage
const existingEmbedding = null;  // No existing embedding
const existingCount = 0;         // No previous messages
const newPhrases = [
  "Saw Mickey at Disney today",
  "Just met Mickey Mouse",
  "Visited Disney World",
  "Had fun at Magic Kingdom",
  "Met Disney characters",
  "Taking pictures with Mickey",
  "Went to see the Disney castle",
  "Hanging out with Disney friends",
  "Disney World visit today",
  "Meeting Mickey and friends",
  "Disney park fun",
  "Seeing characters at Disney",
  "Disney World adventures today",
  "Mickey Mouse meet and greet",
  "Walking around Magic Kingdom",
  "Disney character photos",
  "Spending time at Disney World",
  "Disney park visit",
  "Meeting Disney princesses",
  "Fun day with Mickey"
];

// First generate the topic embedding
let topicEmbedding;
try {
  topicEmbedding = await combineEmbeddings(existingEmbedding, existingCount, newPhrases);
  console.log("Combined Topic Embedding generated successfully");
  const dataObject = {
    numPhrases: newPhrases.length,
    embedding: Array.isArray(topicEmbedding) ? topicEmbedding : Object.values(topicEmbedding)
  };
  const dataString = JSON.stringify(dataObject, null, 2); // Convert object to JSON string
  appendToFile(dataString);
} catch (error) {
  console.error("Error generating topic embedding:", error);
  process.exit(1);
}

// Test similarity with a test phrase
const similarityTestPhrase = "I went to see Mickey today";

try {
  // Generate embedding for test phrase
  const testPhraseEmbedding = await combineEmbeddings(null, 0, [similarityTestPhrase]);
  
  // Calculate similarity
  const similarity = cosineSimilarity(testPhraseEmbedding, topicEmbedding);
  console.log("\nSimilarity Test Results:");
  console.log(`Test Phrase: "${similarityTestPhrase}"`);
  console.log(`Similarity Score: ${similarity.toFixed(4)}`);
} catch (error) {
  console.error("Error in similarity test:", error);
}
