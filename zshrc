# First Mate & Agent Tools PATH
export PATH="$HOME/dotfiles/firstmate/bin:$HOME/dotfiles/treehouse/bin:$HOME/dotfiles/no-mistakes/bin:$HOME/dotfiles/quota-axi/bin:$PATH"

# Starship Prompt
eval "$(starship init zsh)"

# Zsh Autosuggestions
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh 2>/dev/null || true

# Useful Aliases
alias v="nvim"
alias g="git"
alias h="herdr"
alias reload="source ~/.zshrc"
