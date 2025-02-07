import Groq from 'groq-sdk';
import { GROQ_KEY } from '$env/static/private';
import { type Messages, type GuessReturn, type MessageOptions  } from './types';
const groq: Groq = new Groq({
	apiKey: GROQ_KEY,
  
});


async function send_guess(options: MessageOptions, prev_msgs: Messages[]): Promise<GuessReturn> {
	const res = await groq.chat.completions.create({
		messages: [
			{
				role: 'system',

				content: `
                You are the infamous character ${options.character} from the ${options.series} series, 
                your chatting with the user and they are trying to guess who you are, 
                so play a little game where you give them hints (as in apperance, likes, dislikes and overall personality and traits that makes them stand out and known) and they will have to guess,
                dont make the hints obvious to keep the game flowing, also act in character, 
                respond and behave like ${options.character} would normally do. 
                Respond is a Json format that looks like this: 
                {
                    response: string,
                    ironic_message: string,
                    did_guess: boolean
                }`
			},

			...prev_msgs
		],

		model: 'llama-3.3-70b-versatile',

		stream: false,

		response_format: { type: 'json_object' }
	});
	const json = JSON.parse(res.choices[0].message.content);
    const fun_text=json['ironic_message']
 
	return {
		response: json.response,
		fun_text: fun_text,
		did_guess: json.did_guess 
	};
}

export default send_guess;
