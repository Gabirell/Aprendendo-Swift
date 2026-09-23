import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API route for career tips using Gemini
  app.post("/api/career-tips", async (req, res) => {
    try {
      const { topics } = req.body || {};
      const topicList = Array.isArray(topics) && topics.length > 0 ? topics.join(", ") : "Swift e iOS";
      
      const ai = getAIClient();
      if (!ai) {
        return res.json({
          resumeTips: `• Destaque projetos práticos aplicando ${topicList} no seu portfólio GitHub.\n• Enfatize arquiteturas modernas (MVVM), SwiftUI declarativo e tratamento seguro de Optionals.\n• Mencione os simulados oficiais concluídos e o score obtido na Swift Academy.`,
          interviewTips: `• Perguntas comuns abordam a diferença entre Struct (Value Type) e Class (Reference Type) na memória.\n• Prepare-se para responder sobre gerenciamento de ciclo de vida e retenção de memória (ARC, [weak self]).\n• Demonstre como você usa async/await e @MainActor para garantir fluidez na UI.`,
          nextSteps: `• Desenvolva um aplicativo completo integrando chamadas REST assíncronas.\n• Aprofunde seus conhecimentos em persistência com SwiftData e animações no SwiftUI.\n• Explore a documentação oficial da Apple (Human Interface Guidelines e Swift API Design Guidelines).`
        });
      }

      const prompt = `Você é um mentor experiente de desenvolvedores iOS.
Um aluno acabou de estudar os seguintes tópicos de Swift: ${topicList}.

Forneça conselhos práticos para ele.
Divida a resposta em três partes:
1. Como colocar esses conhecimentos no currículo de forma atrativa para vagas de Dev iOS Junior/Pleno.
2. Como esses temas costumam ser cobrados em entrevistas técnicas para iOS (dê exemplos do que responder).
3. Qual deve ser o próximo passo de estudo.

Retorne APENAS um JSON com a seguinte estrutura:
{
  "resumeTips": "texto formatado com quebras de linha",
  "interviewTips": "texto formatado com quebras de linha",
  "nextSteps": "texto formatado com quebras de linha"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJsonStr);
      res.json(parsedData);
    } catch (error) {
      console.error("Gemini API Error (Career Tips):", error);
      res.status(500).json({ error: "Falha ao gerar dicas de carreira." });
    }
  });

  // API route for AI Tutor
  app.post("/api/tutor", async (req, res) => {
    try {
      const { question, options, correctIndex, userIndex, explanation } = req.body || {};
      
      const correctOpt = options?.[correctIndex] ?? "Correta";
      const userOpt = options?.[userIndex] ?? "Selecionada";

      const ai = getAIClient();
      if (!ai) {
        return res.json({
          studyRecommendation: `A confusão entre "${userOpt}" e "${correctOpt}" é frequente ao estudar este tópico.\nA resposta correta é "${correctOpt}" porque: ${explanation || 'este é o comportamento padrão das regras da linguagem Swift'}.\n\nRecomendamos revisar os conceitos fundamentais desta lição na Trilha de Estudos para sedimentar a diferença.`,
          examples: `Exemplo 1 (Cenário Prático):\nSempre que precisar de imutabilidade e thread-safety em modelos de dados simples, utilize struct (Value Type). Para identidades compartilhadas ou observáveis, use class (Reference Type).\n\nExemplo 2 (Prevenção de Erros):\nDesempacote valores opcionais de forma segura com 'if let' ou 'guard let', evitando force unwrap ('!') que causa travamento (crash) inesperado em tempo de execução.`
        });
      }

      const prompt = `Você é um tutor especialista em desenvolvimento iOS e Swift.
Um aluno errou a seguinte questão em um simulado:
- Questão: "${question}"
- Resposta Correta: "${correctOpt}"
- Resposta do Aluno: "${userOpt}"
- Explicação original do sistema: "${explanation}"

O aluno pediu mais ajuda. Por favor:
1. Indique de forma clara qual parte ele precisa estudar mais ou onde está a origem provável da dúvida (o que causou a confusão).
2. Crie mais 2 exemplos práticos e simples (código ou analogias) para explicar o conteúdo, para garantir que ele entenda e não erre de novo.

Retorne APENAS um JSON com a seguinte estrutura:
{
  "studyRecommendation": "texto explicando o que estudar / origem da dúvida",
  "examples": "texto formatado com os 2 exemplos"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "";
      const cleanJsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJsonStr);
      res.json(parsedData);
    } catch (error) {
      console.error("Gemini API Error (Tutor):", error);
      res.status(500).json({ error: "Falha ao gerar explicação do tutor." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
