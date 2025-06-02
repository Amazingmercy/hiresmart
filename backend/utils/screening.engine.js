require("dotenv").config();
const OpenAI = require("openai")
const token = process.env.DEEPSEEK_API_KEY
const endpoint = process.env.AZURE_URL
const modelName = "gpt-4o";

const client = new OpenAI({ baseURL: endpoint, apiKey: token });


exports.analyzeCVAgainstCriteria = async(cvText, criteriaList) => {
  try {
  const prompt = `You are analyzing a candidate's CV against specific recruitment criteria.

Recruitment Criteria:
${criteriaList}

CV Text:
${cvText}

Your task:
1. Extract the candidate's name (if any), skills, years of experience, language proficiency and  relevant qualifications.
2. Identify which required skills/criteria are missing.
3. Calculate the percentage of skills mateched with the criteria.
4. Determine if the candidate is qualified (threshold is 60% match).

⚠️ Response Format (strictly follow this):
{
  "screening_details": {
    "Name": "<candidate name>",
    "Available Skills": [<list of matched skills from CV>],
    "Missing Skills": [<list of missing or unmatched criteria>],
    "Qualified": "<YES or NO>"
  },
  "score": "<match percentage>%"
}
`;



  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful recruitment analyst." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    top_p: 1.0,
    max_tokens: 1500,
    model: modelName
  });

  return response.choices[0].message.content;
} catch (error) {
  console.error("Error analyzing CV:", error);
  return "Error analyzing CV";
}
}
