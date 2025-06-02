require("dotenv").config();
//const OpenAI = require("openai")
const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
//const token = process.env.DEEPSEEK_API_KEY
//const endpoint = process.env.AZURE_URL
// const modelName = "gpt-4o";

// const client = new OpenAI({ baseURL: endpoint, apiKey: token });

// exports.extractCriteriaFromText = async(text) => {
//   const prompt = `Extract key recruitment criteria as a list of skills, qualifications, projects or years of experience from the following text:\n\n${text}`;

//   const response = await client.chat.completions.create({
//     messages: [
//       { role: "system", content: "You are a helpful assistant." },
//       { role: "user", content: prompt }
//     ],
//     temperature: 0.7,
//     top_p: 1.0,
//     max_tokens: 1500,
//     model: modelName
//   });

//   const content = response.choices[0].message.content;
//   return content.split(/\n|\d+\.|- /).map(c => c.trim()).filter(c => c);
// }

exports.extractTextFromCV = async (filePath) => {
  const buffer = await fs.readFile(filePath);

  if (filePath.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (filePath.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
  }
}

