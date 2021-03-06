const axios = require('axios');
const fs = require('fs');
const appRoot = require('app-root-path');
const stringHelper = require('../helpers/stringHelper');
const dateHelper = require('../helpers/dateHelper');


class Jogadores {
    getPlayersByIdTeamAndSeasonFake(idTeam, season){
        return new Promise ( (resolve, reject) => {
            var filepath = appRoot.path+'/assets/data_json/playersTeam/'+idTeam+'_'+season+'.json';
            
            if(!fs.existsSync(filepath)){
                reject({'mensagem': 'Não existe o arquivo para teste'});
                return;
            }

            fs.readFile(filepath, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }   
                resolve(JSON.parse(data));
              });
        });
    }
}

module.exports = new Jogadores;