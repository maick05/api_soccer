const Players = require('../rapid_api/itens/jogadores')

module.exports = app => { 
    app.get('/rapid_api/player/:id', (req, res) => {
        const id = parseInt(req.params.id);
        Players.getPlayerById(id, res);
    })
}