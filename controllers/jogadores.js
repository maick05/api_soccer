const Jogadores = require('../models/jogadores');
const JogadoresTime = require('../repositories/jogadoresTime');

module.exports = app => { 
    app.get('/jogadores/:id', (req, res) => { 
        const id = parseInt(req.params.id);
        Jogadores.buildPlayer(id)
            .then(retorno =>res.status(200).json(retorno))
            .catch(erro => res.status(400).json(erro));
    });

    app.get('/jogadores_time/buildFilePlayers/:idTeam/:season', (req, res) => { 
        const idTeam = parseInt(req.params.idTeam);
        const season = req.params.season;
        JogadoresTime.getPlayersByIdTeamAndSeasonFake(idTeam, season)
            .then(retorno =>res.status(200).json(retorno))
            .catch(erro => res.status(400).json(erro));
    });
}