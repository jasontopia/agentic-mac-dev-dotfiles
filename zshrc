# First Mate PATH
export PATH="$HOME/dotfiles/firstmate/bin:$PATH"

# Starship Prompt
eval "$(starship init zsh)"

# Zsh Autosuggestions (Ghost text completion)
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh 2>/dev/null || true

# Useful Aliases for High Efficiency
alias v="nvim"
alias g="git"
alias h="herdr"
alias reload="source ~/.zshrc"
