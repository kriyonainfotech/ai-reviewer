const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GOOGLE_AI_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    : null;

const MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash"
];

// --- REAL CLIENT EXAMPLES (TRAINING DATA) ---
const REAL_EXAMPLES = [
    "I have been to Goa many times. But this time I got a reference of Patel Enterprises from Instagram and contacted Nirav Bhai. We planned everything well. All the tickets, transportation, resort bookings etc... and you won't believe we didn't miss a single place.",
    "It was a great experience at Goa. We booked our 3N/4D Goa package from Niravbhai Patel. Starting from selecting hotel till completion of our tour, everything was upto the mark. The package price was also very reasonable.",
    "We recently booked a trip to Statue of Unity through Nirav Patel. The Hotel was perfect for our group, offering spacious and clean rooms. The staff was friendly and quick to respond to our needs.",
    "Last month we 4 couples booked Goa package from Nirav Bhai. The hotel there was very beautiful and comfortable. There was no problem during the entire tour. Very good service from Niravbhai.",
    "Great experience..amazing holiday package given by PATEL ENTERPRISE. Everything went very smoothly..thank you for the amazing Himachal trip NiravBhai.",
    "We planned for our Honeymoon at Rajasthan with Mr. Nirav Patel. He suggested us 2 property at both locations. Both properties were really good with delicious food. Nirav planned everything very well.",
    "I had a wonderful Experience with Patel Enterprise during my Bali stay. Whole tour was well organise. Thanks to Nirav Bhai for providing value for money package for my family.",
    "We had great experience of Goa tour. We were group of 10 people and had awsome management of agency specially from Niravbhai. Thank you Niravbhai for quick response in any matter every time."
];

// --- REVIEW PROFILES (Short / Medium / Long) ---
const PROFILES = {
    "SHORT_AND_ANONYMOUS": {
        length_desc: "Short (approx 30-45 words). Keep it under 250 characters.",
        naming_rule: "STRICTLY FORBIDDEN: Do NOT mention 'Nirav', 'Patel', or the business name. Use 'they', 'the team', or just talk about the service directly.",
        focus_topics: [
            "Food quality and taste",
            "Cleanliness of the room/hotel",
            "Comfort of the bus/cab",
            "View from the hotel",
            "Just a general 'good experience' statement"
        ],
        opening_hooks: [
            "Just came back from...",
            "Food was...",
            "Rooms were...",
            "Had a nice trip to...",
            "Service was..."
        ]
    },
    "MEDIUM_AND_BALANCED": {
        length_desc: "Medium (approx 50-60 words). Between 330-370 characters.",
        naming_rule: "BALANCED: Mention 'Niravbhai' or 'Patel Enterprise' EXACTLY ONCE. Preferably near the end or middle.",
        focus_topics: [
            "Smooth coordination and good hotels",
            "Family enjoyment and safety",
            "Value for money with good service",
            "Quick response from the team"
        ],
        opening_hooks: [
            "Our trip to... was well planned.",
            "Really happy with the service provided...",
            "Good arrangements made by...",
            "Everything was upto the mark...",
            "Nice experience with..."
        ]
    },
    "LONG_AND_PERSONAL": {
        length_desc: "Detailed (approx 70-90 words). Approx 400-450 characters.",
        naming_rule: "REQUIRED: You MUST mention one of the following: 'Niravbhai', 'Nirav Patel', 'Mr. Nirav', or 'Patel Enterprise' at least once.",
        focus_topics: [
            "The planning process and coordination",
            "Trustworthiness and reliability",
            "Detailed feedback on Hotel + Transport",
            "Overall management of the tour"
        ],
        opening_hooks: [
            "We booked our trip with...",
            "Big thanks to...",
            "It was a great experience...",
            "Honestly, the planning was...",
            "Highly recommend..."
        ]
    }
};

// --- STATE VARIABLE FOR CYCLING ---
// 0 = Short, 1 = Medium, 2 = Long
let currentProfileIndex = 0;
const PROFILE_KEYS = ["SHORT_AND_ANONYMOUS", "MEDIUM_AND_BALANCED", "LONG_AND_PERSONAL"];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateUniqueReview(clientName, description, services, destination) {
    if (!genAI) return null;

    // 1. Random Profile Selection (Weighted for realism)
    // 50% Short, 30% Medium, 20% Long
    const rand = Math.random();
    let profileKey = "SHORT_AND_ANONYMOUS";
    if (rand > 0.5) profileKey = "MEDIUM_AND_BALANCED";
    if (rand > 0.8) profileKey = "LONG_AND_PERSONAL";

    const profile = PROFILES[profileKey];

    // 2. Select random hooks within the profile
    const selectedTopic = profile.focus_topics[Math.floor(Math.random() * profile.focus_topics.length)];
    // We remove strict opening hooks enforcement in the prompt to allow more variety, 
    // but keep them as "inspiration".
    const exampleOpening = profile.opening_hooks[Math.floor(Math.random() * profile.opening_hooks.length)];

    // Build Context
    let context = "";
    if (description) context += `Business Description: "${description}". `;
    if (services) context += `Services Offered: "${services}". `;
    if (destination) context += `Specifc Trip Destination: "${destination}". `;

    const examplesText = REAL_EXAMPLES.map(ex => `- "${ex}"`).join("\n");

    const prompt = `
        You are a real customer writing a Google Review for a travel agency.
        Your goal is to sound 100% AUTHENTIC and NATURAL. Avoid "AI patterns".

        CONTEXT:
        - Business Name: "${clientName}".
        - Context: ${context}
        ${destination ? `- CRITICAL INSTRUCTION: The review MUST be about a trip to "${destination}". Mention specific details about "${destination}" (e.g., local spots, weather, specific hotels if known, or just the vibe/places).` : ''}

        *** GENERATION PROFILE: ${profileKey} ***
        1. LENGTH: ${profile.length_desc}
        2. NAMING RULE: ${profile.naming_rule}
        3. TOPIC: Focus on "${selectedTopic}".
        
        *** STYLE GUIDE (Indian English Nuances) ***
        - Write like a real person from India.
        - Use simple, everyday language. 
        - Occasionally use Indian-English phrases like "upto the mark", "very nice experience", "co-operative staff", "budget friendly".
        - It is okay to have minor grammatical imperfections (e.g., "Food was good quality", "Staff support was nice").
        - AVOID: Perfection. Real reviews are rarely perfectly structured.
        - AVOID: "Seamless", "Impeccable", "Unforgettable", "Top-notch", "Gem". These are dead giveaways.
        - INSTEAD OF "Seamless experience", SAY "Everything went smoothly" or "No issues at all".
        - INSTEAD OF "I highly recommend", SAY "Must visit", "Go for it", or "Definitely recommend".

        EXAMPLES OF AUTHENTIC TONE:
        ${examplesText}

        OUTPUT:
        Just the review text. No quotes.
    `;

    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Cleanup
            text = text.replace(/^"|"$/g, '').trim();
            text = text.replace(/^(Here is|Sure, here|Okay|Review:).+?:\s*/i, '');
            text = text.replace(/^(Subject:|Title:).+?(\n|$)/i, '');

            return text;

        } catch (error) {
            if (error.message.includes('429') || error.message.includes('503')) {
                await delay(1000);
                continue;
            } else {
                console.error(`[Server] Error with ${modelName}:`, error.message);
                if (error.message.includes('404')) continue;
                return null;
            }
        }
    }

    console.error("[Server] All AI models failed.");
    return null;
}

module.exports = { generateUniqueReview };