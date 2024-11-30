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
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Credenciais de login
    if (username === 'christini.gama@am.sebrae.com.br' && password === 'sebraeam@123') {
        // Armazena o token de autenticação no localStorage
        localStorage.setItem('isLoggedIn', 'true');

        // Redireciona para a página inicial
        window.location.href = 'https://sebrae-portfolio-hwrl.vercel.app/tabela_area/index.html';
    } else {
        // Exibe mensagem de erro apenas se as credenciais estiverem erradas
        alert('Usuário ou senha incorretos!');
    }
});
