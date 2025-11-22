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
    "I have been to Goa many times. But this time I got a reference of Patel Enterprises from Instagram and contacted Nirav Bhai. We planned everything well. All the tickets, transportation, resort bookings etc... and you won't believe we didn't miss a single place. Whenever we called Nirav Bhai directly he would answer. This is the first time I have seen this cheap and good.",
    "It was a great experience at Goa. We booked our 3N/4D Goa package from Niravbhai Patel. Starting from selecting hotel till completion of our tour, everything was upto the mark. The package price was also very reasonable. The hotel, meals, sightseeing were amazing. This tour will be memorable.",
    "We recently booked a trip to Statue of Unity through Nirav Patel. The Hotel was perfect for our group, offering spacious and clean rooms. The staff was friendly and quick to respond to our needs. A big thank you to Nirav patel for making such excellent arrangements!",
    "Last month we 4 couples booked Goa package from Nirav Bhai. The hotel there was very beautiful and comfortable. There was no problem during the entire tour. Very good service from Niravbhai. And the prices were also very reasonable. Will book from here in future.",
    "Great experience..amazing holiday package given by PATEL ENTERPRISE. Everything went very smoothly..thank you for the amazing Himachal trip NiravBhai.",
    "We planned for our Honeymoon at Rajasthan with Mr. Nirav Patel. He suggested us 2 property at both locations. Both properties were really good with delicious food. Nirav planned everything very well like transportation and sightseeing. He picked up all my calls on timely manner.",
    "I had a wonderful Experience with Patel Enterprise during my Bali stay. Whole tour was well organise. Thanks to Nirav Bhai for providing value for money package for my family. Everything was Top Notch and the 24-7 support was highly appreciated.",
    "We had great experience of Goa tour. We were group of 10 people and had awsome management of agency specially from Niravbhai. Thank you Niravbhai for quick response in any matter every time. Thank you for make our first Goa trip so memorable."
];

// 1. VIBE: Adjusted to avoid repetitive emotions like "stressed"
const REVIEW_STYLES = {
    "casual_friend": "Write like you are texting a friend. Short sentences. Direct.",
    "detail_observer": "Mention one specific detail (e.g., the view from the room, the driver's behavior, or the food quality).",
    "straight_to_point": "Don't waste time. Say it was good, mention the price was fair, and finish.",
    "group_traveler": "Focus on how hard it is to manage a big group and how they made it easy."
};

// 2. OPENING HOOK (NEW): Forces different starting sentence structures
const OPENING_HOOKS = [
    "START_WITH_TIME: Start with 'Just returned from...' or 'Last week we went to...'",
    "START_WITH_GROUP: Start with 'We were a group of...' or 'Me and my family...'",
    "START_WITH_SKEPTICISM: Start with 'Honestly, I was not sure at first...' or 'First time booking with...'",
    "START_WITH_LOCATION: Start directly with the place name. E.g., 'Our Goa trip was...'",
    "START_WITH_THANK_YOU: Start immediately with 'Thanks to Niravbhai...'"
];

// 3. FOCUS AREA (NEW): Prevents every review from listing "Hotel + Food + Driver + Price"
const FOCUS_AREAS = [
    "FOCUS_DRIVER: Talk mainly about the driver/transportation/bus comfort.",
    "FOCUS_HOTEL: Talk mainly about the hotel rooms and food.",
    "FOCUS_PLANNING: Talk mainly about how Niravbhai managed the booking/tickets.",
    "FOCUS_PRICE: Talk mainly about the budget/rates being reasonable."
];

// 4. NAMING RULE
const REFERRAL_MODES = [
    "MODE_PRONOUNS: Do NOT use the business name. Refer to them only as 'the team', 'they', 'the organizers', or 'these guys'.",
    "MODE_PERSONAL: Focus on the staff. Mention 'Niravbhai' or 'Nirav Patel' specifically instead of the business name.",
    "MODE_DIRECT: Use the full business name exactly ONCE in the middle of a sentence.",
    "MODE_IMPLIED: Do not mention the name or 'the team'. Just talk about how great the trip/hotel arrangement was."
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateUniqueReview(clientName, description, services) {
    if (!genAI) return null;

    // Random Selection
    const styles = Object.keys(REVIEW_STYLES);
    const selectedPersona = REVIEW_STYLES[styles[Math.floor(Math.random() * styles.length)]];
    const selectedOpening = OPENING_HOOKS[Math.floor(Math.random() * OPENING_HOOKS.length)];
    const selectedFocus = FOCUS_AREAS[Math.floor(Math.random() * FOCUS_AREAS.length)];
    const selectedReferralMode = REFERRAL_MODES[Math.floor(Math.random() * REFERRAL_MODES.length)];

    // Build Context
    let context = "";
    if (description) context += `Business: "${description}". `;
    if (services) context += `Services: "${services}". `;

    const examplesText = REAL_EXAMPLES.map(ex => `- "${ex}"`).join("\n");

    const prompt = `
        You are a real customer writing a Google Review for a travel agency.
        
        CONTEXT:
        - Business Name: "${clientName}" (Use sparingly).
        - Details: ${context}
        - Common Themes: Clean hotels, smooth planning, "value for money", responsive staff (Niravbhai).

        *** TRAINING DATA (STYLE REFERENCE) ***
        ${examplesText}
        ***************************************

        INSTRUCTIONS:
        1. OPENING RULE: ${selectedOpening} <--- YOU MUST START LIKE THIS.
        2. CONTENT FOCUS: ${selectedFocus} <--- Talk mostly about this, mention other things briefly.
        3. Vibe: ${selectedPersona}
        4. Naming: ${selectedReferralMode}
        5. Language: "Indian English". Use phrases like "upto the mark", "very reasonable", "on timely manner". Keep it simple and slightly imperfect.

        STRICT NEGATIVE CONSTRAINTS (DO NOT USE):
        - DO NOT START WITH: "Booked a trip...", "Was very stressed...", "I recently booked...".
        - NO ROBOTIC PHRASES: "Clean and comfortable" (say "rooms were neat" or "nice rooms"), "Seamless", "Unforgettable", "Gem", "Impeccable".
        - Do NOT mention "Kerala" unless it is in the input context. If no location is given, use "our trip" or "the tour".
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
            text = text.replace(/^(Subject:|Title:).+?(\n|$)/i, ''); // Remove accidental titles

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