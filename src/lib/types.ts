
export interface Messages {
	role: string;
	content: string;
}

export interface GuessReturn {
	response: string;
	fun_text: string;
	did_guess: boolean;
}

export interface MessageOptions {
	character: string;
	series: string;
}
