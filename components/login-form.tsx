"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onLogin: (username: string, password: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateUsername = (username: string): string | null => {
    if (username.length < 5) {
      return "Username must be at least 5 characters long"
    }

    const hasUpperCase = /[A-Z]/.test(username)
    const hasLowerCase = /[a-z]/.test(username)

    if (!hasUpperCase || !hasLowerCase) {
      return "Username must include both upper and lower case letters"
    }

    return null
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 5) {
      return "Password must be at least 5 characters long"
    }

    const hasAlphabet = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[$%*@]/.test(password)

    if (!hasAlphabet) {
      return "Password must include alphabetic characters"
    }

    if (!hasNumber) {
      return "Password must include at least one number"
    }

    if (!hasSpecialChar) {
      return "Password must include one of: $ % * @"
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const usernameError = validateUsername(username)
    if (usernameError) {
      alert(usernameError)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      alert(passwordError)
      return
    }

    onLogin(username, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="username" className="text-sm font-medium text-foreground">
          Username
        </Label>
        <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username..."
          className="h-12 rounded-xl border-2 focus:border-primary/50 transition-colors"
          required
        />
        <p className="text-xs text-muted-foreground">Must be ≥5 chars and include both upper & lower case</p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password..."
            className="h-12 rounded-xl border-2 focus:border-primary/50 transition-colors pr-12"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Must be ≥5 chars and include alphabet + number + one of $ % * @</p>
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl text-lg font-medium shadow-lg">
        {isRegistering ? (
          <>
            <UserPlus className="w-5 h-5 mr-2" />
            Create Account
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </>
        )}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isRegistering ? "Already have an account? Sign in" : "Need an account? Create one"}
        </Button>
      </div>
    </form>
  )
}
