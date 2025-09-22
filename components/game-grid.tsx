"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, RotateCcw } from "lucide-react"

interface GameState {
  currentWord: string
  guesses: string[]
  currentGuess: string
  gameStatus: "playing" | "won" | "lost"
  attempts: number
}

interface GameGridProps {
  gameState: GameState
  setGameState: (state: GameState) => void
  onGameEnd: (won: boolean) => void
}

export function GameGrid({ gameState, setGameState, onGameEnd }: GameGridProps) {
  const [currentInput, setCurrentInput] = useState("")

  const getLetterStatus = (letter: string, position: number, word: string, targetWord: string) => {
    if (targetWord[position] === letter) return "correct"
    if (targetWord.includes(letter)) return "present"
    return "absent"
  }

  const handleGuess = () => {
    if (currentInput.length !== 5) {
      alert("Please enter a 5-letter word")
      return
    }

    const guess = currentInput.toUpperCase()
    const newGuesses = [...gameState.guesses, guess]
    const newAttempts = gameState.attempts + 1

    let newStatus: "playing" | "won" | "lost" = "playing"

    if (guess === gameState.currentWord) {
      newStatus = "won"
      onGameEnd(true)
    } else if (newAttempts >= 5) {
      newStatus = "lost"
      onGameEnd(false)
    }

    setGameState({
      ...gameState,
      guesses: newGuesses,
      gameStatus: newStatus,
      attempts: newAttempts,
    })

    setCurrentInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGuess()
    }
  }

  // Create 5 rows for the grid
  const rows = Array.from({ length: 5 }, (_, rowIndex) => {
    const guess = gameState.guesses[rowIndex] || ""
    const isCurrentRow = rowIndex === gameState.guesses.length && gameState.gameStatus === "playing"

    return (
      <div key={rowIndex} className="flex gap-3 justify-center">
        {Array.from({ length: 5 }, (_, colIndex) => {
          let letter = ""
          let status = "empty"

          if (guess) {
            letter = guess[colIndex] || ""
            status = getLetterStatus(letter, colIndex, guess, gameState.currentWord)
          } else if (isCurrentRow && currentInput) {
            letter = currentInput[colIndex] || ""
            status = "current"
          }

          return (
            <div
              key={colIndex}
              className={cn("w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-xl game-tile", {
                "game-tile-correct": status === "correct",
                "game-tile-present": status === "present",
                "game-tile-absent": status === "absent",
                "game-tile-empty": status === "empty",
                "game-tile-current": status === "current",
              })}
              style={{
                animationDelay: `${colIndex * 100}ms`,
              }}
            >
              {letter}
            </div>
          )
        })}
      </div>
    )
  })

  return (
    <div className="space-y-8">
      <div className="space-y-3">{rows}</div>

      {/* Game Status */}
      {gameState.gameStatus === "won" && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Magnificent!
            </p>
            <p className="text-muted-foreground text-lg">
              {"You discovered the word in "}
              {gameState.attempts}
              {" attempts"}
            </p>
          </div>
        </div>
      )}

      {gameState.gameStatus === "lost" && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-slate-600">{"Almost there!"}</p>
            <p className="text-muted-foreground text-lg">
              {"The word was: "}
              <span className="font-bold text-primary text-xl">{gameState.currentWord}</span>
            </p>
          </div>
        </div>
      )}

      {/* Input Area */}
      {gameState.gameStatus === "playing" && (
        <div className="space-y-6">
          <div className="flex gap-3 justify-center items-center">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value.toUpperCase().slice(0, 5))}
              onKeyPress={handleKeyPress}
              placeholder="Enter your guess..."
              className="w-64 text-center text-xl font-mono h-12 rounded-xl shadow-sm border-2 focus:border-primary/50 transition-colors"
              maxLength={5}
            />
            <Button
              onClick={handleGuess}
              disabled={currentInput.length !== 5}
              size="lg"
              className="h-12 px-6 rounded-xl shadow-sm"
            >
              <Send className="w-5 h-5 mr-2" />
              Guess
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground bg-muted/50 inline-block px-4 py-2 rounded-full">
              {"Attempt "}
              {gameState.attempts + 1}
              {" of 5"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
