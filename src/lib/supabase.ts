import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY } from '$env/static/private';

const supabaseUrl = 'https://sgvkmwnesmllzgmdpddw.supabase.co';
const supabase = createClient(supabaseUrl, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

interface Credentials {
    username?: string,
    email: string,
    password: string
}

async function getUserdata() {
    // Check for an existing session first. This is crucial for handling refreshes.
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {  // Only proceed if a session exists
        let res = await supabase.auth.getUser();
        if (res.error) {
            console.error("Error getting user data:", res.error); // Log the error!
            return null;
        }
        return {
            username: res.data.user?.user_metadata?.username,
            solved: res.data.user?.user_metadata?.solved || [],
            points: res.data.user?.user_metadata?.points || 0
        };
    } else {
        console.log("No session found on refresh.");
        return null; // Or handle the unauthenticated case appropriately
    }
}

async function updateUserdata(new_data) {
    let res = await supabase.auth.updateUser({
        data: {
            ...new_data
        }
    })
    console.log(res)
    return res.error
}

async function signIn(method: string, credentials: Credentials) {
    if (method === 'login') {
        const login = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
        });

        if (login.error) {
            if (login.error.code === 'email_not_confirmed') {
                return 'unconfirmed'
            }
            return false
        }
    } else {
        const login = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    username: credentials.username,
                    solved: [],
                    points: 0
                }
            }
        })
        if (login.error) {
            return false
        }
    }

    return true
}

async function getRandomCharacter() {
    const userData = await getUserdata(); // Get user data using the improved function

    if (!userData) {
        console.log("User not authenticated, cannot get random character.");
        return null; // Handle the case where the user is not logged in.
    }

    let { solved } = userData;

    let { data: Characters, error } = await supabase.from('Characters').select('*');

    if (error) {
        console.error("Error fetching characters:", error); // Log the error!
        return null;
    }

    if (!solved) {
        solved = []; // Ensure solved is an array, even if getUserdata returned null
    }


    Characters = Characters.filter((char) => {
        let obj = (({ id, created_at, ...o }) => o)(char);
        return !solved.includes(obj); // Compare IDs, not the whole object
    });

    console.log(Characters.length);
    return Characters[Math.floor(Math.random() * Characters.length)];
}

export default getRandomCharacter;

export {
    signIn,
    getUserdata,
    updateUserdata
}
