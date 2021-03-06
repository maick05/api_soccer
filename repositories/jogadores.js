const axios = require('axios');
const conexao = require('../dal/database/conexao');
const fs = require('fs');
const appRoot = require('app-root-path');
const stringHelper = require('../helpers/stringHelper');
const dateHelper = require('../helpers/dateHelper');


class Jogadores {
    getStatsPorId(id) {
        return new Promise ( async (resolve, rejected) => {
            var req = await axios.get(`http://localhost:8082/rapid_api/player/${id}`);
            resolve(req.data);
        });
    }

    async getSkillsPlayer(dadosSerieA){
        return new Promise ( async (resolve, rejected) => {
            let nome = stringHelper.retirarAcentos(dadosSerieA.player_name);
            let time = stringHelper.retirarAcentos(dadosSerieA.team_name);
            var fmDBObj = await axios.get(`http://localhost:8082/fm_database/player/${nome}/${time}`);
            resolve(fmDBObj.data);
        });
        
    }

    getSalaryPlayer(dadosSerieA){
        return new Promise ( async (resolve, rejected) => {
            let nome = stringHelper.retirarAcentos(dadosSerieA.player_name);
            let time = stringHelper.retirarAcentos(dadosSerieA.team_name);
            let dataNasc = dateHelper.formatDataDB(dadosSerieA.birth_date);
            
            var body = await axios.get(`http://localhost:8082/football_life_style/player/${nome}/${time}/${dataNasc}`);
            resolve(body.data);
        }); 
    }

    getExtraInfoPlayer(dadosSerieA){
        return new Promise ( async (resolve, rejected) => {
            let nome = stringHelper.retirarAcentos(dadosSerieA.player_name);
            let time = stringHelper.retirarAcentos(dadosSerieA.team_name);
            let dataNasc = dateHelper.formatDataDB(dadosSerieA.birth_date);
            
            var body = await axios.get(`http://localhost:8082/transfer_market/player/${nome}/${time}/${dataNasc}/1`);
            resolve(body.data);
        }); 
    }

    getStatsPorIdFake(id){
        return new Promise ( (resolve, reject) => {
            var filepath = appRoot.path+'/assets/data_json/players/'+id+'.json';
            
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