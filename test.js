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
const topicName = "Disney";
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
  "Fun day with Mickey",
  "Riding Space Mountain",
  "Exploring Magic Kingdom",
  "Disney World fireworks",
  "Epcot food festival",
  "Meeting Goofy and friends",
  "Magical Disney moments",
  "Disney park hopping",
  "Staying at Disney resorts",
  "Dining at Cinderella's Castle",
  "Splash Mountain adventure",
  "Collecting Disney pins",
  "Watching the parade at Disney",
  "Family trip to Disney World",
  "Buying Mickey ears",
  "Animal Kingdom safari",
  "Enjoying Disney snacks",
  "Riding the monorail",
  "Disney character dining",
  "Frozen Ever After ride",
  "Taking photos with Pluto",
  "Soarin' over the world",
  "Finding Hidden Mickeys",
  "Star Wars: Galaxy's Edge",
  "Pirates of the Caribbean ride",
  "Wishing upon a star at Disney",
  "Laughing with Chip and Dale",
  "Magic Kingdom fireworks",
  "Walking down Main Street, U.S.A.",
  "Toy Story Land adventures",
  "Exploring Tomorrowland",
  "Meeting Elsa and Anna",
  "Riding It's a Small World",
  "Getting a Dole Whip",
  "Adventureland jungle cruise",
  "Riding the Seven Dwarfs Mine Train",
  "Happily Ever After fireworks show",
  "Disney World annual passes",
  "Epcot's World Showcase",
  "Disney World souvenir shopping",
  "Peter Pan's Flight ride",
  "Disney Genie+ planning",
  "Enjoying Disney churros",
  "Hollywood Studios excitement",
  "Buzz Lightyear's Space Ranger Spin",
  "Meeting the Disney villains",
  "Disney World magical memories",
  "Seeing Mickey's PhilharMagic",
  "Riding Big Thunder Mountain Railroad",
  "Meeting Disney princesses",
  "Rafiki's Planet Watch",
  "Celebrating birthdays at Disney",
  "Sipping LeFou's Brew",
  "The Haunted Mansion thrills",
  "Exploring Disney Springs",
  "Staying at the Polynesian Resort",
  "Dining at Be Our Guest",
  "Mickey's Not-So-Scary Halloween Party",
  "Celebrating Christmas at Disney",
  "Living the Disney magic",
  "Meeting Winnie the Pooh",
  "Finding Tinker Bell's treasures",
  "Stitch's Great Escape fun",
  "Riding Dumbo the Flying Elephant",
  "Walking through Liberty Square",
  "Disneyland Paris comparisons",
  "Visiting the Tree of Life",
  "Guardians of the Galaxy ride",
  "Epcot Flower & Garden Festival",
  "Riding Test Track at Epcot",
  "Trying the gray stuff, it's delicious",
  "Animal Kingdom evening light show",
  "Kilimanjaro Safaris adventure",
  "Exploring Frontierland",
  "Mickey Mouse meet-and-greet",
  "Disney photopass magic",
  "Buying Disney plush toys",
  "Spaceship Earth exploration",
  "Building a droid at Galaxy's Edge",
  "Sipping around the world at Epcot",
  "Enjoying Mickey waffles",
  "Disney skyliner ride",
  "Fantasmic night show",
  "Riding the Tower of Terror",
  "Celebrating Disney anniversaries",
  "Shopping at the Emporium",
  "Enjoying a turkey leg at Disney",
  "Singing along with Frozen",
  "Building a lightsaber at Savi's Workshop",
  "Laughing at Monsters, Inc. Laugh Floor",
  "Taking a Disney cruise",
  "Enjoying Epcot's Candlelight Processional",
  "Visiting Pandora - The World of Avatar",
  "Riding Expedition Everest",
  "Relaxing at Blizzard Beach",
  "Getting autographs from Disney characters",
  "Exploring Disney World resorts",
  "Trying Mickey-shaped ice cream",
  "Planning a Disney vacation"
];

// First generate the topic embedding
let topicEmbedding;
try {
  topicEmbedding = await combineEmbeddings(existingEmbedding, existingCount, newPhrases);
  console.log("Combined Topic Embedding generated successfully");
  const dataObject = {
    topic: topicName,
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
