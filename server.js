require('dotenv').config(); // se usar .env

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// PostgreSQL: conexão com Pool
const pool = new Pool({
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_DATABASE,
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'iot-energy-secret',
    resave: false,
    saveUninitialized: true
}));

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM Usuario WHERE email = $1 AND senha = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            req.session.username = result.rows[0].nome;
            res.json({ success: true, username: result.rows[0].nome });
        } else {
            res.status(401).json({ success: false, message: 'Login inválido' });
        }
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// rota register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    // Verificar se os campos foram preenchidos
    if (!username || !password) {
        return res.status(400).send('Usuário e senha são obrigatórios!');
    }

    // Verificar se o usuário já existe (simulando com um array)
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).send('Usuário já existe!');
    }

    // Encriptar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salvar usuário (aqui simulando um array, mas no caso de um banco de dados, seria um `INSERT`)
    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    return res.status(201).send('Usuário registrado com sucesso!');
});

// Rota para obter o nome do usuário logado
app.get('/user-info', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ message: 'Não autenticado' });
    }
});

// Rota de logout caso houver
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
