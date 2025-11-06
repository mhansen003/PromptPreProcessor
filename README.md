# PromptPreProcessor ⚡

A beautiful, next-generation dashboard for configuring AI prompt preprocessing with precision controls. Built with Next.js, TypeScript, and a Robinhood-inspired design aesthetic.

## Features

- **🎨 Comprehensive Controls**: Sliders, toggles, and selectors for every aspect of prompt behavior
- **💾 Configuration Management**: Save, load, duplicate, and manage multiple prompt configurations
- **🤖 OpenAI Integration**: Automatically generate optimized system prompts from your settings
- **🎯 Granular Settings**: Control detail level, formality, technical depth, tone, structure, and more
- **💫 Beautiful UI**: Sleek, dark-mode Robinhood-inspired interface
- **📱 Responsive Design**: Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mhansen003/PromptPreProcessor.git
cd PromptPreProcessor
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration Controls

### Response Style
- **Detail Level**: Concise ↔ Extremely Detailed
- **Formality**: Casual ↔ Formal
- **Technical Depth**: Simple ↔ Highly Technical
- **Creativity**: Factual ↔ Creative
- **Verbosity**: Brief ↔ Lengthy

### Tone & Personality
- **Enthusiasm**: Neutral ↔ Enthusiastic
- **Empathy**: Objective ↔ Empathetic
- **Confidence**: Cautious ↔ Assertive
- **Humor**: Serious ↔ Humorous

### Response Structure
- Include Examples
- Use Bullet Points
- Use Numbered Lists
- Include Code Samples
- Include Analogies
- Visual Descriptions

### Advanced Settings
- Response Length (Auto, Short, Medium, Long, Comprehensive)
- Perspective (1st/2nd/3rd person)
- Target Audience (General, Technical, Executive, Beginner, Expert)
- Explanation Style (Direct, Socratic, Narrative, Analytical)
- Priority Flags (Accuracy, Speed, Clarity, Comprehensiveness)

## Usage

1. **Create a Configuration**: Click "New" to create a fresh configuration
2. **Adjust Controls**: Use sliders, toggles, and dropdowns to set your preferences
3. **Generate Prompt**: Click "Generate Prompt" to create an optimized system prompt
4. **Copy & Use**: Copy the generated prompt to use in your AI projects
5. **Save & Manage**: Your configurations are automatically saved locally

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

```bash
vercel
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **AI Integration**: OpenAI API
- **Animations**: Framer Motion

## License

MIT

## Author

Built with ❤️ for the AI community
