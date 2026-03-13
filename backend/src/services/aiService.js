const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getAICodeReview = async (code, language, metrics, violations, status) => {
  try {
    const prompt = `You are an expert code reviewer. Review this ${language} code and provide helpful feedback.

CODE:
\`\`\`${language}
${code}
\`\`\`

EVALUATION RESULTS:
- Test Status: ${status}
- Lines of Code: ${metrics.loc}
- Cyclomatic Complexity: ${metrics.complexity}
- Comment Density: ${metrics.commentDensity}%
- Code Duplication: ${metrics.duplication}%
- Max Function Length: ${metrics.functionLength}
- Max Nesting Depth: ${metrics.ifElseDepth}
- Number of Loops: ${metrics.loops}

VIOLATIONS FOUND:
${violations.length > 0 ? violations.map(v => `- [${v.severity}] ${v.message}`).join('\n') : 'None'}

Please provide a code review with these sections:
1. Overall Assessment (2-3 sentences)
2. What's Good (2-3 bullet points)
3. What to Improve (2-3 specific suggestions)
4. Time & Space Complexity (brief analysis)
5. Rewritten Example (show a cleaner version if needed, max 15 lines)

Keep the review concise, constructive and beginner-friendly.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      max_tokens: 1000,
      temperature: 0.7
    });

    return {
      success: true,
      review: completion.choices[0]?.message?.content || 'No review generated'
    };
  } catch (error) {
    console.error('Groq API error:', error.message);
    return {
      success: false,
      review: null,
      error: error.message
    };
  }
};

module.exports = { getAICodeReview };