const { Curl } = require('node-libcurl');

class CurlService {
    makeGet(url){
        return new Promise ( async (resolve, reject) => {
            const curl = new Curl();
            curl.setOpt('URL', url);
            curl.setOpt('FOLLOWLOCATION', true);
            curl.on('end', function (statusCode, data, headers) {
                resolve(data);
                this.close();
            });
            curl.on('error', function (error, errorCode) {
                // faça algo com error
                reject(error);
                this.close()
            });
            curl.perform();
        });
    }
}

module.exports = new CurlService;