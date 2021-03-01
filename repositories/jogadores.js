const axios = require('axios');
const conexao = require('../dal/database/conexao');
const repositorio = require('../repositories/jogadores');
const fs = require('fs');
const appRoot = require('app-root-path');

class Jogadores {
    getDadosPorId(id) {
        return new Promise ( async (resolve, rejected) => {
            var req = await axios.get(`http://localhost:8082/rapid_api/player/${id}`);
            resolve(req.data);
        });
    }

    getDadosPorIdFake(id){
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