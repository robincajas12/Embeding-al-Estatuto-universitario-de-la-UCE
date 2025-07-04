
import { createServer } from  'node:http';
import { join } from 'node:path';
import { Server } from 'socket.io';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {getEmbedding, search, updateEmbeddings} from './embeding.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server);
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_GOOGLE });

async function ask(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
     config: {
    responseMimeType: "application/json",
    systemInstruction: "Dame las palabras clave en este texto, ejemplo: Cuales son los valores de la institución responder: 'valores de la institución'",
    responseSchema: {
      type: Type.STRING,

    }}
  });
  console.log(response.text, "@@@@@@@@@@@@@@@@@@@@@@@@")
  return response.text;
}

async function askgptGETDocs(prompt) {
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        explanation: { type: Type.STRING },
        docs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              titulo: { type: Type.STRING },
              capitulo: { type: Type.STRING },
              numero_de_capitulo: { type: Type.NUMBER },
              articulo: { type: Type.NUMBER },
              titulo_de_articulo: { type: Type.STRING },
              contenido: { type: Type.STRING },
            },
            propertyOrdering: [
              "titulo",
              "capitulo",
              "numero_de_capitulo",
              "articulo",
              "titulo_de_articulo",
              "contenido"
            ],
          }
        }
      },
      propertyOrdering: ["explanation", "docs"]
    }
  }
});


  return response.text;
}


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
        console.log(msg)
        const res = await search(ask(msg));
        console.log(res)
        const estatutoJSON = JSON.stringify(res);

        const prompt = `
        Usa exclusivamente la siguiente información del estatuto universitario para responder AL TEXTO que te DARÉ. No inventes respuestas fuera de este contexto.

        Documentos del estatuto:
        ${estatutoJSON}

        Pregunta:
        ${msg}

        Por favor, responde con claridad y precisión basándote solo en los documentos proporcionados. solo devuelve los articulos relevantes si no responder, 'no encontrado'
        `;
        const aiRes = await askgptGETDocs(prompt);
        console.log(aiRes)
        io.emit('chat message',aiRes);
  });
});


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
