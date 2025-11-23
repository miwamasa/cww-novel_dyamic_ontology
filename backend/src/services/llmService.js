/**
 * LLM Service
 *
 * Handles communication with LLM APIs (OpenAI, Anthropic, etc.)
 * Supports multiple providers through a unified interface
 */

export class LLMService {
  constructor(config = {}) {
    this.provider = config.provider || process.env.LLM_PROVIDER || 'openai';
    this.apiKey = config.apiKey || process.env.LLM_API_KEY;
    this.model = config.model || this.getDefaultModel();
    this.baseURL = config.baseURL || this.getDefaultBaseURL();
  }

  getDefaultModel() {
    switch (this.provider) {
      case 'openai':
        return 'gpt-4-turbo-preview';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      default:
        return 'gpt-4-turbo-preview';
    }
  }

  getDefaultBaseURL() {
    switch (this.provider) {
      case 'openai':
        return 'https://api.openai.com/v1';
      case 'anthropic':
        return 'https://api.anthropic.com/v1';
      default:
        return 'https://api.openai.com/v1';
    }
  }

  /**
   * Execute an ontology operation using LLM
   * @param {string} prompt - The complete prompt
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Parsed JSON result from LLM
   */
  async execute(prompt, options = {}) {
    if (!this.apiKey) {
      // Return mock data if no API key is configured
      return this.getMockResponse(prompt);
    }

    try {
      const response = await this.callAPI(prompt, options);
      return this.parseResponse(response);
    } catch (error) {
      console.error('LLM execution error:', error);
      throw new Error(`LLM execution failed: ${error.message}`);
    }
  }

  /**
   * Call the appropriate LLM API
   * @private
   */
  async callAPI(prompt, options) {
    switch (this.provider) {
      case 'openai':
        return this.callOpenAI(prompt, options);
      case 'anthropic':
        return this.callAnthropic(prompt, options);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Call OpenAI API
   * @private
   */
  async callOpenAI(prompt, options) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in ontology engineering and formal knowledge representation. Always respond with valid JSON following the specified schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 4000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Call Anthropic API
   * @private
   */
  async callAnthropic(prompt, options) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.3,
        system: 'You are an expert in ontology engineering and formal knowledge representation. Always respond with valid JSON following the specified schema.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Parse LLM response and extract JSON
   * @private
   */
  parseResponse(responseText) {
    try {
      // Try to parse as JSON directly
      return JSON.parse(responseText);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find any JSON object in the response
      const objectMatch = responseText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      throw new Error('Could not extract valid JSON from LLM response');
    }
  }

  /**
   * Get mock response for testing without API key
   * @private
   */
  getMockResponse(prompt) {
    console.log('Using mock LLM response (no API key configured)');

    // Detect operation type from prompt
    if (prompt.includes('Addition')) {
      return {
        result: {
          id: 'mock-addition-result',
          name: 'Mock Addition Result',
          version: '1.0',
          metadata: { operation: 'addition', mock: true },
          classes: [],
          relations: [],
          axioms: [],
          instances: [],
          vocabulary: {}
        },
        metadata: {
          operation: 'addition',
          sourceOntologies: ['A', 'B'],
          conflicts: [],
          statistics: { totalClasses: 0, totalRelations: 0, totalInstances: 0 }
        }
      };
    }

    if (prompt.includes('Merge')) {
      return {
        result: {
          id: 'mock-merge-result',
          name: 'Mock Merge Result',
          version: '1.0',
          metadata: { operation: 'merge', mock: true },
          classes: [],
          relations: [],
          axioms: [],
          instances: [],
          vocabulary: {}
        },
        alignments: [
          {
            sourceA: 'Person',
            sourceB: 'Human',
            confidence: 0.95,
            reasoning: 'Semantically equivalent concepts'
          }
        ],
        conflicts: [],
        metadata: { operation: 'merge', alignmentCount: 1, conflictCount: 0 }
      };
    }

    // Default mock response
    return {
      result: {
        id: 'mock-result',
        name: 'Mock Result',
        version: '1.0',
        metadata: { mock: true },
        classes: [],
        relations: [],
        axioms: [],
        instances: [],
        vocabulary: {}
      },
      metadata: {
        operation: 'unknown',
        mock: true
      }
    };
  }

  /**
   * Test the LLM connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    if (!this.apiKey) {
      console.log('No API key configured - will use mock responses');
      return true; // Mock mode is always "connected"
    }

    try {
      const testPrompt = 'Respond with valid JSON: {"status": "ok", "message": "test successful"}';
      const response = await this.execute(testPrompt);
      return response.status === 'ok';
    } catch (error) {
      console.error('LLM connection test failed:', error);
      return false;
    }
  }
}

/**
 * Create and configure LLM service instance
 * @param {Object} config - Configuration options
 * @returns {LLMService}
 */
export function createLLMService(config) {
  return new LLMService(config);
}
