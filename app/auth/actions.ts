"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[v0] Login attempt for email:", email)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Login error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Login successful for user:", data.user?.id)
  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const farmName = formData.get("farmName") as string
  const region = formData.get("region") as string
  const phone = formData.get("phone") as string

  console.log("[v0] Signup attempt for email:", email, "region:", region)

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
    },
  })

  if (authError) {
    console.log("[v0] Signup error:", authError.message)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  console.log("[v0] Auth user created:", authData.user.id)

  // Create profile record
  const { error: profileError } = await supabase.from("profiles").insert({
    user_id: authData.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    farm_name: farmName,
    region,
    phone,
  })

  if (profileError) {
    console.log("[v0] Profile creation error:", profileError.message)
    return { error: `Failed to create profile: ${profileError.message}` }
  }

  console.log("[v0] Profile created successfully")
  revalidatePath("/", "layout")
  redirect("/dashboard")
}
