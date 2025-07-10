const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateNotesSummary(notes) {
    try {
      const validNotes = notes.filter((note) => note && note.trim() !== '');

      if (validNotes.length === 0) {
        return {
          success: false,
          message: 'No notes available to summarize',
          summary: null,
        };
      }

      const prompt = `
        Please create a concise summary of the following invoice item notes. 
        Focus on key information like delivery instructions, specifications, requirements, and important details.
        Keep it professional and under 200 words.

        Notes to summarize:
        ${validNotes.map((note, index) => `${index + 1}. ${note}`).join('\n')}
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        success: true,
        summary: summary.trim(),
        notesCount: validNotes.length,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        message: 'Failed to generate summary',
        error: error.message,
      };
    }
  }
}

module.exports = new GeminiService();
