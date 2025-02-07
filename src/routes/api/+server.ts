
import {updateUserdata} from '$lib/supabase';
import { json, type RequestHandler } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request }) => {
    let {points,solved} = await request.json()
   let error = await updateUserdata({points, solved})

   return json({
        error
   })
}