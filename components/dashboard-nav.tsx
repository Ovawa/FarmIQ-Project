"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, MapPin, BarChart3, TrendingUp, Settings, Menu, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: {
    email?: string
    user_metadata?: {
      first_name?: string
      last_name?: string
    }
  }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Fields", href: "/dashboard/fields", icon: MapPin },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Predictions", href: "/dashboard/predictions", icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    setIsLoading(false)
  }

  const userInitials =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`
      : user.email?.[0]?.toUpperCase() || "U"

  const userName =
    user.user_metadata?.first_name && user.user_metadata?.last_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
      : user.email

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center mr-6">
          <img 
            src="/Logo-nobg.png" 
            alt="FarmIQ" 
            className="h-12 w-auto"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-green-600 relative pb-1 group",
                  pathname === item.href ? "text-green-600 font-semibold" : "text-green-700",
                )}
              >
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <span className={cn(
                    "h-0.5 bg-green-600 transition-all duration-300 mt-1",
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Menu and Mobile Navigation */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  disabled={isLoading}
                  className="cursor-pointer text-red-600 hover:!bg-red-50 hover:!text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex justify-center mb-6">
                <img 
                  src="/Logo-nobg.png" 
                  alt="FarmIQ" 
                  className="h-12 w-auto"
                />
              </div>
              <nav className="flex flex-col space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-green-50",
                        pathname === item.href ? "bg-green-100 text-green-700" : "text-green-600 hover:text-green-700",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
                <div className="border-t border-green-100 my-2"></div>
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
