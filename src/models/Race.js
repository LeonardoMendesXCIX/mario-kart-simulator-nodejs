/**
 * Classe Race - Representa uma corrida do Mario Kart
 * @author Leonardo Mendes
 */

class Race {
    constructor(track, characters) {
        this.id = this.generateRaceId();
        this.track = track;
        this.characters = characters;
        this.currentRound = 0;
        this.maxRounds = track.laps * 5; // 5 blocos por volta
        this.status = 'waiting'; // waiting, running, finished
        this.winner = null;
        this.startTime = null;
        this.endTime = null;
        this.raceLog = [];
        
        // Inicializa personagens para a corrida
        this.characters.forEach((character, index) => {
            character.resetForRace();
            character.position = index + 1;
        });
    }

    /**
     * Gera um ID único para a corrida
     * @returns {string} ID da corrida
     */
    generateRaceId() {
        return `race_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Inicia a corrida
     */
    start() {
        if (this.status !== 'waiting') {
            throw new Error('A corrida já foi iniciada ou finalizada');
        }
        
        this.status = 'running';
        this.startTime = new Date();
        this.addToLog('🏁 CORRIDA INICIADA!', 'system');
        this.addToLog(`📍 Pista: ${this.track.emoji} ${this.track.name}`, 'system');
        this.addToLog(`👥 Participantes: ${this.characters.map(c => c.toString()).join(', ')}`, 'system');
    }

    /**
     * Verifica se a corrida terminou
     * @returns {boolean} True se a corrida terminou
     */
    isFinished() {
        return this.status === 'finished' || 
               this.currentRound >= this.maxRounds ||
               this.characters.some(character => character.currentLap >= this.track.laps);
    }

    /**
     * Finaliza a corrida
     */
    finish() {
        if (this.status === 'finished') {
            return;
        }
        
        this.status = 'finished';
        this.endTime = new Date();
        
        // Ordena personagens por pontos (decrescente)
        this.characters.sort((a, b) => b.pontos - a.pontos);
        
        // Define posições finais
        this.characters.forEach((character, index) => {
            character.position = index + 1;
        });
        
        this.winner = this.characters[0];
        this.addToLog(`🏆 VENCEDOR: ${this.winner.toString()}!`, 'system');
        this.addToLog('📊 CLASSIFICAÇÃO FINAL:', 'system');
        
        this.characters.forEach((character, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏁';
            this.addToLog(`${medal} ${index + 1}º lugar: ${character.toString()}`, 'result');
        });
    }

    /**
     * Adiciona uma entrada ao log da corrida
     * @param {string} message - Mensagem do log
     * @param {string} type - Tipo do log (system, action, result)
     */
    addToLog(message, type = 'action') {
        const logEntry = {
            round: this.currentRound,
            timestamp: new Date(),
            message,
            type
        };
        
        this.raceLog.push(logEntry);
    }

    /**
     * Avança para a próxima rodada
     */
    nextRound() {
        if (this.isFinished()) {
            this.finish();
            return;
        }
        
        this.currentRound++;
        
        // Atualiza power-ups dos personagens
        this.characters.forEach(character => {
            character.updatePowerUps();
        });
    }

    /**
     * Calcula o progresso da corrida em porcentagem
     * @returns {number} Progresso de 0 a 100
     */
    getProgress() {
        return Math.min(100, (this.currentRound / this.maxRounds) * 100);
    }

    /**
     * Retorna o tempo decorrido da corrida
     * @returns {number} Tempo em milissegundos
     */
    getElapsedTime() {
        if (!this.startTime) return 0;
        const endTime = this.endTime || new Date();
        return endTime.getTime() - this.startTime.getTime();
    }

    /**
     * Retorna o tempo formatado da corrida
     * @returns {string} Tempo formatado (mm:ss)
     */
    getFormattedTime() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Retorna o ranking atual dos personagens
     * @returns {Array} Array de personagens ordenados por pontos
     */
    getCurrentRanking() {
        return [...this.characters].sort((a, b) => b.pontos - a.pontos);
    }

    /**
     * Retorna estatísticas da corrida
     * @returns {Object} Estatísticas da corrida
     */
    getStats() {
        return {
            id: this.id,
            track: this.track.name,
            status: this.status,
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            progress: this.getProgress(),
            elapsedTime: this.getFormattedTime(),
            participants: this.characters.length,
            winner: this.winner ? this.winner.name : null,
            ranking: this.getCurrentRanking().map(c => ({
                name: c.name,
                emoji: c.emoji,
                points: c.pontos,
                position: c.position
            }))
        };
    }

    /**
     * Retorna os dados da corrida para serialização
     * @returns {Object} Dados da corrida
     */
    toJSON() {
        return {
            id: this.id,
            track: this.track,
            characters: this.characters.map(c => c.toJSON()),
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            status: this.status,
            winner: this.winner ? this.winner.toJSON() : null,
            startTime: this.startTime,
            endTime: this.endTime,
            stats: this.getStats(),
            raceLog: this.raceLog
        };
    }
}

module.exports = Race;
