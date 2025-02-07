import {signIn, getUserdata} from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    let { mode, email, username, password } = await request.json();
    let success = await signIn(mode, {
        email,
        username,
        password
    })
    return json({success});
}


export const GET: RequestHandler = async ({request}) => {
    let res = await getUserdata();
    if (res) {
        let { points, username, solved } = res
        solved = solved || []
    
        return json({ points, username, solved });
    } else {
        return json({error: "not logged"})
    }
}