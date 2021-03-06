const cheerio = require('cheerio');
const config = require('config');
const jsonRead = require('../../helpers/jsonRead');
const CurlService = require('../helpers/curlService');
const stringHelper = require('../../helpers/stringHelper');
const dateHelper = require('../../helpers/dateHelper');

var nameFound = '';
var arrMsgErr = [];

class Player{
    getSalaryPlayer(nome, club, data_nasc, res){ 
        const contexto = this;       
        return new Promise(async (resolve, reject) => {
            try{
                jsonRead.getAliasClub(club).then(async alias => {
                    var data = await CurlService.makePost('https://www.football-lifestyle.co.uk/suche.php', {spieler: nome});
                    var $ = cheerio.load(data);

                    if($('#tableb').length == 0){
                        reject({
                            'sucesso': false,
                            'response': 'Erro ao pesquisar jogador, results não encontrado.',
                            'retornos': arrMsgErr,
                            'codErr': 'not_found_search'
                        });
                        return;
                    }

                    let results = $('#tableb');
                    let link = '';
                    let pos = 0;
                    results.each(async function(){
                        pos++;
                        if($(this).find('td').length < 2 ){
                            arrMsgErr.push('Td não encontrado.  pos=>'+pos);
                            return true;
                        }

                        let td = $(this).find('td').first().next();
                        let idPlayer = td.find('a').attr('href');
                        var nameFLS = td.find('a').html().trim();
                        var arrInfo = td.html().split('<br>');
                        
                        if(arrInfo.length < 4){
                            arrMsgErr.push('Arr Info não encontrado.  pos=>'+pos);
                            return true;
                        }

                        let clubFLS = stringHelper.retirarAcentos(arrInfo[1].trim());
                        let dataNascFLS = dateHelper.formatDataDB(arrInfo[3].trim(), 'DD.MM.YYYY');

                        if(!alias.includes(clubFLS)){
                            return true;
                        }
                        
                        if(data_nasc == dataNascFLS){
                            link = 'https://www.football-lifestyle.co.uk'+idPlayer;
                            nameFound = idPlayer+'_'+nameFLS;
                            return false;
                        }
                    });

                    if(!link){
                        reject({
                            'sucesso': false,
                            'response': 'Erro ao pesquisar jogador, jogador não encontrado.',
                            'retornos': arrMsgErr,
                            'codErr': 'not_found_search_pages'
                        });
                        return;
                    }

                    data = await CurlService.makeGet(link);
                    $ = cheerio.load(data);
                    var salario = contexto.getSalario($('*'));
                    resolve({
                        'sucesso': true,
                        'response':salario,
                        'nameFound': nameFound,
                        'retornos': arrMsgErr
                    });
                }).catch(err => reject(err));
            }catch(err){
                reject({
                    'sucesso': false,
                    'response': 'Erro ao pesquisar salario. '+err,
                    'retornos': arrMsgErr,
                    'nameFound': nameFound,
                    'codErr': 'cant_search_player_jserr'
                });
            }
        });
    }

    getSalario(pagina){
        let tdEl = pagina.find('#main').find('table').find('td');
        if(tdEl.length < 2 || tdEl.eq(1).find('b').length == 0){
            arrMsgErr.push('Salario não encontrado.');
            return null;
        }

        let sal = pagina.find('#main').find('table').find('td').eq(1).find('b').text()
        let valor = parseFloat(sal.replace(' Pound per year', '').replace('.', '').replace('.', ''));
        return (valor/12) * 6.8;
    }    
}

module.exports = new Player;