const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GOOGLE_AI_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    : null;

async function generateUniqueReview(clientName, description, services) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        let context = "";
        if (description) context += `The business is about: "${description}". `;
        if (services) context += `They offer services like: "${services}". `;

        const prompt = `
            Write a casual, 5-star Google review for a business named "${clientName}".
            ${context}
            
            IMPORTANT INSTRUCTIONS:
            1. refer to the business naturally. You can use the name "${clientName}" once, but prefer using "this place", "they", "the team", "the staff", or "here".
            2. Do NOT use the full business name more than once.
            3. Keep it under 40 words.
            4. Sound like a real human (use casual language, maybe a typo or slang like "super" or "definitely").
            5. Do not use hashtags or quotation marks.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.replace(/^"|"$/g, '').trim();
    } catch (error) {
        console.error("[Server] AI Generation Failed:", error.message);
        return null;
    }
}

module.exports = { generateUniqueReview };