const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GOOGLE_AI_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    : null;

// --- UPDATED MODEL LIST ---
// Based on your terminal output, we use these available models.
// 1. Main: Gemini 2.0 Flash (Standard, fast)
// 2. Fallback 1: Gemini 2.0 Flash Lite (Very fast, separate quota)
// 3. Fallback 2: Gemini 2.5 Flash (Newer version, separate quota)
const MODELS_TO_TRY = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash"
];

// Define different "Vibes"
const REVIEW_STYLES = {
    "storyteller": "You love sharing details. Write 3-4 sentences about a specific moment or detail that made the experience special.",
    "enthusiastic_expert": "You visit places like this often. Explain specifically *why* this one is better than others (e.g., better service, cleaner, better value).",
    "grateful_customer": "You were worried about something (e.g., timing, budget, quality) but they fixed it. Write a relieved and happy review.",
    "local_guide_style": "Write a helpful review for others. Mention practical details like parking, wifi, or booking ease, along with the quality.",
    "detailed_family": "You are a parent traveling with family. Describe how they made things easier for your group."
};

// Helper delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateUniqueReview(clientName, description, services) {
    if (!genAI) return null;

    // 1. Pick a Persona
    const styleKeys = Object.keys(REVIEW_STYLES);
    const randomKey = styleKeys[Math.floor(Math.random() * styleKeys.length)];
    const selectedPersona = REVIEW_STYLES[randomKey];

    // 2. Build Prompt
    let context = "";
    if (description) context += `Business Description: "${description}". `;
    if (services) context += `Services: "${services}". `;

    const prompt = `
        Task: Write a 5-star Google Review for "${clientName}".
        
        Persona: ${selectedPersona}
        Context: ${context}
        - Key strengths: Clean hotels, smooth planning, responsive staff (Niravbhai), good for groups.
        - Locations: Goa, Rajasthan, Statue of Unity.

        CRITICAL OUTPUT RULES:
        1. Output ONLY the review text. 
        2. Length: Write about 50-90 words. Do NOT make it too short. 
        3. Do NOT start with "Here is a review". Start directly with the text.
        4. Do NOT start every review with the business name. Use it naturally in the middle or end, or just say "they"/"the team".
        5. No hashtags. No AI words like "unforgettable" or "seamless".
        6. Tone: Natural, conversational, and specific.
    `;

    // 3. Try Models in Loop
    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Cleanup
            text = text.replace(/^"|"$/g, '').trim();
            text = text.replace(/^(Here is|Sure, here|Okay, here|Here's).+?:\s*/i, '');
            text = text.replace(/^---\s*/, '');

            return text; // Success!

        } catch (error) {
            // Check for Rate Limit (429) or Overloaded (503)
            if (error.message.includes('429') || error.message.includes('503')) {
                console.warn(`[Server] Model ${modelName} exhausted. Switching...`);
                await delay(1000); // Wait 1s before trying next
                continue;
            } else {
                console.error(`[Server] Error with ${modelName}:`, error.message);
                // If it's a 404 (Not Found), we should also try the next model
                if (error.message.includes('404')) continue;
                return null;
            }
        }
    }

    console.error("[Server] All AI models failed.");
    return null; // Fallback to DB
}

module.exports = { generateUniqueReview };