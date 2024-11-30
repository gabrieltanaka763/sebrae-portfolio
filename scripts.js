// Alternar visibilidade da senha
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
    const isPasswordVisible = passwordInput.type === 'password';
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    togglePassword.classList.toggle('fa-eye', !isPasswordVisible);
    togglePassword.classList.toggle('fa-eye-slash', isPasswordVisible);
});

// Lógica de login
// Lógica de login
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Credenciais de login
    if (username === 'sebrae.amazonas' && password === 'sebraeam@123') {
        // Armazena o token de autenticação no localStorage
        localStorage.setItem('isLoggedIn', 'true');

        // Redireciona para a página inicial
        window.location.href = 'http://127.0.0.1:5500/tabela_area/index.html';
        alert('Usuário ou senha incorretos!');
    }
});

