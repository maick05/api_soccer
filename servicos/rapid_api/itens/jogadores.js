const unirest = require('unirest')
const config = require('config');

class Jogadores{
    getPlayerById(id, response){
        var req = unirest("GET", `https://api-football-v1.p.rapidapi.com/v2/players/player/${id}/2020`);
        req.headers(config.get('rapidApi.headers'));
        req.end(function (res) {
            if (res.error) throw new Error(res.error);
        
            response.json(res.body);
        });
    }
}

module.exports = new Jogadores;