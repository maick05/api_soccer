const axios = require('axios');
const conexao = require('../dal/database/conexao');
const repositorio = require('../repositories/jogadores');
const fs = require('fs');
const appRoot = require('app-root-path');

class Jogadores {
    getStatsPorId(id) {
        return new Promise ( async (resolve, rejected) => {
            var req = await axios.get(`http://localhost:8082/rapid_api/player/${id}`);
            resolve(req.data);
        });
    }

    async getSkillsPlayer(dadosSerieA){
        return new Promise ( async (resolve, rejected) => {
            let nome = this.retiraAcentos(dadosSerieA.player_name);
            let time = this.retiraAcentos(dadosSerieA.team_name);
            var fmDBObj = await axios.get(`http://localhost:8082/fm_database/player/${nome}/${time}`);
            resolve(fmDBObj.data);
        });
        
    }

    retiraAcentos(str) {
        let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
        let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";

        let novastr="";
        for(let i=0; i<str.length; i++) {
            let troca=false;
            for (let a=0; a<com_acento.length; a++) {
                if (str.substr(i,1)==com_acento.substr(a,1)) {
                    novastr+=sem_acento.substr(a,1);
                    troca=true;
                    break;
                }
            }
            if (troca==false) {
                novastr+=str.substr(i,1);
            }
        }
        return novastr;
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