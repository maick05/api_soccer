const cheerio = require('cheerio');
const request = require('request');
const config = require('config');
const CurlService = require('../helpers/curlService');
const puppeteer = require('puppeteer');

class Player{
    getInfoPlayer(res){        
        this.searchPlayer().then(async (urlPlayer) => {
            this.getInfoFromPagePlayer(urlPlayer).then((retorno) => {
                res.send(retorno);
            });
        });
    }

    async searchPlayer(){
        return new Promise(async (resolve, reject) => {
            try {
                const browser = await puppeteer.launch();
                const [page] = await browser.pages();
        
                await page.goto('https://fmdataba.com/src.php?q=diego+souza', { waitUntil: 'networkidle0' });
                const data = await page.evaluate(() => document.querySelector('*').outerHTML);
                var $ = cheerio.load(data);
                var results = $('.gsc-webResult.gsc-result');
                var urlPlayer = '';
                results.each(function(){
                    var link = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-long').text();
                    link = link.split('https://')[1];
                    if(link.split('/')[1] == '21' || (link.split('/')[1] == 'pt' && link.split('/')[2] == '21')){
                        var club = $(this).find('.gs-bidi-start-align.gs-visibleUrl.gs-visibleUrl-breadcrumb').find('span').last().text();
                        club = club.replace(' › ', '');
                        if(club == 'Grêmio'){
                            urlPlayer = 'https://'+link;
                        }
                    }
                });
    
                console.log(urlPlayer);
                await browser.close();
                resolve(urlPlayer);
              } catch (err) {
                reject(err);
              }
        });
    }

    async getInfoFromPagePlayer(urlPlayer){
        return new Promise(async (resolve, reject) => {
            try {
                const browser = await puppeteer.launch();
                const [page] = await browser.pages();
        
                await page.goto(urlPlayer, { waitUntil: 'networkidle0' });
                const data = await page.evaluate(() => document.querySelector('*').outerHTML);
                var $ = cheerio.load(data);
                resolve(data);
              } catch (err) {
                reject(err);
              }
        });
    }
}
module.exports = new Player;