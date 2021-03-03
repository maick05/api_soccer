const cheerio = require('cheerio');
const request = require('request');
const config = require('config');
const CurlService = require('../helpers/curlService');
const stringHelper = require('../helpers/stringHelper');
const puppeteer = require('puppeteer');
const appRoot = require('app-root-path');
const fs = require('fs');

class Player{
    getSalaryPlayer(nome, club, data_nasc, res){ 
        const contexto = this;       
        return new Promise(async (resolve, reject) => {
            contexto.getAliasClub(club).then(async alias => {
                var data = await CurlService.makePost('https://www.football-lifestyle.co.uk/suche.php', {spieler: nome});
                var $ = cheerio.load(data);
                
                let results = $('#tableb');
                let link = '';
                results.each(async function(){
                    let td = $(this).find('td').first().next();
                    let nameFLS = stringHelper.retirarAcentos(td.find('a').text());
                    let idPlayer = td.find('a').attr('href');
                    var arrInfo = td.html().split('<br>');
                    let clubFLS = stringHelper.retirarAcentos(arrInfo[1]);
                    let dataNascFLS = arrInfo[3];
       
                    if(!alias.includes(clubFLS)){
                        return true;
                    }
    
                    if(true){
                        link = 'https://www.football-lifestyle.co.uk'+idPlayer;
                        return false;
                    }
                });

                if(!link){
                    reject('jogador não encontrado!');
                    return;
                }

                data = await CurlService.makeGet(link);
                $ = cheerio.load(data);
                var salario = contexto.getSalario($('*'));
                resolve({'salario':salario});
            });
        });
    }

    getSalario(pagina){
        let sal = pagina.find('#main').find('table').find('td').eq(1).find('b').text()
        let valor = parseFloat(sal.replace(' Pound per year', '').replace('.', '').replace('.', ''));
        return (valor/12) * 6.8;
    }

    async getAliasClub(club){
        return new Promise ( (resolve, reject) => {
            var filepath = appRoot.path+'/assets/alias_club.json';
            
            if(!fs.existsSync(filepath)){
                resolve([]);
                return;
            }

            fs.readFile(filepath, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }   
                data = JSON.parse(data)

                if(!data[club]){
                    resolve([]);
                    return;
                }

                resolve(data[club]);
              });
        });
    }

    
}

module.exports = new Player;