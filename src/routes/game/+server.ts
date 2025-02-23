import send_guess from '$lib/groq';
import getRandomCharacter from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { character, series, messages } = await request.json();
  
    let { did_guess, response, fun_text } = await send_guess(
        {
            character,
            series
        },
        messages
    );

    return json({
        did_guess,
        response,
        fun_text
    })
};