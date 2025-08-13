/**
 * Race Engine - Motor principal das corridas do Mario Kart
 * @author Leonardo Mendes
 */

const charactersData = require('../config/characters.json');
const tracksData = require('../config/tracks.json');

class RaceEngine {
    constructor() {
        this.powerUps = charactersData.powerUps;
    }

    /**
     * Gera um número aleatório entre min e max (inclusive)
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {number} Número aleatório
     */
    rollDice(min = 1, max = 6) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Gera um bloco aleatório baseado nas probabilidades da pista
     * @param {Object} track - Dados da pista
     * @returns {string} Tipo do bloco (RETA, CURVA, CONFRONTO)
     */
    getRandomBlock(track) {
        const random = Math.random();
        let cumulative = 0;
        
        for (const block of track.blocks) {
            cumulative += block.probability;
            if (random <= cumulative) {
                return block.type;
            }
        }
        
        return 'RETA'; // Fallback
    }

    /**
     * Gera um power-up aleatório
     * @returns {Object|null} Power-up ou null se não houver
     */
    getRandomPowerUp() {
        if (Math.random() < 0.3) { // 30% de chance de power-up
            const randomIndex = Math.floor(Math.random() * this.powerUps.length);
            return { ...this.powerUps[randomIndex] };
        }
        return null;
    }

    /**
     * Executa uma rodada de corrida
     * @param {Race} race - Objeto da corrida
     * @returns {Object} Resultado da rodada
     */
    async executeRound(race) {
        if (race.isFinished()) {
            race.finish();
            return { finished: true, results: race.getStats() };
        }

        const block = this.getRandomBlock(race.track);
        const roundResults = [];

        race.addToLog(`\n🎲 === RODADA ${race.currentRound + 1} - BLOCO: ${block} ===`, 'system');

        // Processa cada personagem
        for (const character of race.characters) {
            const result = await this.processCharacterTurn(character, block, race);
            roundResults.push(result);
        }

        // Verifica power-ups aleatórios
        this.distributeRandomPowerUps(race.characters, race);

        race.nextRound();

        return {
            finished: race.isFinished(),
            block,
            results: roundResults,
            ranking: race.getCurrentRanking(),
            raceStats: race.getStats()
        };
    }

    /**
     * Processa o turno de um personagem
     * @param {Character} character - Personagem
     * @param {string} blockType - Tipo do bloco
     * @param {Race} race - Corrida atual
     * @returns {Object} Resultado do turno
     */
    async processCharacterTurn(character, blockType, race) {
        const diceResult1 = this.rollDice();
        const diceResult2 = this.rollDice();
        
        let points = 0;
        let message = '';
        let distance = 0;

        switch (blockType) {
            case 'RETA':
                points = this.processReta(character, diceResult1);
                distance = points;
                message = `${character.emoji} ${character.name} rolou ${diceResult1} + VELOCIDADE(${character.getEffectiveSpeed()}) = ${points} pontos`;
                break;
                
            case 'CURVA':
                points = this.processCurva(character, diceResult1);
                distance = points;
                message = `${character.emoji} ${character.name} rolou ${diceResult1} + MANOBRABILIDADE(${character.getEffectiveManeuverability()}) = ${points} pontos`;
                break;
                
            case 'CONFRONTO':
                const opponent = this.getRandomOpponent(character, race.characters);
                const confrontResult = this.processConfronto(character, opponent, diceResult1, diceResult2);
                points = confrontResult.points;
                message = confrontResult.message;
                
                // Atualiza estatísticas de confronto
                if (points > 0) {
                    character.raceStats.confrontsWon++;
                } else {
                    character.raceStats.confrontsLost++;
                }
                break;
        }

        character.addPoints(Math.max(0, points));
        
        // Atualiza estatísticas do personagem
        character.raceStats.blocksCompleted++;
        character.raceStats.totalDistance += distance || 0;
        
        race.addToLog(message, 'action');

        return {
            character: character.name,
            blockType,
            diceResults: [diceResult1, diceResult2],
            points: Math.max(0, points),
            totalPoints: character.pontos,
            distance,
            message
        };
    }

    /**
     * Processa bloco RETA
     * @param {Character} character - Personagem
     * @param {number} diceResult - Resultado do dado
     * @returns {number} Pontos ganhos
     */
    processReta(character, diceResult) {
        return diceResult + character.getEffectiveSpeed();
    }

    /**
     * Processa bloco CURVA
     * @param {Character} character - Personagem
     * @param {number} diceResult - Resultado do dado
     * @returns {number} Pontos ganhos
     */
    processCurva(character, diceResult) {
        return diceResult + character.getEffectiveManeuverability();
    }

    /**
     * Processa bloco CONFRONTO
     * @param {Character} character - Personagem atacante
     * @param {Character} opponent - Oponente
     * @param {number} diceResult1 - Primeiro dado
     * @param {number} diceResult2 - Segundo dado
     * @returns {Object} Resultado do confronto
     */
    processConfronto(character, opponent, diceResult1, diceResult2) {
        const characterTotal = diceResult1 + character.getEffectivePower();
        const opponentTotal = diceResult2 + opponent.getEffectivePower();
        
        let points = 0;
        let message = '';

        if (characterTotal > opponentTotal) {
            points = characterTotal;
            message = `${character.emoji} ${character.name} venceu ${opponent.emoji} ${opponent.name} no confronto! (${characterTotal} vs ${opponentTotal}) = +${points} pontos`;
        } else if (characterTotal < opponentTotal) {
            points = 0;
            message = `${character.emoji} ${character.name} perdeu para ${opponent.emoji} ${opponent.name} no confronto! (${characterTotal} vs ${opponentTotal}) = 0 pontos`;
        } else {
            points = Math.floor(characterTotal / 2);
            message = `${character.emoji} ${character.name} empatou com ${opponent.emoji} ${opponent.name} no confronto! (${characterTotal} vs ${opponentTotal}) = +${points} pontos`;
        }

        return { points, message };
    }

    /**
     * Seleciona um oponente aleatório
     * @param {Character} character - Personagem atual
     * @param {Array} allCharacters - Todos os personagens
     * @returns {Character} Oponente selecionado
     */
    getRandomOpponent(character, allCharacters) {
        const opponents = allCharacters.filter(c => c.id !== character.id);
        const randomIndex = Math.floor(Math.random() * opponents.length);
        return opponents[randomIndex];
    }

    /**
     * Distribui power-ups aleatórios
     * @param {Array} characters - Lista de personagens
     * @param {Race} race - Corrida atual
     */
    distributeRandomPowerUps(characters, race) {
        characters.forEach(character => {
            const powerUp = this.getRandomPowerUp();
            if (powerUp) {
                character.applyPowerUp(powerUp);
                race.addToLog(`✨ ${character.emoji} ${character.name} recebeu ${powerUp.emoji} ${powerUp.name}!`, 'system');
            }
        });
    }

    /**
     * Simula uma corrida completa
     * @param {Race} race - Corrida a ser simulada
     * @returns {Object} Resultado final da corrida
     */
    async simulateRace(race) {
        race.start();
        const allResults = [];

        while (!race.isFinished()) {
            const roundResult = await this.executeRound(race);
            allResults.push(roundResult);
            
            // Pequena pausa para simular tempo real
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Garante que a corrida seja finalizada
        if (!race.isFinished()) {
            race.finish();
        } else if (race.status !== 'finished') {
            race.finish();
        }

        return {
            raceId: race.id,
            winner: race.winner,
            finalRanking: race.getCurrentRanking(),
            raceLog: race.raceLog,
            stats: race.getStats(),
            allResults
        };
    }
}

module.exports = RaceEngine;
