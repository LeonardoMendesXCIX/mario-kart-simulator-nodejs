/**
 * Race Controller - Controlador das corridas
 * @author Leonardo Mendes
 */

const Character = require('../models/Character');
const Race = require('../models/Race');
const RaceEngine = require('../services/raceEngine');
const charactersData = require('../config/characters.json');
const tracksData = require('../config/tracks.json');

class RaceController {
    constructor() {
        this.raceEngine = new RaceEngine();
        this.activeRaces = new Map();
        this.raceHistory = [];
    }

    /**
     * Retorna todos os personagens disponíveis
     */
    getAvailableCharacters() {
        return charactersData.characters;
    }

    /**
     * Retorna todas as pistas disponíveis
     */
    getAvailableTracks() {
        return tracksData.tracks;
    }

    /**
     * Cria uma nova corrida
     */
    async createRace(characterIds, trackId) {
        try {
            if (!characterIds || characterIds.length < 2) {
                throw new Error('É necessário pelo menos 2 personagens');
            }

            const characters = characterIds.map(id => {
                const charData = charactersData.characters.find(c => c.id === id);
                if (!charData) throw new Error(`Personagem não encontrado: ${id}`);
                return new Character(charData);
            });

            const track = tracksData.tracks.find(t => t.id === trackId);
            if (!track) throw new Error(`Pista não encontrada: ${trackId}`);

            const race = new Race(track, characters);
            this.activeRaces.set(race.id, race);

            return { success: true, raceId: race.id, race: race.toJSON() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Executa uma rodada da corrida
     */
    async executeRound(raceId) {
        try {
            const race = this.activeRaces.get(raceId);
            if (!race) throw new Error('Corrida não encontrada');

            const result = await this.raceEngine.executeRound(race);
            
            if (result.finished) {
                this.raceHistory.unshift(race.toJSON());
                this.activeRaces.delete(raceId);
            }

            return { success: true, ...result, race: race.toJSON() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Simula uma corrida completa
     */
    async simulateRace(raceId) {
        try {
            const race = this.activeRaces.get(raceId);
            if (!race) throw new Error('Corrida não encontrada');

            const result = await this.raceEngine.simulateRace(race);
            this.raceHistory.unshift(race.toJSON());
            this.activeRaces.delete(raceId);

            return { success: true, ...result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Retorna o status de uma corrida
     */
    getRaceStatus(raceId) {
        const race = this.activeRaces.get(raceId);
        if (!race) return { success: false, error: 'Corrida não encontrada' };
        return { success: true, race: race.toJSON() };
    }

    /**
     * Retorna o histórico de corridas
     */
    getRaceHistory(limit = 20) {
        return this.raceHistory.slice(0, limit);
    }
}

module.exports = RaceController;
