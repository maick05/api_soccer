const cheerio = require('cheerio');
const config = require('config');
const puppeteer = require('puppeteer');

class Player{
    getInfoPlayer(nome, club, res){        
        this.searchPlayer(nome, club).then(async (objUrl) => {
            await this.getInfoFromPagePlayer(objUrl.url, objUrl.ano).then((retorno) => {
                res.send(retorno);
            });
        });
    }

    async searchPlayer(nome, equipe, ano='21'){
        return new Promise(async (resolve, reject) => {
            try {
                var termo =(nome+' '+equipe).toLowerCase().replace(' ', '+');
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
                var urlPlayer = await this.buscaUrlPesquisa(data, ano, equipe);
                // console.log('urlPlayer -> '  + urlPlayer);

                let i = 0;
                while(urlPlayer == '' && i <= 10){
                    index++;
                    if($('.gsc-cursor-page[aria-label="Page '+index+'"]').length > 0){
                        await page.click('.gsc-cursor-page[aria-label="Page '+index+'"]');
                        await page.waitForSelector('.gsc-cursor-page.gsc-cursor-current-page[aria-label="Page '+index+'"]');
                    }else{
                        ano--;
                    }

                    var data = await page.evaluate(() => document.querySelector('*').outerHTML);
                    $ = cheerio.load(data);
                    var urlPlayer = await this.buscaUrlPesquisa(data, ano, equipe);
                    console.log('tentativa '+i);
                    i++;

                    if(i== 10 && ano == '21'){
                        i = 0;
                        ano--;
                    }
                }
    
                console.log(urlPlayer);
                await browser.close();
                resolve({'url':urlPlayer, 'ano' : ano});
              } catch (err) {
                reject(err);
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

                resolve(element);

              } catch (err) {
                reject(err);
              }
        });
    }

    getPrice(pagina){
        let price = pagina.find('.panel-danger').eq(1).find('strong').text();
        price = price.replace('€ ', '');
        let unidade = price.match(/[a-zA-Z]+/g).join();
        price = parseFloat(price.replace( /^\D+/g, ''));
        return this.getValorFromUnidade(price, unidade) * 6.8;
    }

    getPositions(pagina, ano){
        let position = pagina.find('.panel.panel-default:not(.note-frame)').find('.col-lg-4.col-md-4.col-sm-6').find('table').eq(3).find('tr');
        if(ano == '21'){
            position = position.last().prev().find('td').last().text().split(',');
        }else{
            position = position.last().prev().prev().find('td').last().text().split(',');
        }
        return position.map((item) => {return item.replace(' ', '').trim()});
    }

    getSkills(pagina){
        var results = pagina.find('.tab61').find('tr');
        var skills = {};
        results.each(function(){
            let key = pagina.find(this).find('td').first().text();
            let tdVal = pagina.find(this).find('td').eq(1).find('.progress-bar').first().css('width');
            skills[key] = tdVal.replace('%', '');
        });
        return skills;
    }

    buscaUrlPesquisa(data, ano, equipe){
        const contexto = this;
        const $ = cheerio.load(data);
        var results = $('.gsc-webResult.gsc-result');
        
        var urlPlayer = '';
        results.each(function(){
            var link = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-long').text();
            link = link.split('https://')[1];
            if(link.split('/')[1] == ano || (link.split('/')[1] == 'pt' && link.split('/')[2] == ano)){
                var club = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-breadcrumb').find('span').last().text();
                club = contexto.retiraAcentos(club.replace(' › ', '').trim());
                if(club == equipe){
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