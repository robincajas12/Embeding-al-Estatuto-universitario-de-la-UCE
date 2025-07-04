import mongoose from "mongoose";
import dotenv from "dotenv";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import "@tensorflow/tfjs-node";

dotenv.config();

const MONGO_URI = process.env.ATLAS_URL ;

const estatutoSchema = new mongoose.Schema({
  titulo: String,
  capitulo: String,
  numero_de_capitulo: Number,
  articulo: mongoose.Schema.Types.Mixed, // Puede ser número o string
  titulo_de_articulo: String,
  contenido: String,
  etiquetas: [String],
  preguntas_sugeridas: [String],
  embedding: [Number],
});

const Estatuto = mongoose.model("estatuto_universitario_v2", estatutoSchema, "estatuto_universitario_v2");

// Singleton para la conexión a MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB conectado");
  }
}

// Carga el modelo solo una vez y reutiliza la instancia
let model;
async function loadModel() {
  if (!model) {
    model = await use.load();
    console.log("Modelo USE cargado");
  }
  return model;
}

async function getEmbedding(text) {
  console.log(text.toString(), "xddd");
  const m = await loadModel();
  const embeddings = await m.embed([text.toString()]);
  const embeddingArray = embeddings.arraySync()[0];
  embeddings.dispose(); // libera memoria tensor
  return embeddingArray;
}

// Actualiza documentos sin embedding con vectores nuevos
async function updateEmbeddings() {
  await connectDB();

  const docs = await Estatuto.find({
    $or: [{ embedding: { $exists: true } }, { embedding: null }],
  });

  for (const doc of docs) {
    const textToEmbed = `
      ${doc.titulo_de_articulo ? doc.titulo_de_articulo : ""}
      ${doc.contenido}
     ${doc.etiquetas.join(',')}
     }
    `;

    try {
      const embedding = await getEmbedding(textToEmbed);
      await Estatuto.updateOne({ _id: doc._id }, { $set: { embedding } });
      console.log(`Documento ${doc._id} actualizado con embedding`);
    } catch (err) {
      console.error(`Error generando embedding para doc ${doc._id}:`, err);
    }
  }
}

// Busca por texto usando búsqueda vectorial con índice 'estatuto_embedding'
async function search(text, numCandidates = 300, limit = 3) {
  await connectDB();

  try {
    console.log(text)
    const queryVector = await getEmbedding(text);
    console.log("Vector generado para búsqueda");

const results = await Estatuto.aggregate([
  {
    $vectorSearch: {
      index: "default",
      path: "embedding",
      queryVector: queryVector,      // tu vector de 512 floats
      numCandidates: numCandidates,              // cuántos candidatos considera internamente
      limit: limit                       // cuántos resultados devuelve
    }
  },
  {
    $project:
    {
        embedding: 0
    }
  }
]);

    console.log("Resultados:", results);
    return results;
  } catch (err) {
    console.error("Error en la búsqueda vectorial:", err);
    throw err;
  }
}
loadModel();
//updateEmbeddings();
// Exporta funciones si quieres usarlas desde otro módulo
export { updateEmbeddings, search, getEmbedding};
