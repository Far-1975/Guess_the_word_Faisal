import tkinter as tk
from tkinter import messagebox, simpledialog
import json
import random
from datetime import datetime, date
from typing import Dict, List

class WordGameGUI:
    def __init__(self):
        self.words = [
            "AUDIO", "HOUSE", "PLANT", "WORLD", "MUSIC",
            "LIGHT", "WATER", "POWER", "MONEY", "RIGHT",
            "GREAT", "SMALL", "LARGE", "YOUNG", "EARLY",
            "PLACE", "POINT", "HEART", "PARTY", "STORY"
        ]
        
        self.root = tk.Tk()
        self.root.title("Word Guess Game")
        self.root.geometry("500x600")
        self.root.configure(bg='#f0f0f0')
        
        self.current_user = None
        self.target_word = ""
        self.current_row = 0
        self.current_col = 0
        self.game_over = False
        
        self.load_data()
        self.create_login_screen()
    
    def load_data(self):
        """Load game data from JSON file"""
        try:
            with open("game_data.json", 'r') as f:
                data = json.load(f)
                self.users = data.get('users', {})
                self.games = data.get('games', [])
        except FileNotFoundError:
            self.users = {}
            self.games = []
    
    def save_data(self):
        """Save game data to JSON file"""
        data = {'users': self.users, 'games': self.games}
        with open("game_data.json", 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def create_login_screen(self):
        """Create the login interface"""
        self.clear_screen()
        
        # Title
        title = tk.Label(self.root, text="🎮 Word Guess Game", 
                        font=("Arial", 24, "bold"), bg='#f0f0f0', fg='#333')
        title.pack(pady=30)
        
        # Login frame
        login_frame = tk.Frame(self.root, bg='#f0f0f0')
        login_frame.pack(pady=20)
        
        tk.Label(login_frame, text="Username:", font=("Arial", 12), bg='#f0f0f0').grid(row=0, column=0, padx=10, pady=5)
        self.username_entry = tk.Entry(login_frame, font=("Arial", 12), width=20)
        self.username_entry.grid(row=0, column=1, padx=10, pady=5)
        
        tk.Label(login_frame, text="Password:", font=("Arial", 12), bg='#f0f0f0').grid(row=1, column=0, padx=10, pady=5)
        self.password_entry = tk.Entry(login_frame, font=("Arial", 12), width=20, show="*")
        self.password_entry.grid(row=1, column=1, padx=10, pady=5)
        
        # Buttons
        button_frame = tk.Frame(self.root, bg='#f0f0f0')
        button_frame.pack(pady=20)
        
        login_btn = tk.Button(button_frame, text="Login", font=("Arial", 12), 
                             bg='#4CAF50', fg='white', padx=20, command=self.login)
        login_btn.pack(side=tk.LEFT, padx=10)
        
        register_btn = tk.Button(button_frame, text="Register", font=("Arial", 12), 
                               bg='#2196F3', fg='white', padx=20, command=self.register)
        register_btn.pack(side=tk.LEFT, padx=10)
    
    def login(self):
        """Handle user login"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if username in self.users and self.users[username]['password'] == password:
            self.current_user = username
            self.create_main_menu()
        else:
            messagebox.showerror("Error", "Invalid username or password")
    
    def register(self):
        """Handle user registration"""
        username = self.username_entry.get().strip()
        password = self.password_entry.get().strip()
        
        if not username or not password:
            messagebox.showerror("Error", "Please enter username and password")
            return
        
        if username in self.users:
            messagebox.showerror("Error", "Username already exists")
            return
        
        if not (3 <= len(username) <= 20 and username.replace('_', '').isalnum()):
            messagebox.showerror("Error", "Username must be 3-20 characters, letters/numbers/underscore only")
            return
        
        if not (6 <= len(password) <= 50):
            messagebox.showerror("Error", "Password must be 6-50 characters")
            return
        
        is_admin = messagebox.askyesno("Admin Account", "Create as admin account?")
        
        self.users[username] = {
            'password': password,
            'is_admin': is_admin,
            'created_at': datetime.now().isoformat(),
            'games_today': 0,
            'last_game_date': None
        }
        self.save_data()
        messagebox.showinfo("Success", f"User '{username}' registered successfully!")
    
    def create_main_menu(self):
        """Create the main menu interface"""
        self.clear_screen()
        
        # Welcome message
        welcome = tk.Label(self.root, text=f"Welcome, {self.current_user}!", 
                          font=("Arial", 18, "bold"), bg='#f0f0f0', fg='#333')
        welcome.pack(pady=20)
        
        # Menu buttons
        button_frame = tk.Frame(self.root, bg='#f0f0f0')
        button_frame.pack(pady=20)
        
        play_btn = tk.Button(button_frame, text="🎯 Play Game", font=("Arial", 14), 
                           bg='#4CAF50', fg='white', padx=30, pady=10, command=self.start_game)
        play_btn.pack(pady=10)
        
        stats_btn = tk.Button(button_frame, text="📊 View Stats", font=("Arial", 14), 
                            bg='#2196F3', fg='white', padx=30, pady=10, command=self.show_stats)
        stats_btn.pack(pady=10)
        
        if self.users[self.current_user]['is_admin']:
            admin_btn = tk.Button(button_frame, text="👑 Admin Dashboard", font=("Arial", 14), 
                                bg='#FF9800', fg='white', padx=30, pady=10, command=self.show_admin_dashboard)
            admin_btn.pack(pady=10)
        
        logout_btn = tk.Button(button_frame, text="🚪 Logout", font=("Arial", 14), 
                             bg='#f44336', fg='white', padx=30, pady=10, command=self.logout)
        logout_btn.pack(pady=10)
    
    def start_game(self):
        """Start a new game"""
        if not self.can_play_game():
            messagebox.showwarning("Limit Reached", "You've reached your daily limit of 3 games!")
            return
        
        self.target_word = self.get_daily_word()
        self.current_row = 0
        self.current_col = 0
        self.game_over = False
        self.create_game_screen()
    
    def can_play_game(self):
        """Check if user can play a game today"""
        user = self.users[self.current_user]
        today = date.today().isoformat()
        
        if user['last_game_date'] != today:
            user['games_today'] = 0
            user['last_game_date'] = today
            self.save_data()
        
        return user['games_today'] < 3
    
    def get_daily_word(self):
        """Get today's word"""
        today = date.today()
        random.seed(today.toordinal())
        return random.choice(self.words)
    
    def create_game_screen(self):
        """Create the game interface"""
        self.clear_screen()
        
        # Title
        title = tk.Label(self.root, text="🎯 Guess the Word!", 
                        font=("Arial", 18, "bold"), bg='#f0f0f0', fg='#333')
        title.pack(pady=10)
        
        # Game grid
        self.grid_frame = tk.Frame(self.root, bg='#f0f0f0')
        self.grid_frame.pack(pady=20)
        
        self.cells = []
        for row in range(5):
            cell_row = []
            for col in range(5):
                cell = tk.Label(self.grid_frame, text="", font=("Arial", 16, "bold"),
                              width=3, height=2, relief="solid", borderwidth=2,
                              bg='white', fg='black')
                cell.grid(row=row, column=col, padx=2, pady=2)
                cell_row.append(cell)
            self.cells.append(cell_row)
        
        # Input frame
        input_frame = tk.Frame(self.root, bg='#f0f0f0')
        input_frame.pack(pady=20)
        
        tk.Label(input_frame, text="Enter your guess:", font=("Arial", 12), bg='#f0f0f0').pack()
        self.guess_entry = tk.Entry(input_frame, font=("Arial", 14), width=10)
        self.guess_entry.pack(pady=5)
        self.guess_entry.bind('<Return>', lambda e: self.submit_guess())
        
        submit_btn = tk.Button(input_frame, text="Submit Guess", font=("Arial", 12),
                             bg='#4CAF50', fg='white', command=self.submit_guess)
        submit_btn.pack(pady=5)
        
        # Back button
        back_btn = tk.Button(self.root, text="← Back to Menu", font=("Arial", 10),
                           bg='#757575', fg='white', command=self.create_main_menu)
        back_btn.pack(pady=10)
        
        self.guess_entry.focus()
    
    def submit_guess(self):
        """Handle guess submission"""
        if self.game_over:
            return
        
        guess = self.guess_entry.get().strip().upper()
        
        if len(guess) != 5 or not guess.isalpha():
            messagebox.showerror("Invalid Input", "Please enter a 5-letter word")
            return
        
        # Update grid
        feedback = self.check_guess(guess, self.target_word)
        
        for col in range(5):
            cell = self.cells[self.current_row][col]
            cell.config(text=guess[col])
            
            if feedback[col] == 'green':
                cell.config(bg='#4CAF50', fg='white')
            elif feedback[col] == 'yellow':
                cell.config(bg='#FFC107', fg='black')
            else:
                cell.config(bg='#757575', fg='white')
        
        # Check win condition
        if guess == self.target_word:
            self.game_over = True
            messagebox.showinfo("Congratulations!", f"You guessed the word '{self.target_word}' in {self.current_row + 1} attempts!")
            self.record_game(True, self.current_row + 1)
        elif self.current_row >= 4:
            self.game_over = True
            messagebox.showinfo("Game Over", f"The word was '{self.target_word}'")
            self.record_game(False, 5)
        
        self.current_row += 1
        self.guess_entry.delete(0, tk.END)
    
    def check_guess(self, guess, target):
        """Check guess and return feedback"""
        result = ['grey'] * 5
        target_chars = list(target)
        guess_chars = list(guess)
        
        # Mark correct positions
        for i in range(5):
            if guess_chars[i] == target_chars[i]:
                result[i] = 'green'
                target_chars[i] = None
                guess_chars[i] = None
        
        # Mark wrong positions
        for i in range(5):
            if guess_chars[i] is not None and guess_chars[i] in target_chars:
                result[i] = 'yellow'
                target_chars[target_chars.index(guess_chars[i])] = None
        
        return result
    
    def record_game(self, won, attempts):
        """Record game result"""
        game_record = {
            'username': self.current_user,
            'date': datetime.now().isoformat(),
            'target_word': self.target_word,
            'won': won,
            'attempts_used': attempts
        }
        
        self.games.append(game_record)
        self.users[self.current_user]['games_today'] += 1
        self.save_data()
    
    def show_stats(self):
        """Show user statistics"""
        user_games = [g for g in self.games if g['username'] == self.current_user]
        
        if not user_games:
            stats_text = "No games played yet!"
        else:
            games_won = sum(1 for g in user_games if g['won'])
            total_attempts = sum(g['attempts_used'] for g in user_games)
            win_rate = round((games_won / len(user_games)) * 100, 1)
            avg_attempts = round(total_attempts / len(user_games), 1)
            
            stats_text = f"""📊 Your Statistics:
            
Total Games: {len(user_games)}
Games Won: {games_won}
Win Rate: {win_rate}%
Average Attempts: {avg_attempts}
Games Today: {self.users[self.current_user]['games_today']}/3"""
        
        messagebox.showinfo("Your Statistics", stats_text)
    
    def show_admin_dashboard(self):
        """Show admin dashboard"""
        total_users = len(self.users)
        total_games = len(self.games)
        
        if total_games == 0:
            dashboard_text = f"👑 Admin Dashboard:\n\nTotal Users: {total_users}\nTotal Games: 0"
        else:
            games_won = sum(1 for g in self.games if g['won'])
            total_attempts = sum(g['attempts_used'] for g in self.games)
            win_rate = round((games_won / total_games) * 100, 1)
            avg_attempts = round(total_attempts / total_games, 1)
            
            dashboard_text = f"""👑 Admin Dashboard:
            
Total Users: {total_users}
Total Games: {total_games}
Overall Win Rate: {win_rate}%
Average Attempts: {avg_attempts}"""
        
        messagebox.showinfo("Admin Dashboard", dashboard_text)
    
    def logout(self):
        """Logout current user"""
        self.current_user = None
        self.create_login_screen()
    
    def clear_screen(self):
        """Clear all widgets from screen"""
        for widget in self.root.winfo_children():
            widget.destroy()
    
    def run(self):
        """Start the GUI application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = WordGameGUI()
    app.run()
