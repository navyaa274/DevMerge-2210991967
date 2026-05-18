// AI Service Configuration
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// OpenAI Configuration - only initialize if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Anthropic Configuration - only initialize if API key is available
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

class AIServiceManager {
  constructor() {
    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
    this.providers = {
      openai: {
        client: openai,
        models: {
          tutor: process.env.OPENAI_TUTOR_MODEL || 'gpt-4-turbo-preview',
          predictive: process.env.OPENAI_PREDICTIVE_MODEL || 'gpt-3.5-turbo',
          content_generation: process.env.OPENAI_CONTENT_MODEL || 'gpt-4-turbo-preview'
        }
      },
      anthropic: {
        client: anthropic,
        models: {
          tutor: process.env.ANTHROPIC_TUTOR_MODEL || 'claude-3-opus-20240229',
          predictive: process.env.ANTHROPIC_PREDICTIVE_MODEL || 'claude-3-sonnet-20240229',
          content_generation: process.env.ANTHROPIC_CONTENT_MODEL || 'claude-3-opus-20240229'
        }
      }
    };
  }

  // Get the appropriate AI client and model
  getClient(provider = null, useCase = 'tutor') {
    const aiProvider = provider || this.defaultProvider;

    if (!this.providers[aiProvider]) {
      throw new Error(`AI provider '${aiProvider}' not configured`);
    }

    return {
      client: this.providers[aiProvider].client,
      model: this.providers[aiProvider].models[useCase],
      provider: aiProvider
    };
  }

  // Generate AI response for tutoring
  async generateTutorResponse(message, context, tutor, conversationHistory = []) {
    const { client, model, provider } = this.getClient(context.preferredProvider, 'tutor');

    try {
      // Build conversation context
      const systemPrompt = this.buildTutorSystemPrompt(tutor, context);
      const messages = this.buildConversationMessages(systemPrompt, conversationHistory, message);

      let response;

      if (provider === 'openai') {
        response = await client.chat.completions.create({
          model: model,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        });

        return {
          response: response.choices[0].message.content,
          confidence: this.calculateConfidence(response),
          tokens_used: response.usage.total_tokens,
          suggestions: this.extractSuggestions(response.choices[0].message.content),
          provider,
          model
        };
      } else if (provider === 'anthropic') {
        const anthropicMessages = messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content
        }));

        response = await client.messages.create({
          model: model,
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages: anthropicMessages
        });

        return {
          response: response.content[0].text,
          confidence: 0.85, // Anthropic doesn't provide confidence scores
          tokens_used: response.usage.input_tokens + response.usage.output_tokens,
          suggestions: this.extractSuggestions(response.content[0].text),
          provider,
          model
        };
      }

    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  // Generate content using AI
  async generateContent(prompt, contentType, context = {}) {
    const { client, model, provider } = this.getClient(null, 'content_generation');

    try {
      const systemPrompt = this.buildContentGenerationPrompt(contentType, context);

      if (provider === 'openai') {
        const response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.8
        });

        return {
          content: response.choices[0].message.content,
          tokens_used: response.usage.total_tokens,
          provider,
          model
        };
      } else if (provider === 'anthropic') {
        const response = await client.messages.create({
          model: model,
          max_tokens: 2000,
          temperature: 0.8,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }]
        });

        return {
          content: response.content[0].text,
          tokens_used: response.usage.input_tokens + response.usage.output_tokens,
          provider,
          model
        };
      }

    } catch (error) {
      console.error('Content Generation Error:', error);
      throw new Error(`Content generation error: ${error.message}`);
    }
  }

  // Analyze learning patterns for predictions
  async analyzeLearningPatterns(userData, historicalData) {
    const { client, model, provider } = this.getClient(null, 'predictive');

    try {
      const prompt = this.buildPredictionPrompt(userData, historicalData);

      if (provider === 'openai') {
        const response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: 'You are an expert educational data analyst specializing in student performance prediction and learning analytics.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 800,
          temperature: 0.3
        });

        return this.parsePredictionResponse(response.choices[0].message.content);
      } else if (provider === 'anthropic') {
        const response = await client.messages.create({
          model: model,
          max_tokens: 800,
          temperature: 0.3,
          system: 'You are an expert educational data analyst specializing in student performance prediction and learning analytics.',
          messages: [{ role: 'user', content: prompt }]
        });

        return this.parsePredictionResponse(response.content[0].text);
      }

    } catch (error) {
      console.error('Prediction Analysis Error:', error);
      // Return fallback predictions
      return {
        completion_probability: 0.7,
        predicted_grade: 'B',
        risk_level: 'medium',
        recommendations: ['Continue current study pace', 'Focus on weak areas'],
        confidence: 0.6
      };
    }
  }

  // Build system prompt for AI tutor
  buildTutorSystemPrompt(tutor, context) {
    return `You are ${tutor.name}, an expert ${tutor.subject} tutor specializing in ${tutor.specialization?.join(', ') || 'teaching'}.

Your personality is ${tutor.personality}. You have expertise in: ${tutor.capabilities?.join(', ') || 'teaching'}.

Context:
- Course: ${context.course_title || 'General'}
- Topic: ${context.topic || 'General learning'}
- Student level: ${context.difficulty_level || 'intermediate'}

Guidelines:
1. Be encouraging and patient
2. Explain concepts clearly with examples
3. Adapt to the student's level
4. Ask questions to check understanding
5. Provide step-by-step solutions when appropriate
6. Suggest additional resources when relevant

Always provide helpful, accurate responses and maintain a supportive learning environment.`;
  }

  // Build conversation messages for AI
  buildConversationMessages(systemPrompt, history, newMessage) {
    const messages = [{ role: 'system', content: systemPrompt }];

    // Add recent conversation history (last 10 messages to avoid token limits)
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    messages.push({ role: 'user', content: newMessage });
    return messages;
  }

  // Build content generation prompt
  buildContentGenerationPrompt(contentType, context) {
    const prompts = {
      syllabus: 'Create a comprehensive course syllabus with learning objectives, topics, and assessment methods.',
      lesson: 'Create an engaging lesson plan with objectives, content outline, activities, and assessments.',
      quiz: 'Generate quiz questions with multiple choice, true/false, and short answer questions.',
      exercise: 'Create coding exercises or practice problems with solutions and hints.',
      explanation: 'Provide a clear, step-by-step explanation of the given concept.'
    };

    return `You are an expert educational content creator. ${prompts[contentType] || 'Create high-quality educational content.'}

Context: ${JSON.stringify(context)}

Ensure the content is:
- Age-appropriate and educationally sound
- Engaging and well-structured
- Aligned with learning objectives
- Inclusive and accessible
- Properly formatted for easy reading`;
  }

  // Build prediction analysis prompt
  buildPredictionPrompt(userData, historicalData) {
    return `Analyze the following student data and predict their academic performance:

Student Data:
${JSON.stringify(userData, null, 2)}

Historical Patterns:
${JSON.stringify(historicalData, null, 2)}

Provide predictions for:
1. Course completion probability (0-1 scale)
2. Predicted final grade (A, B, C, D, F)
3. Risk level (low, medium, high)
4. Key recommendations for improvement
5. Confidence in prediction (0-1 scale)

Format your response as JSON with these exact keys: completion_probability, predicted_grade, risk_level, recommendations (array), confidence.`;
  }

  // Parse prediction response
  parsePredictionResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      const lines = response.split('\n');
      return {
        completion_probability: 0.7,
        predicted_grade: 'B',
        risk_level: 'medium',
        recommendations: ['Continue current study pace'],
        confidence: 0.6
      };
    } catch (error) {
      console.error('Error parsing prediction response:', error);
      return {
        completion_probability: 0.7,
        predicted_grade: 'B',
        risk_level: 'medium',
        recommendations: ['Continue current study pace'],
        confidence: 0.6
      };
    }
  }

  // Calculate confidence from OpenAI response
  calculateConfidence(response) {
    // Simple confidence calculation based on response characteristics
    const content = response.choices[0].message.content;
    const length = content.length;
    const finishReason = response.choices[0].finish_reason;

    let confidence = 0.8; // Base confidence

    if (finishReason === 'stop') confidence += 0.1;
    if (length > 100) confidence += 0.05;
    if (length < 50) confidence -= 0.1;

    return Math.min(Math.max(confidence, 0), 1);
  }

  // Extract suggestions from AI response
  extractSuggestions(content) {
    const suggestions = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.toLowerCase().includes('suggestion') ||
          line.toLowerCase().includes('recommend') ||
          line.toLowerCase().includes('try') ||
          line.toLowerCase().includes('consider')) {
        suggestions.push(line.trim());
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  // Check if AI services are available
  async checkAvailability() {
    const availability = {};

    for (const [provider, config] of Object.entries(this.providers)) {
      try {
        if (provider === 'openai') {
          await config.client.models.list();
          availability[provider] = true;
        } else if (provider === 'anthropic') {
          await config.client.messages.create({
            model: config.models.tutor,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test' }]
          });
          availability[provider] = true;
        }
      } catch (error) {
        console.warn(`${provider} AI service unavailable:`, error.message);
        availability[provider] = false;
      }
    }

    return availability;
  }
}

module.exports = new AIServiceManager();
