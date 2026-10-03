# Bug & Bloom AI: setup (Person 3)

The **"✨ Summarize feedback"** button on each project page sends all of that project's feedback to
**Azure OpenAI**, which returns the top problems, strengths and a to-do list.

| File | What it does |
|---|---|
| `api/src/summarizeCore.js` | Builds the prompt, calls Azure OpenAI (or Gemini as a backup), cleans the answer |
| `api/src/functions/summarize.js` | The Azure Function at `POST /api/summarize` on the live site |
| `vite.config.js` | Makes `/api/summarize` work on your laptop with `npm run dev` |
| `src/components/ai/AISummary.jsx` | The button + results on the project page |
| `public/staticwebapp.config.json` | Tells Azure to use Node 20 and to send page links like `/project/abc` to the React app |

## 1. Create Azure OpenAI

1. Activate **Azure for Students** at azure.microsoft.com/free/students.
2. Go to portal.azure.com → **Create a resource** → search **Azure OpenAI** → **Create**.
   - Resource group: **Create new** → `bug-bloom`
   - Region: **East US** (or any region it allows)
   - Name: `bug-bloom-ai`
   - Pricing tier: **Standard S0** → **Review + create** → **Create**
3. Open the resource → **Go to Azure AI Foundry portal** → **Deployments** → **Deploy model** → **Deploy base model** → choose **gpt-4o-mini** → **Confirm** → **Deploy**. Remember the deployment name (e.g. `gpt-4o-mini`).
4. Back on the resource in portal.azure.com → **Keys and Endpoint** → copy **KEY 1** and the **Endpoint**.

> If Azure OpenAI isn't available on your student account, ask the Avanade sponsor table first.
> Backup: get a free Gemini key at aistudio.google.com/apikey and use `GEMINI_API_KEY` instead.

## 2. Run it on your laptop

1. In the project folder, copy `.env.example` to a new file named `.env`.
2. Fill in `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY` and `AZURE_OPENAI_DEPLOYMENT`.
3. Restart `npm run dev`, open a project that has feedback, and click **✨ Summarize feedback**.

`.env` is in `.gitignore`, so your key never goes to GitHub.

## 3. Put the site online (Azure Static Web Apps)

1. portal.azure.com → **Create a resource** → **Static Web App** → **Create**.
   - Resource group: `bug-bloom` · Name: `bug-bloom` · Plan: **Free**
   - Source: **GitHub** → sign in → Organization: your account · Repository: `bug-bloom` · Branch: `main`
   - Build presets: **React**
   - App location: `/` · Api location: `api` · Output location: `dist`
   - **Review + create** → **Create**
2. Azure adds a GitHub Actions file to the repo and builds the site. Watch it in the repo's **Actions** tab (2–4 min).
3. In the Static Web App → **Settings → Environment variables** → add the same three `AZURE_OPENAI_...` values → **Apply**.
4. Copy the site URL (like `https://xxxx.azurestaticapps.net`).
5. **Firebase:** console → Authentication → Settings → **Authorized domains** → **Add domain** → paste the URL without `https://`. (Without this, login fails on the live site.)

Every push to `main` redeploys the site automatically.
