'use server'

import { createClient } from '@/lib/supabase/server'

export async function signIn(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  console.log('Attempting to sign in with:', { email })
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return { error: error.message }
    }

    console.log('Login successful, user:', data.user)
    
    // Verify the session
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session after login:', session)
    
    if (!session) {
      console.error('No session after login')
      return { error: 'Failed to create session' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error during login:', err)
    return { error: 'An unexpected error occurred' }
  }
}