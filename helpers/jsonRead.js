const appRoot = require('app-root-path');
const fs = require('fs');

module.exports = {
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

                data[club].push(club);

                resolve(data[club]);
              });
        });
    }
}