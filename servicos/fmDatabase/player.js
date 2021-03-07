const { resolve } = require('app-root-path');
const cheerio = require('cheerio');
const config = require('config');
const puppeteer = require('puppeteer');
const jsonRead = require('../../helpers/jsonRead');
var arrMsgErr = [];
var nameFound = '';
class Player{
    getInfoPlayer(nome, club){        
        return new Promise((resolve, reject) => {
            this.searchPlayer(nome, club).then(async (objUrl) => {
                await this.getInfoFromPagePlayer(objUrl.url, objUrl.ano).then((retorno) => {
                    resolve({'sucesso': true, 'response':retorno, 'retornos': arrMsgErr, 'nameFound': nameFound});
                });
            }).catch(erro => reject(erro));
        });
    }

    async searchPlayer(nome, equipe, ano='21'){
        return new Promise(async (resolve, reject) => {
            const anoAtual = ano;
            try {
                var termo =(nome+' '+equipe).toLowerCase().replace(' ', '+');
                jsonRead.getAliasClub(equipe).then(async alias => {
                    console.log(nome);
                    console.log(equipe);
                    const browser = await puppeteer.launch({
                        args: ['--disable-dev-shm-usage']
                    });

                    const [page] = await browser.pages();
                    let index = 1;
                    await page.goto('https://fmdataba.com/src.php?q='+termo, { waitUntil: 'networkidle0' });
                    var data = await page.evaluate(() => document.querySelector('*').outerHTML);
                    
                    var $ = cheerio.load(data);
                    if($('.gs-no-results-result').length > 0){
                        reject({
                            'sucesso': false,
                            'response': 'Erro ao pesquisar jogador, results não encontrado.',
                            'retornos': arrMsgErr,
                            'codErr': 'not_found_search'
                        });
                        return;
                    }

                    var urlPlayer = await this.buscaUrlPesquisa(data, ano, alias);

                    let i = 0;
                    let fim = false;
                    let totalTry = 10;
                    while(urlPlayer == '' && i <= totalTry && !fim){
                        index++;
                        if($('.gsc-cursor-page[aria-label="Page '+index+'"]').length > 0){
                            await page.click('.gsc-cursor-page[aria-label="Page '+index+'"]');
                            await page.waitForSelector('.gsc-cursor-page.gsc-cursor-current-page:not([aria-label="Page '+(index-1)+'"])');
                        }else{
                            await page.click('.gsc-cursor-page[aria-label="Page 1"]');
                            await page.waitForSelector('.gsc-cursor-page.gsc-cursor-current-page:not([aria-label="Page '+index+'"])');
                            ano--;
                        }

                        var data = await page.evaluate(() => document.querySelector('*').outerHTML);
                        $ = cheerio.load(data);
                        var urlPlayer = await this.buscaUrlPesquisa(data, ano, alias);
                        console.log('tentativa '+i);
                        i++;

                        if(i== totalTry && ano == (anoAtual-1)){
                            fim = true;
                        }
                    }
        
                    if(urlPlayer == ''){
                        reject({
                            'sucesso': false,
                            'response': 'Erro ao pesquisar jogador, results não encontrado.',
                            'retornos': arrMsgErr,
                            'codErr': 'not_found_search_pages'
                        });
                        return;
                    }
                    console.log(urlPlayer);
                    
                    await browser.close();
                    resolve({'url':urlPlayer, 'ano' : ano});
                }).catch(err => reject(err));
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

    async getInfoFromPagePlayer(urlPlayer, ano){
        const contexto = this;
        return new Promise(async (resolve, reject) => {
            try {
                const browser = await puppeteer.launch({
                    args: ['--disable-dev-shm-usage']
                });
                
                const [page] = await browser.pages();
                await page.goto(urlPlayer, { waitUntil: 'networkidle0', timeout: 90000});
                const data = await page.evaluate(() => document.querySelector('*').outerHTML);
                var $ = cheerio.load(data);
                var element = {};

                element.skills = contexto.getSkills($('*'));
                element.marketValue = contexto.getPrice($('*'));
                element.positions = contexto.getPositions($('*'), ano);
                await browser.close();
                resolve(element);

              } catch (err) {
                reject({
                    'sucesso': false,
                    'response': 'Erro ao pegar informações na page jogador. '+err,
                    'retornos': arrMsgErr,
                    'nameFound': nameFound,
                    'codErr': 'cant_get_infopage_jserr'
                });
              }
        });
    }

    getPrice(pagina){
        if(pagina.find('.panel-danger').eq(1).find('strong').length == 0){
            arrMsgErr.push('Price not found');
            return null;
        }

        let price = pagina.find('.panel-danger').eq(1).find('strong').text();
        price = price.replace('€ ', '');
        let unidade = price.match(/[a-zA-Z]+/g).join();
        price = parseFloat(price.replace( /^\D+/g, ''));
        return this.getValorFromUnidade(price, unidade) * 6.8;
    }

    getPositions(pagina, ano){
        var positionELCol = pagina.find('.panel.panel-default:not(.note-frame)').find('.col-lg-4.col-md-4.col-sm-6');
        if(positionELCol.length == 0){
            arrMsgErr.push('Positions not found[elCol] y='+ano);
            return [];    
        }
        var positionElTable = positionELCol.find('table');
        if(positionELCol.length < 4){
            arrMsgErr.push('Positions not found[elTable] y='+ano);
            return [];    
        }
        var positionElTr = positionElTable.eq(3).find('tr');
        if(positionELCol.length == 0){
            arrMsgErr.push('Positions not found[elTr] y='+ano);
            return [];    
        }
        
        let position = positionElTr;
        if(ano == '21'){
            var elPos = position.last().prev().find('td');
            if(elPos.length == 0 || elPos.last().length == 0){
                arrMsgErr.push('Positions not found[y21] y='+y);
                return [];    
            }
            position = position.last().prev().find('td').last().text().split(',');
        }else{
            var elPos = position.last().prev().prev().find('td');
            if(elPos.length == 0 || elPos.last().length == 0){
                arrMsgErr.push('Positions not found[y] y='+y);
                return [];    
            }
            position = position.last().prev().prev().find('td').last().text().split(',');
        }
        return position.map((item) => {return item.replace(' ', '').trim()});
    }

    getSkills(pagina){
        if(pagina.find('.tab61').find('tr').length == 0){
            arrMsgErr.push('Skills not found');
            return {};
        }

        var results = pagina.find('.tab61').find('tr');
        var skills = {};
        var pos = 0;
        results.each(function(){
            pos++;
            if(pagina.find(this).find('td').first() == 0){
                arrMsgErr.push('Skills not found[key] pos=>'+pos);
                return true;
            }
            let key = pagina.find(this).find('td').first().text();
            if(pagina.find(this).find('td').eq(1).find('.progress-bar').first() == 0){
                arrMsgErr.push('Skills not found[tdVal] key=>'+key);
                return true;
            }
            let tdVal = pagina.find(this).find('td').eq(1).find('.progress-bar').first().css('width');
            skills[key] = tdVal.replace('%', '');
        });
        return skills;
    }

    buscaUrlPesquisa(data, ano, alias){
        const contexto = this;
        const $ = cheerio.load(data);
        var results = $('.gsc-webResult.gsc-result');
        var urlPlayer = '';
        var pos = 0;
        results.each(function(){
            pos++;
            let linkEl = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-long');
            if(linkEl.length == 0){
                arrMsgErr.push('Link não encontrado => y='+ano+' pos='+pos);
                return true;
            }

            var link = linkEl.text();
            if(link.split('https://').length < 1){
                arrMsgErr.push('Link em formato diferente => y='+ano+' pos='+pos);
                return true;
            }

            link = link.split('https://')[1];
            if(link.split('/').length < 2){
                arrMsgErr.push('Link em formato diferente[/] => y='+ano+' pos='+pos);
                return true;
            }

            let arrLink = link.split('/');
            nameFound = arrLink[arrLink.length-3]+'/'+arrLink[arrLink.length-2];

            if(link.split('/')[1] == ano || (link.split('/')[1] == 'pt' && link.split('/')[2] == ano)){
                let clubEl = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-breadcrumb').find('span');
                if(clubEl.length == 0 || clubEl.last().length == 0){
                    arrMsgErr.push('Clube não encontrado => y='+ano+' pos='+pos);
                    return true;
                }
                var club = clubEl.last().text();
                club = contexto.retiraAcentos(club.replace(' › ', '').trim());
                if(alias.includes(club)){
                    urlPlayer = 'https://'+link;
                    return false;
                }
            }
        });

        return urlPlayer;
    }

    getValorFromUnidade(valor, unidade){
        switch(unidade){
            case 'K':
                return valor * 1000;
                break;
            case 'M':
                return valor * 1000000;
                break;
            default:
                return valor;
                break;
        }

        return valor;
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
}
module.exports = new Player;