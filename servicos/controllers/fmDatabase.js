const Player = require('../fmDatabase/player')


module.exports = app => { 
    app.get('/fm_database/player/:termo/:club', (req, res) => {  
        const nome = req.params.termo;
        const club = req.params.club;
        Player.getInfoPlayer(nome, club, res);
    })
}