const mysql = require('mysql')

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'username',
    password: 'root',
    database: 'agenda-petshop'
})

module.exports = conexao;