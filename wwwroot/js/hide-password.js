const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#passwordField');
const icon = document.querySelector('#toggleIcon');

togglePassword.addEventListener('click', function (e) {
    // Toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);

    // Toggle the icon or text
    icon.textContent = type === 'password' ? '👁️' : '🙈';
});
