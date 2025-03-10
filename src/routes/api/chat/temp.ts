import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import type { RequestHandler } from './$types';
import { generateSQL } from './getSQLData';
import { runSQL } from './runSQL';
import { z } from 'zod';

import { env } from '$env/dynamic/private';

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY ?? '',
});

async function getTeamData(messages) {
    const queryResponse = await generateSQL(messages);
    const queryData = await queryResponse.json();
    const sqlQuery = queryData.newSqlQuery;
    const dbResponse = await runSQL(sqlQuery);
    const dbData = await dbResponse.json();
    return { sqlQuery, dbData };
}

export const POST = (async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages
  });

  return result.toDataStreamResponse();
}) satisfies RequestHandler;