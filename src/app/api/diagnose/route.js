import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const requiredFields = ['amyloid_beta', 'tau_p', 'neurofilament', 'apoe_genotype', 'fdg_pet', 'alpha_synuclein', 'dat_ratio', 'vps35_genotype'];

    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return Response.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
      if (['apoe_genotype', 'vps35_genotype'].includes(field)) {
        if (typeof body[field] !== 'boolean') {
          return new Response(JSON.stringify({ error: `Invalid value for field: ${field}, expected true or false` }), { status: 400 });
        }
      } else {
        if (isNaN(parseFloat(body[field]))) {
          return new Response(JSON.stringify({ error: `Invalid value for field: ${field}` }), { status: 400 });
        }
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }

    const trainingData = await readTrainingData();
    if (!trainingData || trainingData.length === 0) {
      return Response.json({ error: 'Training data is not available' }, { status: 500 });
    }

    const prompt = formatPrompt(trainingData, body);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: "You are a medical diagnosis assistant trained on neurological biomarker data. Analyze the provided biomarkers and training data to determine if the patient likely has Alzheimer's, Parkinson's, or is Healthy. Base your analysis on patterns in the training data."
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    const diagnosis = completion.choices?.[0]?.message?.content?.trim();
    const validDiagnoses = ["Alzheimer's", "Parkinson's", "Healthy"];
    if (!validDiagnoses.includes(diagnosis)) {
      throw new Error('Invalid diagnosis response');
    }

    return Response.json({ diagnosis }, { status: 200 });

    } 
    }  catch (error) {
    console.error('Diagnosis error:', error);
    return Response.json({ error: error.message || 'Failed to process diagnosis' }, { status: 500 });
  }
}

async function readTrainingData() {
  const filePath = path.join(process.cwd(), 'trainingset.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({ columns: true, skip_empty_lines: true });

    parser.on('readable', function () {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', reject);
    parser.on('end', () => resolve(records));

    parser.write(fileContent);
    parser.end();
  });
}

function formatPrompt(trainingData, userInput) {
  const formattedTrainingData = trainingData.map(record => Object.values(record).join(', ')).join('\n');
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
