import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Basic runtime checks to surface clearer errors in the browser
  if (!url || !key) {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase client initialization error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.",
      { urlPresent: !!url, keyPresent: !!key }
    )
    throw new Error("Missing Supabase public URL or anon key. Check your .env.local and restart the dev server.")
  }

  // eslint-disable-next-line no-console
  console.debug("Initializing Supabase client with URL:", url)

  return createBrowserClient(url, key)
}
