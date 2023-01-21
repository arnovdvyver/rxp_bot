import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
dotenv.config()


//call openAI
const configuration = new Configuration({
  apiKey: process.env.AIKEY,
});
const openai = new OpenAIApi(configuration);

//request
const response = await openai.createCompletion({
  model: "text-curie-001",
  prompt: "Can you explain in simple terms what is meant by a relative error?",
  temperature: 0,
  max_tokens: 100,
});

console.log(response.data);
