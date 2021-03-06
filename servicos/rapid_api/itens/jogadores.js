const unirest = require('unirest')
const config = require('config');

class Jogadores{
    getPlayerById(id){
        return new Promise((resolve, reject) => {
            var req = unirest("GET", `https://api-football-v1.p.rapidapi.com/v2/players/player/${id}/2020`);
            req.headers(config.get('rapidApi.headers'));
            req.end(function (res) {
                if (res.error) {
                    reject(res.error);
                    return;
                }
            
                resolve(res.body);
            });
        });
    }
}

module.exports = new Jogadores;