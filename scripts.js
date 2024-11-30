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
const errorFeedback = document.getElementById('errorFeedback'); // Seleciona o elemento de feedback

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Credenciais de login
    if (username === 'christini.gama@am.sebrae.com.br' && password === 'sebraeam@123') {
        // Armazena o token de autenticação no localStorage
        localStorage.setItem('isLoggedIn', 'true');

        // Redireciona para a página inicial
        window.location.href = '/tabela_area/tabela_area.html';
    } else {
        // Exibe o feedback na tela
        errorFeedback.classList.remove('d-none'); // Mostra o feedback
        errorFeedback.style.display = 'block'; // Garante que o elemento esteja visível

        // Esconde o feedback após 3 segundos
        setTimeout(() => {
            errorFeedback.classList.add('d-none'); // Esconde o feedback
        }, 3000);
    }
});
