const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sua_senha',
  database: 'iot_energy' // nome do seu banco
});

const createSchema = async () => {
  try {
    // Criação dos tipos ENUM
    await pool.query(`CREATE TYPE perfil_enum AS ENUM ('administrador', 'usuario', 'visitante');`);
    await pool.query(`CREATE TYPE periodo_enum AS ENUM ('diario', 'semanal', 'mensal');`);
    await pool.query(`CREATE TYPE status_enum AS ENUM ('ativo', 'inativo');`);

    // Tabela Usuario
    await pool.query(`
      CREATE TABLE Usuario (
        id_usuario SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        senha VARCHAR(255),
        perfil perfil_enum
      );
    `);

    // Tabela Aparelho
    await pool.query(`
      CREATE TABLE Aparelho (
        id_aparelho SERIAL PRIMARY KEY,
        id_usuario INT REFERENCES Usuario(id_usuario),
        nome VARCHAR(100),
        potencia_watts FLOAT,
        tempo_uso_horas FLOAT
      );
    `);

    // Tabela Consumo
    await pool.query(`
      CREATE TABLE Consumo (
        id_consumo SERIAL PRIMARY KEY,
        id_aparelho INT REFERENCES Aparelho(id_aparelho),
        data_registro DATE,
        consumo_kwh FLOAT
      );
    `);

    // Tabela Relatorio
    await pool.query(`
      CREATE TABLE Relatorio (
        id_relatorio SERIAL PRIMARY KEY,
        id_usuario INT REFERENCES Usuario(id_usuario),
        periodo periodo_enum,
        data_geracao TIMESTAMP
      );
    `);

    // Tabela Meta
    await pool.query(`
      CREATE TABLE Meta (
        id_meta SERIAL PRIMARY KEY,
        id_usuario INT REFERENCES Usuario(id_usuario),
        limite_kwh FLOAT,
        periodo periodo_enum
      );
    `);

    // Tabela DispositivoIoT
    await pool.query(`
      CREATE TABLE DispositivoIoT (
        id_dispositivo SERIAL PRIMARY KEY,
        id_usuario INT REFERENCES Usuario(id_usuario),
        nome VARCHAR(100),
        status status_enum
      );
    `);

    console.log("✅ Banco de dados criado com sucesso!");
    pool.end();
  } catch (error) {
    console.error("❌ Erro ao criar banco de dados:", error);
    pool.end();
  }
};

createSchema();
