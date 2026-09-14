const fs = require('fs');

// The ultimate viral joke and quote list
const JOKE_PRIZES = [
  "a Rotten Fish 🐟", "a Lizard Tail 🦎", "an Expired Gala 🥖", 
  "a Mosquito's Left Wing 🦟", "a Used Matchstick 🪵", 
  "a NEPA Bill from 2014 🧾", "a Single Spaghetti Strand 🍝",
  "a Half-Chewed Pen Cover 🖊️", "1.0 CGPA 📉", "NOTHING FOR YOU TRY AGAIN", 
  "HALA MADRID ⚽", "bald head for you next year 👨🏾‍🦲", "look up and pray 🙏", 
  "the devil hides in plain sight 😈", "i am the punishment of god ⚡", 
  "if you had not commited great sins, god would not have sent a punishment like me upon you", 
  "you can get much farther with a kind word and a gun than you can with a kind word alone 🔫",
  "i never lie because i do not fear anyone", "you only lie when you are afraid", 
  "everyone has a price the important thing is to find out what it is", 
  "when you lose your money you lose nothing. when you lose your health you lose something. when you lose your character you lose everything", 
  "let them hate me so long as they fear me", "death is the solution to all problems 💀", 
  "i am just a businessman supplying a demand 💼",
  "a short life and a merry one shall be my motto", "i find your lack of faith disturbing 🌌", 
  "invisible maggot 🐛", "trip to your mind 🧠", 
  "there is no good in evil, only power and those too weak to seek it", 
  "success is not final. failure is not final. it is the courage to continue that counts",
  "work hard", "every great dream begins with a dreamer", "you might repeat", "play more", 
  "a Bluetooth Connection to Nowhere 📶", "Tears of a Manchester United fan 😭", 
  "Half-eaten Tuwo 🍲", "A strong warning from your ancestors ⚠️", 
  "Invisible G-Wagon (Keyless Entry) 🚙", "buy a lottery ticket for your sister 🎟️", 
  "One single grain of foreign rice 🍚"
];

console.log("Initializing The Pixel Vest Distribution Engine...");

// 1. Build the exact distribution from the Financial Blueprint
const prizes = [
  { amount: 20, text: "₦100,000 Mega Win!", type: "win" },
  { amount: 20, text: "₦50,000 Mega Win!", type: "win" },
  { amount: 10, text: "₦30,000 High Win!", type: "win" },
  { amount: 190, text: "₦12,000 Solid Win!", type: "win" },
  { amount: 2000, text: "₦1,000 boom!", type: "win" },
  { amount: 2000, text: "₦500 camaro payment!", type: "win" },
  { amount: 20000, text: "₦100 Break-Even!", type: "win" },
  { amount: 15000, text: "₦70 Micro Win!", type: "win" },
  { amount: 95000, text: "₦60 Micro Win!", type: "win" },
  { amount: 50000, text: "₦50 Micro Win!", type: "win" },
  { amount: 50000, text: "₦30 Micro Win!", type: "win" }
];

const totalNodes = 1000000;
const board = [];

console.log("Loading high-yield assets...");

// 2. Push all winning nodes into the array
prizes.forEach(prizeCategory => {
  for (let i = 0; i < prizeCategory.amount; i++) {
    board.push({ result: prizeCategory.text, type: prizeCategory.type });
  }
});

console.log(`Loaded ${board.length} winning nodes. Filling the rest with viral jokes...`);

// 3. Fill the rest (765,760) with random joke messages
const remainingCount = totalNodes - board.length;
for (let i = 0; i < remainingCount; i++) {
  const randomJoke = JOKE_PRIZES[Math.floor(Math.random() * JOKE_PRIZES.length)];
  board.push({ result: randomJoke, type: "joke" });
}

console.log(`Total nodes loaded: ${board.length}. Shuffling the grid (this takes a few seconds)...`);

// 4. Fisher-Yates Shuffle algorithm (Extremely fast, true randomization)
for (let i = board.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [board[i], board[j]] = [board[j], board[i]];
}

// 5. Assign fixed permanent IDs (1 to 1,000,000)
console.log("Assigning permanent Node IDs...");
const finalDatabase = board.map((node, index) => {
  return {
    id: index + 1,
    result: node.result,
    type: node.type
  };
});

// 6. Write it to a permanent JSON file
console.log("Writing to master-board.json...");
fs.writeFileSync('app/master-board.json', JSON.stringify(finalDatabase)); // Saving directly into the app folder so the API finds it instantly

console.log("✅ SUCCESS: 1,000,000 nodes generated, randomized, and saved to app/master-board.json.");