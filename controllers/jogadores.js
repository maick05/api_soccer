const Jogadores = require('../models/jogadores')

module.exports = app => { 
    app.get('/jogadores/:id', (req, res) => { 
        const id = parseInt(req.params.id);
        Jogadores.buildPlayer(id)
            .then(retorno =>res.status(200).json(retorno))
            .catch(erro => res.status(400).json(erro));
    });
}