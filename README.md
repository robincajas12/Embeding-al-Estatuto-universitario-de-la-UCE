## Descripción del Proyecto GitHub

El proyecto "Embeding-al-Estatuto-universitario-de-la-UCE" es un sistema de chat con IA que permite consultar el estatuto universitario de la Universidad Central del Ecuador usando procesamiento de lenguaje natural <cite/>. El sistema combina embeddings vectoriales, búsqueda semántica y IA generativa para proporcionar explicaciones contextualizadas de documentos legales con referencias de apoyo <cite/>.

### Arquitectura Principal

El sistema sigue una arquitectura de tres capas con interfaz web cliente, servidor backend Node.js, y base de datos MongoDB Atlas con capacidades de búsqueda vectorial <cite/>. 

**Componentes clave:**
- **Motor de Embeddings** (`embeding.js`): Genera embeddings vectoriales usando TensorFlow Universal Sentence Encoder y realiza búsquedas de similitud [1](#0-0) 
- **Orquestador de IA** (`index.js`): Procesa consultas y sintetiza respuestas usando Google GenAI (Gemini 2.5 Flash) [2](#0-1) 
- **Interfaz Web**: Sistema de chat en tiempo real con Socket.IO [3](#0-2) 

### Flujo de Procesamiento

1. El usuario envía una pregunta en lenguaje natural
2. La función `ask()` extrae palabras clave legales relevantes [4](#0-3) 
3. `getEmbedding()` genera un vector de 512 dimensiones [1](#0-0) 
4. `search()` realiza búsqueda vectorial en MongoDB usando `$vectorSearch` [5](#0-4) 
5. `askgptGETDocs()` genera una explicación estructurada con documentos relevantes [6](#0-5) 

### Esquema de Datos

Los documentos del estatuto se almacenan con la siguiente estructura en la colección `estatuto_universitario_v2` [7](#0-6) :
- `titulo`, `capitulo`, `numero_de_capitulo`
- `articulo`, `titulo_de_articulo`, `contenido`
- `etiquetas`, `preguntas_sugeridas`
- `embedding`: Array de números para búsqueda vectorial

### Tecnologías Utilizadas

- **IA y ML**: Google GenAI (Gemini 2.5 Flash), TensorFlow Universal Sentence Encoder
- **Base de datos**: MongoDB Atlas con índice de búsqueda vectorial
- **Backend**: Node.js, Express.js, Socket.IO para comunicación en tiempo real
- **Frontend**: HTML/JavaScript con html2pdf.js para exportación


El proyecto está específicamente diseñado para el estatuto universitario de la UCE y utiliza tecnologías modernas de IA para hacer accesible la información legal compleja a través de consultas en lenguaje natural. El sistema mantiene la precisión legal al basar todas las respuestas exclusivamente en los documentos del estatuto almacenados en la base de datos.
