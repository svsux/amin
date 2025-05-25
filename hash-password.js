// filepath: hash-password.js (временный файл, не часть проекта)
const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainPassword = 'testpassword123'; // Замените на ваш тестовый пароль

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Plain password:", plainPassword);
    console.log("Hashed password:", hash);
});