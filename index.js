const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require("readline");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function startChat() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = await model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Pretend you're a generative ai who has answers to all the questions asked and stay in character for each response.",
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Thats so cool, come on shoot your questions." }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    return chat;
  } catch (error) {
    console.error("Error starting chat:", error);
    throw error;
  }
}

// Function to send a message and get response.
async function sendMessage(chat, message) {
  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Function to ask a question.
async function askQuestion(chat) {
  return new Promise((resolve, reject) => {
    rl.question("Enter your question: ", async (question) => {
      try {
        const response = await sendMessage(chat, question);
        console.log("Response:", response);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Function to control the flow of conversation.
async function chatFlow() {
  try {
    const chat = await startChat();

    // Loop to continue the conversation until the user decides to stop.
    while (true) {
      await askQuestion(chat);
      const continueConversation = await askToContinue();
      if (!continueConversation) break;
    }

    rl.close();
  } catch (error) {
    console.error("Chat flow error:", error);
  }
}

async function askToContinue() {
  return new Promise((resolve, reject) => {
    rl.question(
      "Do you want to continue the conversation? (yes/no) ",
      (answer) => {
        if (answer.toLowerCase() === "yes") {
          resolve(true);
        } else if (answer.toLowerCase() === "no") {
          resolve(false);
        } else {
          console.log("Invalid input. Please enter 'yes' or 'no'.");
          resolve(askToContinue());
        }
      }
    );
  });
}

chatFlow();
