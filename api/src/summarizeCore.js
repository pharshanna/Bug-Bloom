// api/src/summarizeCore.js — the "Grove Spirit" AI summary. Owned by Person 3.
//
// Takes a project + all of its feedback and asks Azure OpenAI to turn it into
// top problems, strengths and a prioritized to-do list.
// Used by BOTH:
//   • the Azure Function (api/src/functions/summarize.js) on the live site
//   • the local dev server (vite.config.js) when you run `npm run dev`
//
// Settings (never put these in GitHub — use .env locally and Azure "Environment variables" online):
//   AZURE_OPENAI_ENDPOINT    the "Azure OpenAI endpoint" from Foundry, e.g. https://my-resource.openai.azure.com/openai/v1/
//   AZURE_OPENAI_KEY         the key from the Azure portal
//   AZURE_OPENAI_DEPLOYMENT  the deployment name you chose in Foundry, e.g. gpt-4.1-mini
//   GEMINI_API_KEY           (optional backup if Azure OpenAI isn't available)

const MAX_TESTS = 40;

const SYSTEM_PROMPT = `You are the Grove Spirit, a warm and practical guide in "Bug & Bloom", an app where student developers test each other's unfinished projects.
You read user-testing feedback and turn it into clear, actionable insights for the student who built the project.
Be specific, kind and concise. Group similar feedback together. Use simple language a first-year student understands.
Respond ONLY with JSON in exactly this shape:
{
  "problems": ["...", "...", "..."],        // up to 3 most important issues testers hit, most important first
  "strengths": ["...", "...", "..."],       // up to 3 things testers liked
  "todo": ["...", "...", "..."],            // up to 5 concrete next steps, most impactful first, each starting with a verb
  "encouragement": "..."                    // one short, warm sentence, may use a forest/growing metaphor
}`;

function userError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  err.expose = true; // safe to show this message to the user
  return err;
}

function clip(text, max = 500) {
  const s = String(text ?? '').trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function buildPrompt(project = {}, tests = []) {
  const lines = tests.slice(0, MAX_TESTS).map((t, i) =>
    [
      `Tester ${i + 1} (rating ${Number(t.rating) || '?'}/5):`,
      `  Liked: ${clip(t.liked)}`,
      `  Confused by: ${clip(t.confused)}`,
      t.suggestion ? `  Suggestion: ${clip(t.suggestion)}` : null,
    ].filter(Boolean).join('\n')
  );
  return [
    `Project: ${clip(project.title, 120) || 'Untitled'}`,
    project.description ? `Description: ${clip(project.description, 400)}` : null,
    project.testRequest ? `The builder asked testers to focus on: ${clip(project.testRequest, 300)}` : null,
    '',
    `Feedback from ${lines.length} tester(s):`,
    ...lines,
  ].filter((l) => l !== null).join('\n');
}

// Makes sure the AI's answer always has the shape the frontend expects.
export function cleanResult(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    const match = raw.match(/\{[\s\S]*\}/); // tolerate ```json fences or extra text
    if (!match) throw new Error('AI did not return JSON');
    data = JSON.parse(match[0]);
  }
  const list = (v, n) => (Array.isArray(v) ? v.map((x) => clip(x, 300)).filter(Boolean).slice(0, n) : []);
  return {
    problems: list(data.problems, 3),
    strengths: list(data.strengths, 3),
    todo: list(data.todo, 5),
    encouragement: clip(data.encouragement, 300),
  };
}

// Turns whatever endpoint was pasted into the base URL, e.g.
//   https://x.openai.azure.com/openai/v1/   →  https://x.openai.azure.com
export function azureBase(endpoint = '') {
  return endpoint.trim().replace(/\/+$/, '').replace(/\/openai(\/.*)?$/i, '');
}

// Uses the Azure OpenAI "v1" API, which works with every current model
// (gpt-4o-mini, gpt-4.1-mini, gpt-5-mini, newer ones…) without an api-version.
async function callAzure(prompt, env) {
  const url = `${azureBase(env.AZURE_OPENAI_ENDPOINT)}/openai/v1/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.AZURE_OPENAI_KEY.trim() },
    body: JSON.stringify({
      model: (env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini').trim(),
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      // no temperature / max_tokens: newer reasoning models reject them
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Azure OpenAI error ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

async function callGemini(prompt, env) {
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini error ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

// Main entry point. body = { project, tests }, env = process.env (or .env values)
export async function summarizeFeedback(body, env = {}) {
  const { project, tests } = body || {};
  if (!Array.isArray(tests) || tests.length === 0) {
    throw userError('There’s no feedback to summarize yet. Ask someone to test this project first! 🌱');
  }

  const prompt = buildPrompt(project, tests);

  let raw;
  let provider;
  if (env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_KEY) {
    raw = await callAzure(prompt, env);
    provider = 'Azure OpenAI';
  } else if (env.GEMINI_API_KEY) {
    raw = await callGemini(prompt, env);
    provider = 'Gemini';
  } else {
    throw userError('The AI isn’t set up yet. Add the Azure OpenAI settings (see api/README.md).', 503);
  }

  return { ...cleanResult(raw), provider, testCount: tests.length };
}
