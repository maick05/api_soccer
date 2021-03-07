const repositorio = require('../repositories/jogadores');
const axios = require('axios');
const BuildSkill = require('./builds/buildSkill');

class Jogadores {
    buildPlayer(id) {
        return new Promise ( async (resolve, reject) => {
            var retornos = {};
            repositorio.getStatsPorIdFake(id)
                .then(async playerApi  => {
                    console.log('rapid api');
                    var jogadorAPI = {};
                    var dadosStats = this.getAllStatsBySeason(playerApi.api.players);
                    var skill = new BuildSkill(dadosStats);

                    repositorio.getSkillsPlayer(dadosStats)
                        .then(async dadosPlayerSkills  => {
                            console.log('fm db');
                            repositorio.getSalaryPlayer(dadosStats)
                            .then(async dadosSalary  => {
                                console.log('salary FLS');
                                repositorio.getExtraInfoPlayer(dadosStats)
                                    .then(extraInfo => {
                                        console.log('transfer market');
                                        if(dadosPlayerSkills.sucesso){
                                            jogadorAPI = dadosPlayerSkills.response;
                                        }else{
                                            jogadorAPI.skills = dadosPlayerSkills.response;
                                        }
                                        jogadorAPI.stats = skill.buildSkill();
                                        jogadorAPI.salario = dadosSalary.response;
                                        jogadorAPI.extra = extraInfo.response;
                                        resolve(jogadorAPI);
                                    });
                            });
                        });
                    
                    });
                });
    }

    getAllStatsBySeason(competicoes){
        let dadosStats = competicoes[0];
        for(let i = 1; i < competicoes.length; i++){
            let comp = competicoes[i];
            Object.keys(comp).forEach(function(key){
                if(typeof comp[key] === 'object' && comp[key] !== null){
                    Object.keys(comp[key]).forEach(function(attrItem){
                        dadosStats[key][attrItem] = dadosStats[key][attrItem] + comp[key][attrItem];    
                    });
                    
                }
            });
        }

        return dadosStats;
    }
}

module.exports = new Jogadores;