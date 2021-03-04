const repositorio = require('../repositories/jogadores');
const axios = require('axios');
const BuildSkill = require('./builds/buildSkill');

class Jogadores {
    buildPlayer(id) {
        return new Promise ( async (resolve, reject) => {
            repositorio.getStatsPorIdFake(id)
                .then(async playerApi  => {
                    var jogadorAPI = {};
                    var dadosSerieA = playerApi.api.players[1];
                    var skill = new BuildSkill(dadosSerieA);

                    repositorio.getSkillsPlayer(dadosSerieA)
                        .then(async dadosPlayerSkills  => {
                            repositorio.getSalaryPlayer(dadosSerieA)
                            .then(async dadosSalary  => {
                                jogadorAPI = dadosPlayerSkills;
                                jogadorAPI.stats = skill.buildSkill();
                                jogadorAPI.salario = dadosSalary.salario;
                                resolve(jogadorAPI);
                        });
                    });
                    
                });
        });
    }
}

module.exports = new Jogadores;