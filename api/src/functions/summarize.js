// api/src/functions/summarize.js — Azure Function: POST /api/summarize. Owned by Person 3.
// Azure Static Web Apps runs this automatically from the `api` folder.
import { app } from '@azure/functions';
import { summarizeFeedback } from '../summarizeCore.js';

app.http('summarize', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const result = await summarizeFeedback(body, process.env);
      return { jsonBody: result };
    } catch (err) {
      context.error(err);
      return {
        status: err.status || 500,
        jsonBody: {
          error: err.expose ? err.message : 'The Grove Spirit is resting. Please try again in a moment.',
        },
      };
    }
  },
});
