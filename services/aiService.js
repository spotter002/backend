const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async refineJobIdea(originalIdea, files = []) {
    try {
      const prompt = `
You are an expert project manager helping refine vague job ideas into clear, actionable project descriptions.

Original idea: "${originalIdea}"

Please provide a JSON response with:
1. refinedTitle: A clear, professional project title
2. refinedDescription: A detailed description with specific deliverables
3. suggestedMilestones: Array of 2-3 milestone objects with title, description, and estimated days
4. budgetRange: Object with min and max in KES (Kenyan Shillings)
5. timelineEstimate: Estimated days to complete
6. clarifyingQuestions: Array of 1-3 questions to help clarify requirements
7. elevatorPitch: One-line summary of the project

Keep budget estimates conservative and realistic for the Kenyan market.
`;

      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful project refinement assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('AI Service Error:', error.message);
      throw error;
    }
  }
}

module.exports = new AIService();