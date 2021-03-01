const Player = require('../transfer_market/player')


module.exports = app => { 
    app.get('/transfer_market/player/:id', (req, res) => {  
        Player.getInfoPlayer(res);
    })
}