import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate required fields
    const requiredFields = ['amyloid_beta', 'tau_p', 'neurofilament', 'apoe_genotype', 'fdg_pet', 'alpha_synuclein', 'dat_ratio', 'vps35_genotype'];
    const userInput = req.body;

    for (const field of requiredFields) {
      if (!userInput[field] && userInput[field] !== 0) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
      // Validate numeric values
      if (isNaN(parseFloat(userInput[field]))) {
        return res.status(400).json({ error: `Invalid value for field: ${field}` });
      }
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    const trainingData = await readTrainingData();

    // Validate training data
    if (!trainingData || trainingData.length === 0) {
      return res.status(500).json({ error: 'Training data is not available' });
    }

    const prompt = formatPrompt(trainingData, userInput);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a medical diagnosis assistant trained on neurological biomarker data. Analyze the provided biomarkers and training data to determine if the patient likely has Alzheimer\'s, Parkinson\'s, or is Healthy. Base your analysis on patterns in the training data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const diagnosis = completion.choices[0].message.content;
    
    // Validate diagnosis response
    const validDiagnoses = ['Alzheimer\'s', 'Parkinson\'s', 'Healthy'];
    if (!validDiagnoses.includes(diagnosis.trim())) {
      throw new Error('Invalid diagnosis response');
    }

    return res.status(200).json({ diagnosis });

  } catch (error) {
    console.error('Diagnosis error:', error);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to process diagnosis';
    return res.status(500).json({ error: errorMessage });
  }
}

async function readTrainingData() {
  const filePath = path.join(process.cwd(), 'trainingset.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({ columns: true, skip_empty_lines: true });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', function(err) {
      reject(err);
    });

    parser.on('end', function() {
      resolve(records);
    });

    parser.write(fileContent);
    parser.end();
  });
}

function formatPrompt(trainingData, userInput) {
  const formattedTrainingData = trainingData.map(record => {
    return `${Object.values(record).join(', ')}`;
  }).join('\n');

  const userValues = [
    userInput.amyloid_beta,
    userInput.tau_p,
    userInput.neurofilament,
    userInput.apoe_genotype,
    userInput.fdg_pet,
    userInput.alpha_synuclein,
    userInput.dat_ratio,
    userInput.vps35_genotype
  ].join(', ');

  return `Training Data:\n${formattedTrainingData}\n\nAnalyze the following patient biomarkers and provide a diagnosis (Alzheimer's, Parkinson's, or Healthy) based on the patterns in the training data:\n${userValues}\n\nProvide only the diagnosis without any additional explanation.`;
}