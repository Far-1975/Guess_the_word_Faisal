"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Target, Trash2, TrendingUp, Calendar, Award } from "lucide-react"

interface GameResult {
  username: string
  word: string
  guesses: string[]
  won: boolean
  date: string
  attempts: number
}

export function AdminDashboard() {
  const [gameResults, setGameResults] = useState<GameResult[]>([])

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem("gameResults") || "[]")
    setGameResults(results)
  }, [])

  const totalGames = gameResults.length
  const wonGames = gameResults.filter((r) => r.won).length
  const winRate = totalGames > 0 ? ((wonGames / totalGames) * 100).toFixed(1) : "0"
  const uniquePlayers = new Set(gameResults.map((r) => r.username)).size

  const playerStats = gameResults.reduce(
    (acc, result) => {
      if (!acc[result.username]) {
        acc[result.username] = { total: 0, won: 0 }
      }
      acc[result.username].total++
      if (result.won) acc[result.username].won++
      return acc
    },
    {} as Record<string, { total: number; won: number }>,
  )

  const clearData = () => {
    if (confirm("Are you sure you want to clear all game data?")) {
      localStorage.removeItem("gameResults")
      setGameResults([])
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Games</CardTitle>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalGames}</div>
            <p className="text-xs text-muted-foreground mt-1">Games played total</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Games Won</CardTitle>
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{wonGames}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful completions</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Success percentage</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Players</CardTitle>
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{uniquePlayers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Statistics */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Player Leaderboard</CardTitle>
              <p className="text-sm text-muted-foreground">Performance statistics by player</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={clearData} className="shadow-sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(playerStats)
              .sort(([, a], [, b]) => b.won / b.total - a.won / a.total)
              .map(([username, stats], index) => (
                <div
                  key={username}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{username}</p>
                      <p className="text-sm text-muted-foreground">{stats.total} games played</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={stats.won > stats.total / 2 ? "default" : "secondary"} className="shadow-sm">
                      {stats.won}/{stats.total} won
                    </Badge>
                    <p className="text-sm font-medium text-muted-foreground">
                      {((stats.won / stats.total) * 100).toFixed(1)}% success rate
                    </p>
                  </div>
                </div>
              ))}
            {Object.keys(playerStats).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No player data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Games */}
      <Card className="glass-card border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">Latest game results and outcomes</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gameResults
              .slice(-10)
              .reverse()
              .map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${result.won ? "bg-emerald-500" : "bg-slate-400"}`} />
                    <div>
                      <p className="font-medium text-foreground">{result.username}</p>
                      <p className="text-sm text-muted-foreground">
                        Word: <span className="font-mono font-medium">{result.word}</span> • {result.attempts} attempts
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(result.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant={result.won ? "default" : "secondary"} className="shadow-sm">
                    {result.won ? "Won" : "Lost"}
                  </Badge>
                </div>
              ))}
            {gameResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No game history available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
