require("dotenv").config();

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    if (!API_KEY) {
        console.error("Error: GOOGLE_AI_API_KEY is missing in .env file");
        return;
    }

    console.log("Checking available models...");

    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        if (!data.models) {
            console.log("No models found.");
            return;
        }

        console.log("\n--- Available Models ---");
        // Filter for models that support 'generateContent'
        const generateModels = data.models.filter(m =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        generateModels.forEach(model => {
            console.log(`- ${model.name.replace('models/', '')} (${model.displayName})`);
        });
        console.log("------------------------\n");

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

listModels();