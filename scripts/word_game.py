import json
import random
from datetime import datetime, date
from typing import Dict, List, Optional, Tuple
import os

class WordGame:
    def __init__(self):
        self.words = [
            "AUDIO", "HOUSE", "PLANT", "WORLD", "MUSIC",
            "LIGHT", "WATER", "POWER", "MONEY", "RIGHT",
            "GREAT", "SMALL", "LARGE", "YOUNG", "EARLY",
            "PLACE", "POINT", "HEART", "PARTY", "STORY"
        ]
        self.data_file = "game_data.json"
        self.load_data()
        
    def load_data(self):
        """Load user data and game history from JSON file"""
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                self.users = data.get('users', {})
                self.games = data.get('games', [])
        except FileNotFoundError:
            self.users = {}
            self.games = []
            
    def save_data(self):
        """Save user data and game history to JSON file"""
        data = {
            'users': self.users,
            'games': self.games
        }
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def register_user(self, username: str, password: str, is_admin: bool = False) -> bool:
        """Register a new user"""
        if username in self.users:
            return False
            
        # Validate username (3-20 chars, alphanumeric + underscore)
        if not (3 <= len(username) <= 20 and username.replace('_', '').isalnum()):
            return False
            
        # Validate password (6-50 chars)
        if not (6 <= len(password) <= 50):
            return False
            
        self.users[username] = {
            'password': password,
            'is_admin': is_admin,
            'created_at': datetime.now().isoformat(),
            'games_today': 0,
            'last_game_date': None
        }
        self.save_data()
        return True
    
    def login(self, username: str, password: str) -> Optional[Dict]:
        """Authenticate user login"""
        if username not in self.users:
            return None
        if self.users[username]['password'] != password:
            return None
        return self.users[username]
    
    def can_play_game(self, username: str) -> bool:
        """Check if user can play a game today"""
        user = self.users[username]
        today = date.today().isoformat()
        
        # Reset daily count if it's a new day
        if user['last_game_date'] != today:
            user['games_today'] = 0
            user['last_game_date'] = today
            self.save_data()
            
        return user['games_today'] < 3
    
    def get_daily_word(self) -> str:
        """Get the word for today (same word for all players each day)"""
        today = date.today()
        # Use date as seed for consistent daily word
        random.seed(today.toordinal())
        return random.choice(self.words)
    
    def check_guess(self, guess: str, target: str) -> List[str]:
        """Check guess against target word and return color feedback"""
        result = ['grey'] * 5
        target_chars = list(target)
        guess_chars = list(guess.upper())
        
        # First pass: mark correct positions (green)
        for i in range(5):
            if guess_chars[i] == target_chars[i]:
                result[i] = 'green'
                target_chars[i] = None  # Mark as used
                guess_chars[i] = None   # Mark as used
        
        # Second pass: mark wrong positions (yellow)
        for i in range(5):
            if guess_chars[i] is not None:
                if guess_chars[i] in target_chars:
                    result[i] = 'yellow'
                    # Remove first occurrence from target
                    target_chars[target_chars.index(guess_chars[i])] = None
        
        return result
    
    def play_game(self, username: str) -> Dict:
        """Play a complete game session"""
        if not self.can_play_game(username):
            return {'error': 'Daily game limit reached (3 games per day)'}
        
        target_word = self.get_daily_word()
        attempts = []
        max_attempts = 5
        won = False
        
        print(f"\n🎯 Welcome to Word Guess Game!")
        print(f"Guess the 5-letter word. You have {max_attempts} attempts.")
        print("Color coding: 🟩 = correct position, 🟨 = wrong position, ⬜ = not in word\n")
        
        for attempt in range(max_attempts):
            while True:
                guess = input(f"Attempt {attempt + 1}/{max_attempts}: ").strip().upper()
                if len(guess) == 5 and guess.isalpha():
                    break
                print("Please enter a valid 5-letter word.")
            
            feedback = self.check_guess(guess, target_word)
            attempts.append({'guess': guess, 'feedback': feedback})
            
            # Display feedback with colors
            display = ""
            for i, char in enumerate(guess):
                if feedback[i] == 'green':
                    display += f"🟩{char}"
                elif feedback[i] == 'yellow':
                    display += f"🟨{char}"
                else:
                    display += f"⬜{char}"
            
            print(f"Result: {display}")
            
            if guess == target_word:
                won = True
                print(f"\n🎉 Congratulations! You guessed the word '{target_word}' in {attempt + 1} attempts!")
                break
        
        if not won:
            print(f"\n😔 Game over! The word was '{target_word}'")
        
        # Record the game
        game_record = {
            'username': username,
            'date': datetime.now().isoformat(),
            'target_word': target_word,
            'attempts': attempts,
            'won': won,
            'attempts_used': len(attempts)
        }
        
        self.games.append(game_record)
        self.users[username]['games_today'] += 1
        self.save_data()
        
        return game_record
    
    def get_user_stats(self, username: str) -> Dict:
        """Get statistics for a specific user"""
        user_games = [g for g in self.games if g['username'] == username]
        
        if not user_games:
            return {
                'total_games': 0,
                'games_won': 0,
                'win_rate': 0,
                'average_attempts': 0,
                'games_today': self.users[username]['games_today']
            }
        
        games_won = sum(1 for g in user_games if g['won'])
        total_attempts = sum(g['attempts_used'] for g in user_games)
        
        return {
            'total_games': len(user_games),
            'games_won': games_won,
            'win_rate': round((games_won / len(user_games)) * 100, 1),
            'average_attempts': round(total_attempts / len(user_games), 1),
            'games_today': self.users[username]['games_today']
        }
    
    def admin_dashboard(self) -> Dict:
        """Get comprehensive statistics for admin users"""
        total_users = len(self.users)
        total_games = len(self.games)
        
        if total_games == 0:
            return {
                'total_users': total_users,
                'total_games': 0,
                'overall_win_rate': 0,
                'average_attempts': 0,
                'top_players': []
            }
        
        games_won = sum(1 for g in self.games if g['won'])
        total_attempts = sum(g['attempts_used'] for g in self.games)
        
        # Calculate top players
        user_stats = {}
        for username in self.users:
            if not self.users[username]['is_admin']:
                stats = self.get_user_stats(username)
                if stats['total_games'] > 0:
                    user_stats[username] = stats
        
        top_players = sorted(
            user_stats.items(),
            key=lambda x: (x[1]['win_rate'], -x[1]['average_attempts']),
            reverse=True
        )[:5]
        
        return {
            'total_users': total_users,
            'total_games': total_games,
            'overall_win_rate': round((games_won / total_games) * 100, 1),
            'average_attempts': round(total_attempts / total_games, 1),
            'top_players': top_players
        }

def main():
    game = WordGame()
    current_user = None
    
    while True:
        if current_user is None:
            print("\n" + "="*50)
            print("🎮 WORD GUESS GAME")
            print("="*50)
            print("1. Login")
            print("2. Register")
            print("3. Exit")
            
            choice = input("\nChoose an option (1-3): ").strip()
            
            if choice == '1':
                username = input("Username: ").strip()
                password = input("Password: ").strip()
                user_data = game.login(username, password)
                
                if user_data:
                    current_user = {'username': username, 'data': user_data}
                    print(f"\n✅ Welcome back, {username}!")
                else:
                    print("\n❌ Invalid username or password.")
            
            elif choice == '2':
                print("\nRegister New User")
                print("Username: 3-20 characters, letters, numbers, and underscore only")
                print("Password: 6-50 characters")
                
                username = input("Username: ").strip()
                password = input("Password: ").strip()
                is_admin = input("Admin account? (y/n): ").strip().lower() == 'y'
                
                if game.register_user(username, password, is_admin):
                    print(f"\n✅ User '{username}' registered successfully!")
                else:
                    print("\n❌ Registration failed. Check username requirements or user already exists.")
            
            elif choice == '3':
                print("\n👋 Thanks for playing!")
                break
        
        else:
            username = current_user['username']
            is_admin = current_user['data']['is_admin']
            
            print(f"\n" + "="*50)
            print(f"🎮 WORD GUESS GAME - Welcome, {username}!")
            print("="*50)
            
            if is_admin:
                print("1. Play Game")
                print("2. View My Stats")
                print("3. Admin Dashboard")
                print("4. Logout")
                max_choice = 4
            else:
                print("1. Play Game")
                print("2. View My Stats")
                print("3. Logout")
                max_choice = 3
            
            choice = input(f"\nChoose an option (1-{max_choice}): ").strip()
            
            if choice == '1':
                result = game.play_game(username)
                if 'error' in result:
                    print(f"\n❌ {result['error']}")
                else:
                    input("\nPress Enter to continue...")
            
            elif choice == '2':
                stats = game.get_user_stats(username)
                print(f"\n📊 Your Statistics:")
                print(f"Total Games: {stats['total_games']}")
                print(f"Games Won: {stats['games_won']}")
                print(f"Win Rate: {stats['win_rate']}%")
                print(f"Average Attempts: {stats['average_attempts']}")
                print(f"Games Today: {stats['games_today']}/3")
                input("\nPress Enter to continue...")
            
            elif choice == '3' and is_admin:
                dashboard = game.admin_dashboard()
                print(f"\n👑 Admin Dashboard:")
                print(f"Total Users: {dashboard['total_users']}")
                print(f"Total Games: {dashboard['total_games']}")
                print(f"Overall Win Rate: {dashboard['overall_win_rate']}%")
                print(f"Average Attempts: {dashboard['average_attempts']}")
                
                print(f"\n🏆 Top Players:")
                for i, (player, stats) in enumerate(dashboard['top_players'], 1):
                    print(f"{i}. {player} - {stats['win_rate']}% win rate, {stats['average_attempts']} avg attempts")
                
                input("\nPress Enter to continue...")
            
            elif choice == str(max_choice):
                current_user = None
                print(f"\n👋 Goodbye, {username}!")

if __name__ == "__main__":
    main()
