const Player = require('../transferMarket/player')


module.exports = app => { 
    app.get('/transfer_market/player/:termo/:club/:data_nasc/:pais', (req, res) => {  
        const nome = req.params.termo;
        const club = req.params.club;
        const dataNasc = req.params.data_nasc;
        const pais = req.params.pais;
        Player.getExtraInfoPlayer(nome, club, dataNasc, pais, res)
    //         .then(retorno => {
    //             res.send(retorno);
    //         });
    })
}