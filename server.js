require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Para encriptação de senha

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL usando Pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

app.use(cors({
    origin: '', //  ajustar pra url do front end 
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'iot-energy-secret',
    resave: false,
    saveUninitialized: true
}));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM Usuario WHERE email = $1',
            [username]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.senha);
            if (match) {
                req.session.username = user.nome;
                res.json({ success: true, username: user.nome });
            } else {
                res.status(401).json({ success: false, message: 'Senha incorreta' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});


app.post('/register', async (req, res) => {
    const { username, name, password } = req.body;
    
    if (!username || !password || !name) {
        return res.status(400).json({ success: false, message: 'Usuário, nome e senha são obrigatórios!' });
    }

    try {
        const result = await pool.query('SELECT * FROM Usuario WHERE email = $1', [username]);
        if (result.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Usuário já existe!' });
        }

   
        const hashedPassword = await bcrypt.hash(password, 10);

    
        await pool.query(
            'INSERT INTO Usuario (email, nome, senha) VALUES ($1, $2, $3)',
            [username, name, hashedPassword]
        );

        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});


//Próximos passos:

//Implementar a parte de banco de dados com PostgreSQL para armazenar os usuários.

//Certificar-se de que as credenciais e conexões de banco de dados estão funcionando corretamente.








