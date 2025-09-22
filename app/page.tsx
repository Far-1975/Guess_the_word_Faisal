"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GameGrid } from "@/components/game-grid"
import { LoginForm } from "@/components/login-form"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Sparkles, Trophy, User } from "lucide-react"

// Word list for the game
const WORD_LIST = [
  "AUDIO",
  "HOMER",
  "JOKER",
  "TONER",
  "TOWER",
  "CRANE",
  "SLATE",
  "ADIEU",
  "RAISE",
  "ROAST",
  "LEAST",
  "BEAST",
  "FEAST",
  "COAST",
  "TOAST",
  "BOAST",
  "GHOST",
  "FROST",
  "TRUST",
  "BLAST",
]

interface GameUser {
  username: string
  isAdmin: boolean
  gamesPlayedToday: number
  lastPlayDate: string
}

interface GameState {
  currentWord: string
  guesses: string[]
  currentGuess: string
  gameStatus: "playing" | "won" | "lost"
  attempts: number
}

export default function WordGame() {
  const [user, setUser] = useState<GameUser | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    // Check for existing user session
    const savedUser = localStorage.getItem("wordGameUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const startNewGame = () => {
    if (!user) return

    const today = new Date().toDateString()
    if (user.lastPlayDate !== today) {
      user.gamesPlayedToday = 0
      user.lastPlayDate = today
    }

    if (user.gamesPlayedToday >= 3) {
      alert("You have reached your daily limit of 3 games!")
      return
    }

    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setGameState({
      currentWord: randomWord,
      guesses: [],
      currentGuess: "",
      gameStatus: "playing",
      attempts: 0,
    })

    // Update user's game count
    const updatedUser = { ...user, gamesPlayedToday: user.gamesPlayedToday + 1 }
    setUser(updatedUser)
    localStorage.setItem("wordGameUser", JSON.stringify(updatedUser))
  }

  const handleLogin = (username: string, password: string) => {
    // Admin username: "Admin" (has both upper and lower case)
    // Admin password: "Admin123@" (has alphabet + number + special char)
    const isAdmin = username === "Admin" && password === "Admin123@"
    const newUser: GameUser = {
      username,
      isAdmin,
      gamesPlayedToday: 0,
      lastPlayDate: new Date().toDateString(),
    }
    setUser(newUser)
    localStorage.setItem("wordGameUser", JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setUser(null)
    setGameState(null)
    setShowAdmin(false)
    localStorage.removeItem("wordGameUser")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <Card className="w-full max-w-md glass-card shadow-2xl border-0 relative z-10">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                WordCraft
              </CardTitle>
              <p className="text-muted-foreground text-lg">{"Discover the hidden word in 5 elegant attempts"}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm onLogin={handleLogin} />
            <div className="text-center text-sm text-muted-foreground">
              <p>{"Admin: Admin / Admin123@"}</p>
              <p>{"Player: any valid username / password"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showAdmin && user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">{"Manage your WordCraft experience"}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAdmin(false)} className="shadow-sm">
                Back to Game
              </Button>
              <Button variant="outline" onClick={handleLogout} className="shadow-sm bg-transparent">
                Logout
              </Button>
            </div>
          </div>
          <AdminDashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WordCraft
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-lg">
                {"Welcome back, "}
                {user.username}
                {"!"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium shadow-sm">
              <Trophy className="w-4 h-4 mr-2" />
              {"Games Today: "}
              {user.gamesPlayedToday}
              {"/3"}
            </Badge>
            {user.isAdmin && (
              <Button variant="outline" onClick={() => setShowAdmin(true)} className="shadow-sm">
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="shadow-sm bg-transparent">
              Logout
            </Button>
          </div>
        </div>

        {/* Game Area */}
        <Card className="glass-card shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-2xl font-semibold text-balance">{"Discover the Hidden Word"}</CardTitle>
            <p className="text-muted-foreground text-pretty">
              {"Use your intuition and logic to uncover the 5-letter mystery word in just 5 attempts"}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pb-8">
            {gameState ? (
              <GameGrid
                gameState={gameState}
                setGameState={setGameState}
                onGameEnd={(won) => {
                  // Save game result to localStorage for admin tracking
                  const gameResult = {
                    username: user.username,
                    word: gameState.currentWord,
                    guesses: gameState.guesses,
                    won,
                    date: new Date().toISOString(),
                    attempts: gameState.attempts,
                  }

                  const existingResults = JSON.parse(localStorage.getItem("gameResults") || "[]")
                  existingResults.push(gameResult)
                  localStorage.setItem("gameResults", JSON.stringify(existingResults))
                }}
              />
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-medium">{"Ready for a new challenge?"}</p>
                  <p className="text-muted-foreground">{"Test your vocabulary and deduction skills"}</p>
                </div>
                <Button onClick={startNewGame} size="lg" className="px-8 py-3 text-lg shadow-lg">
                  Start New Game
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
