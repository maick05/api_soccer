const cheerio = require('cheerio');
const config = require('config');
const moment = require('moment');
const strHelper = require('../../helpers/stringHelper');
const dateHelper = require('../../helpers/dateHelper');
const appRoot = require('app-root-path');
const puppeteer = require('puppeteer');
const fs = require('fs');
var nameFound = '';
var arrMsgErr = [];

class Player{
    getExtraInfoPlayer(nome, club, data_nasc, pais){ 
        return new Promise((resolve, reject) => {
            this.searchPlayer(nome, club, data_nasc, pais).then(async (objUrl) => {
                this.getInfoFromPagePlayer(objUrl)
                    .then(retorno => resolve(retorno))
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    async searchPlayer(nome, equipe, data_nasc, pais){
        return new Promise(async (resolve, reject) => {
            try {
                this.getAliasClub(equipe).then(async alias => {
                    var termo =(nome).toLowerCase().replace(' ', '+');

                    const browser = await puppeteer.launch({
                        args: ['--disable-dev-shm-usage']
                    });
                    const [page] = await browser.pages();
                    let index = 1;

                    await page.goto('https://www.transfermarkt.com.br/schnellsuche/ergebnis/schnellsuche?query='+termo, { waitUntil: 'networkidle0' , timeout: 90000});
                    var data = await page.evaluate(() => document.querySelector('*').outerHTML);
                    var $ = cheerio.load(data);
                    if($('.spielprofil_tooltip').length == 0){
                        reject({
                            'sucesso': false,
                            'response': 'Erro ao pesquisar jogador, results não encontrado.',
                            'retornos': arrMsgErr,
                            'codErr': 'not_found_search'
                        });
                        return;
                    }


                    var urlPlayer = await this.buscaUrlPesquisa(data, data_nasc, alias);
                    
                    let i = 0;
                    let fim = false;
                    while(urlPlayer == '' && i <= 10 && !fim){
                        index++;
                        if($('.page[title="Página '+index+'"]').length > 0){
                            await page.click('.page[title="Página '+index+'"]');
                            await page.waitForSelector('.page.selected[title="Página '+index+'"]');
                        }else{
                            fim = true;
                        }

                        data = await page.evaluate(() => document.querySelector('*').outerHTML);
                        $ = cheerio.load(data);
                        urlPlayer = await this.buscaUrlPesquisa(data, data_nasc, alias);
                        console.log('tentativa '+i);
                        i++;
                    }
                    await browser.close();
                    resolve(urlPlayer);
                });
            } catch (err) {
                reject({
                    'sucesso': false,
                    'response': 'Erro ao pesquisar jogador. '+err,
                    'retornos': arrMsgErr,
                    'codErr': 'not_found_search_jserr'
                });
            }
        });
    }

    async getInfoFromPagePlayer(urlPlayer){
        const contexto = this;
        return new Promise(async (resolve, reject) => {
            try {
                const browser = await puppeteer.launch({
                    args: ['--disable-dev-shm-usage']
                });
                
                const [page] = await browser.pages();
                await page.goto('https://www.transfermarkt.com.br'+urlPlayer, { waitUntil: 'networkidle0', timeout: 90000});
                const data = await page.evaluate(() => document.querySelector('*').outerHTML);
                var $ = cheerio.load(data);
                var element = {};
                if($('table.auflistung').find('tr').length < 14){
                    reject({
                        'sucesso': false,
                        'response': 'Erro ao pegar informações jogador.',
                        'retornos': arrMsgErr,
                        'nameFound': nameFound,
                        'codErr': 'cant_get infopage'
                    });
                    return;
                }

                nameFound = $('table.auflistung').find('tr').eq(1).find('td').text().trim();
                nameFound = urlPlayer.split('/')[urlPlayer.split('/').length-1]+'_'+nameFound;
                element.dataFimContrato = $('table.auflistung').find('tr').eq(12).find('td').text().trim();
                element.dataInicioContrato = $('table.auflistung').find('tr').eq(11).find('td').text().trim();
                element.dataRenovacaoContrato = $('table.auflistung').find('tr').eq(13).find('td').text().trim();
                element.empresarios = $('table.auflistung').find('tr').eq(9).find('td').text().trim();
                if($('.hauptposition-left').html().split('<br>').length < 2){
                    arrMsgErr.push('Posição principal não encontrada');
                }else{
                    element.posicaoPrincipal = $('.hauptposition-left').html().split('<br>')[1].trim();
                }
                element.valor = this.getValor($('*'));
                await browser.close();
                resolve({
                    'sucesso': true,
                    'response': element,
                    'nameFound': nameFound,
                    'retornos': arrMsgErr
                });

              } catch (err) {
                reject({
                    'sucesso': false,
                    'response': 'Erro ao pegar informações jogador. '+err,
                    'retornos': arrMsgErr,
                    'nameFound': nameFound,
                    'codErr': 'cant_get infopage_jserr'
                });
              }
        });
    }

    getValor(pagina){
        if(pagina.find('.zeile-oben').find('.right-td').find('a').length == 0){
            arrMsgErr.push('Valor não encontrado');
            return null;
        }
        let valor = pagina.find('.zeile-oben').find('.right-td').find('a').first().text();
        valor = valor.replace(' €', '').replace(' ', '').replace(',', '.');
        if(!valor){
            return null;
        }
        let price = strHelper.extrairNumeros(valor);
        let unidade = strHelper.extrairLetras(valor);
        let fatorUnidade = this.getFatorByUnidade(unidade);
        return price * fatorUnidade * 6.8;
    }

    getFatorByUnidade(str){
        switch(str){
            case 'mi':
                return 1000000;
                break;
            default:
                return 1
                break;
        }
    }

    buscaUrlPesquisa(data, data_nasc, aliasClub){
        const contexto = this;
        const $ = cheerio.load(data);
        var results = $('.spielprofil_tooltip');

        var urlPlayer = ''; 
        var pos = 0;
        results.each(function(){
            pos++;
            if($(this).parents('tr').eq(0).next().find('a').length == 0){
                arrMsgErr.push('Club não encontrado.  pos=>'+pos);
                return true;
            }
            var clubTM = strHelper.retirarAcentos($(this).parents('tr').eq(0).next().find('a').text().trim());

            if(!aliasClub.includes(clubTM)){
                return true;
            }

            if($(this).parents('td:not(.hauptlink)').parent().find('.zentriert').length == 0){
                arrMsgErr.push('Idade não encontrada.  pos=>'+pos);
                return true;
            }
            
            var idadeTM = $(this).parents('td:not(.hauptlink)').parent().find('.zentriert').eq(2).html();
            // var paisTM = $(this).parents('td:not(.hauptlink)').parent().find('.zentriert').eq(3).find('img').title().toLowerCase();
            var arrIdade = contexto.getArrIdade(data_nasc);
            if(arrIdade.includes(idadeTM)){
                return true;
            }

            urlPlayer = $(this).attr('href');
        });

        return urlPlayer;
    }

    getArrIdade(data){
        const dataAtual = moment().format('YYYY-MM-DD');
        var idade = dateHelper.dateDiff(data, dataAtual, 'y');
        var i1 = parseInt(idade);
        return [i1, i1+1, i1-1];
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
                    resolve([club]);
                    return;
                }

                resolve(data[club]);
              });
        });
    }

    
}

module.exports = new Player;