import random

def simple_word_game():
    """A simplified version of the word guessing game for quick play"""
    
    words = [
        "AUDIO", "HOUSE", "PLANT", "WORLD", "MUSIC",
        "LIGHT", "WATER", "POWER", "MONEY", "RIGHT",
        "GREAT", "SMALL", "LARGE", "YOUNG", "EARLY"
    ]
    
    target_word = random.choice(words)
    max_attempts = 5
    
    print("🎯 Simple Word Guess Game!")
    print("Guess the 5-letter word. You have 5 attempts.")
    print("🟩 = correct position, 🟨 = wrong position, ⬜ = not in word\n")
    
    for attempt in range(max_attempts):
        while True:
            guess = input(f"Attempt {attempt + 1}/5: ").strip().upper()
            if len(guess) == 5 and guess.isalpha():
                break
            print("Please enter a valid 5-letter word.")
        
        # Check guess
        result = ['⬜'] * 5
        target_chars = list(target_word)
        guess_chars = list(guess)
        
        # Mark correct positions
        for i in range(5):
            if guess_chars[i] == target_chars[i]:
                result[i] = '🟩'
                target_chars[i] = None
                guess_chars[i] = None
        
        # Mark wrong positions
        for i in range(5):
            if guess_chars[i] is not None and guess_chars[i] in target_chars:
                result[i] = '🟨'
                target_chars[target_chars.index(guess_chars[i])] = None
        
        # Display result
        display = ''.join(f"{result[i]}{guess[i]}" for i in range(5))
        print(f"Result: {display}")
        
        if guess == target_word:
            print(f"\n🎉 Congratulations! You guessed '{target_word}' in {attempt + 1} attempts!")
            return
    
    print(f"\n😔 Game over! The word was '{target_word}'")

if __name__ == "__main__":
    simple_word_game()
