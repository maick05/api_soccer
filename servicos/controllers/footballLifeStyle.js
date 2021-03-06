const Player = require('../footballLifeStyle/player')

module.exports = app => { 
    app.get('/football_life_style/player/:termo/:club/:data_nasc', (req, res) => {  
        const nome = req.params.termo;
        const club = req.params.club;
        const dataNasc = req.params.data_nasc;
        Player.getSalaryPlayer(nome, club, dataNasc)
            .then(retorno => {
                res.send(retorno);
            }).catch(err => res.send(err));
    })
}