
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
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_GOOGLE });

async function ask(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', async (msg) => {
        console.log(msg === "hola")
        io.emit('chat message', msg)
        const res = await search(await ask("comvierte esta pregunta a solo las palabras claves ejemplo: ¿Que es un vector normal? = vector normal" + msg));
        console.log(res)
        const aiRes = await ask(JSON.stringify(res) + "base on this responde this in detail and give the important document parts  i a beautiful html inside a <div> all your response is inside a div format: " + msg);
        console.log(aiRes)
        io.emit('chat message',aiRes);
  });
});


server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
