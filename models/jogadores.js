const repositorio = require('../repositories/jogadores');
const BuildSkill = require('./builds/buildSkill');

class Jogadores {
    buildPlayer(id) {
        return new Promise ( async (resolve, reject) => {
            repositorio.getDadosPorIdFake(id)
                .then(playerApi => {
                    var dadosSerieA = playerApi.api.players[1];
                    var skill = new BuildSkill(dadosSerieA);
                    resolve(skill.buildSkill());
                });
        });
    }
}

module.exports = new Jogadores;