const moment = require('moment');
module.exports = {
    formatDataDB(data, formatoEntrada='DD/MM/YYYY'){
        return moment(data, formatoEntrada).format('YYYY-MM-DD');
    },
    dateDiff(dataInicio, dataFim, diff){
        dataInicio = new Date(dataInicio);
        dataFim = new Date(dataFim);

        var objDiff = {};
        objDiff['ms'] = dataFim.getTime() - dataInicio.getTime()
        objDiff['sec'] = objDiff['ms'] / 1000;
        objDiff['min'] = objDiff['sec'] / 60;
        objDiff['h'] = objDiff['min'] / 60;
        objDiff['d'] = objDiff['h'] / 24;
        objDiff['m'] = objDiff['d'] / 30;
        objDiff['y'] = objDiff['m'] / 12; 
        return objDiff[diff.toLowerCase()];
    },
    toTimestamp(strDate){
        var datum = Date.parse(strDate);
        return datum/1000;
    }
}