const express = require('express');
require('dotenv').config();
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache simples
const placeCache = new Map();

// Modelo Gemini configurado
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro-latest",
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.5
  }
});

// Função auxiliar para processar respostas do Gemini
async function generateGeminiContent(prompt, isJson = true) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    if (isJson) {
      // Remove marcações de código se existirem
      text = text.replace(/```json|```/g, '').trim();
      
      // Garante que é um JSON válido
      if (!text.startsWith('{') && !text.startsWith('[')) {
        text = text.substring(text.indexOf('{'));
      }
      if (!text.endsWith('}') && !text.endsWith(']')) {
        text = text.substring(0, text.lastIndexOf('}') + 1);
      }
      
      return JSON.parse(text);
    }
    return text;
  } catch (err) {
    console.error('Erro Gemini:', err);
    throw err;
  }
}

router.get('/search', async (req, res) => {
  const { query, near, getTips } = req.query;

  if (!query || !near) {
    return res.status(400).json({ message: 'Parâmetros "query" e "near" são obrigatórios.' });
  }

  try {
    // 1. Buscar lugares no Google Places
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    const response = await axios.get(textSearchUrl, {
      params: {
        query: `${query} in ${near}`,
        key: process.env.GOOGLE_API_KEY,
        fields: 'name,formatted_address,geometry,rating,photos,types'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(500).json({ 
        message: 'Erro na API Google Places', 
        error: response.data.error_message || response.data.status
      });
    }

    // 2. Processar resultados
    let results = response.data.results.slice(0, 5).map(place => ({
      nome: place.name,
      endereco: place.formatted_address,
      localizacao: place.geometry?.location,
      rating: place.rating,
      tipos: place.types,
      photo: place.photos?.[0]?.photo_reference
    }));

    // 3. Adicionar dicas de IA se solicitado
    if (getTips === 'true') {
      results = await Promise.all(results.map(async place => {
        const cacheKey = `${place.nome}-${place.endereco}`;
        
        // Verificar cache
        if (placeCache.has(cacheKey)) {
          return { ...place, dicas: placeCache.get(cacheKey) };
        }

        // Gerar dicas com Gemini
        const prompt = `Gere 3 dicas úteis sobre ${place.nome} (${place.tipos.join(', ')}), localizado em ${place.endereco}. 
        Inclua informações sobre melhores horários para visita, itens do cardápio destacados se for um restaurante, ou curiosidades se for um ponto turístico. 
        Use no máximo 150 caracteres por dica. Formate como array JSON: ["dica1", "dica2", "dica3"]`;
        
        const dicas = await generateGeminiContent(prompt);
        
        // Armazenar no cache
        placeCache.set(cacheKey, dicas);
        
        return { ...place, dicas };
      }));
    }

    res.json(results);

  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar lugares', 
      error: err.message,
      fallback: results || [] // Retorna resultados básicos se houver
    });
  }
});

// Rota para recomendações personalizadas
router.get('/recommendations', async (req, res) => {
  const { interests, near } = req.query;
  const cacheKey = `rec-${interests}-${near}`;

  try {
    // Verificar cache
    if (placeCache.has(cacheKey)) {
      return res.json(placeCache.get(cacheKey));
    }

    const prompt = `Como especialista em turismo local, recomende 3 tipos de lugares para alguém interessado em ${interests} visitando ${near}. 
    Para cada tipo, sugira 2 exemplos específicos. Formate como JSON SEM markdown:
    {
      "recommendations": [
        {
          "type": "tipo de lugar",
          "examples": ["Exemplo 1", "Exemplo 2"],
          "reason": "razão para recomendação"
        }
      ]
    }`;

    const recommendations = await generateGeminiContent(prompt);
    
    // Armazenar no cache
    placeCache.set(cacheKey, recommendations);
    
    res.json(recommendations);

  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao gerar recomendações',
      error: err.message,
      fallback: {
        recommendations: [
          {
            type: "Atração Cultural",
            examples: ["Museu Local", "Galeria de Arte"],
            reason: "Culturalmente enriquecedor"
          }
        ]
      }
    });
  }
});

// Rota para gerar roteiros de visita
router.get('/itinerary', async (req, res) => {
  const { places, timeAvailable, preferences } = req.query;
  const cacheKey = `itinerary-${places}-${timeAvailable}`;

  try {
    // Verificar cache
    if (placeCache.has(cacheKey)) {
      return res.json(placeCache.get(cacheKey));
    }

    const prompt = `Crie um roteiro detalhado para visitar: ${places} em ${timeAvailable} horas.
    ${preferences ? `Considerando: ${preferences}.` : ''}
    Formato JSON SEM markdown com:
    - ordem de visitação
    - tempo em cada local
    - dicas específicas
    - como chegar ao próximo local`;

    const itinerary = await generateGeminiContent(prompt);
    
    // Armazenar no cache
    placeCache.set(cacheKey, itinerary);
    
    res.json(itinerary);

  } catch (err) {
    const placesList = places.split(',');
    res.status(500).json({
      message: 'Erro ao gerar roteiro',
      error: err.message,
      fallback: {
        itinerary: placesList.map((place, i) => ({
          place,
          order: i + 1,
          duration: `${Math.floor(timeAvailable/placesList.length)} horas`,
          tips: "Visite durante o dia",
          transport: "Táxi ou transporte público"
        })),
        notes: "Roteiro simplificado devido a erro na API"
      }
    });
  }
});

module.exports = router;