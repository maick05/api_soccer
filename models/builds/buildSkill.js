class BuildSkill{
    constructor(dadosPlayer){
        this.dadosPlayer = dadosPlayer;
    }

    buildSkill(){
        var playerSkill = {};
        playerSkill.precisaoChute = this.getPrecisaoChute();
        playerSkill.precisaoPasse = this.getPrecisaoPasse();
        playerSkill.desarmesPorJogo = this.getDesarmesPorJogo();
        playerSkill.interceptacoesPorJogo = this.getInterceptacoesPorjogo();
        playerSkill.drible = this.getDrible();
        playerSkill.precisaoPenalti = this.getPrecisaoPenalti();
        playerSkill.precisaoDuelo = this.getPrecisaoDuelo();
        playerSkill.gols = this.getGols();
        playerSkill.golsPorJogo = this.getGolsPorJogo();
        playerSkill.assistencias = this.getAssistencias();
        playerSkill.assistenciasPorJogo = this.getAssistenciasPorJogo();
        playerSkill.defesasPorJogo = this.getDefesasPorJogo();
        playerSkill.faltasCometidas = this.getFaltasCometidasPorJogo();
        playerSkill.faltasSofridas = this.getFaltasSofridasPorJogo();
        playerSkill.cartoesAmarelosPorJogo = this.getCartoesAmarelosPorJogo();
        playerSkill.cartoesVermelhos = this.getCartoesVermelhos();
        playerSkill.fatorVelocidade = this.getFatorVelocidade();
        playerSkill.notaGeral = this.getNotaGeral();

        
        return playerSkill;
    }

    getPrecisaoChute(){
        return (this.dadosPlayer.shots.on/this.dadosPlayer.shots.total)*100;
    }

    getPrecisaoPasse(){
        return 100-parseInt(this.dadosPlayer.passes.key);
    }

    getDesarmesPorJogo(){
        return this.dadosPlayer.tackles.total/this.dadosPlayer.games.appearences;
    }

    getInterceptacoesPorjogo(){
        return this.dadosPlayer.tackles.interceptions/this.dadosPlayer.games.appearences;
    }

    getDrible(){
        return (this.dadosPlayer.dribbles.success/this.dadosPlayer.dribbles.attempts)*100;
    }

    getPrecisaoPenalti(){
        return (this.dadosPlayer.penalty.success/(this.dadosPlayer.penalty.success + this.dadosPlayer.penalty.missed))*100;
    }

    getPrecisaoDuelo(){
        return (this.dadosPlayer.duels.won/this.dadosPlayer.duels.total)*100;
    }

    getGols(){
        return this.dadosPlayer.goals.total;
    }

    getGolsPorJogo(){
        return (this.dadosPlayer.goals.total/this.dadosPlayer.games.appearences);
    }

    getAssistencias(){
        return this.dadosPlayer.goals.assists;
    }

    getAssistenciasPorJogo(){
        return (this.dadosPlayer.goals.assists/this.dadosPlayer.games.appearences);
    }

    getDefesasPorJogo(){
        return this.dadosPlayer.goals.saves/this.dadosPlayer.games.appearences;
    }

    getFaltasCometidasPorJogo(){
        return (this.dadosPlayer.fouls.committed/this.dadosPlayer.games.appearences);
    }

    getFaltasSofridasPorJogo(){
        return (this.dadosPlayer.fouls.drawn/this.dadosPlayer.games.appearences);
    }

    getCartoesAmarelosPorJogo(){
        return (this.dadosPlayer.cards.yellow/this.dadosPlayer.games.appearences);
    }

    getCartoesVermelhos(){
        return (this.dadosPlayer.cards.red);
    }

    getFatorVelocidade(){
        return (
                    parseInt(this.dadosPlayer.height.replace(' cm', ''))
                    + 
                    parseInt(this.dadosPlayer.weight.replace(' kg', ''))
                )
                /2,35;
    }

    getNotaGeral(){
        return this.dadosPlayer.rating * 10;
    }
}

module.exports = BuildSkill;