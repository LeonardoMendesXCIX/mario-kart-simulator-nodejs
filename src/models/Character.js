/**
 * Classe Character - Representa um personagem do Mario Kart
 * @author Leonardo Mendes
 */

class Character {
    constructor(characterData) {
        this.id = characterData.id;
        this.name = characterData.name;
        this.emoji = characterData.emoji;
        this.stats = { ...characterData.stats };
        this.description = characterData.description;
        this.specialty = characterData.specialty;
        this.color = characterData.color;
        
        // Estados durante a corrida
        this.pontos = 0;
        this.position = 0;
        this.currentLap = 0;
        this.powerUps = [];
        this.effects = [];
        
        // Estatísticas da corrida
        this.raceStats = {
            totalDistance: 0,
            blocksCompleted: 0,
            powerUpsUsed: 0,
            confrontsWon: 0,
            confrontsLost: 0
        };
    }

    /**
     * Calcula o total de habilidade do personagem
     * @returns {number} Soma de todas as habilidades
     */
    getTotalSkill() {
        return this.stats.velocidade + this.stats.manobrabilidade + this.stats.poder;
    }

    /**
     * Aplica um power-up ao personagem
     * @param {Object} powerUp - Power-up a ser aplicado
     */
    applyPowerUp(powerUp) {
        this.powerUps.push({
            ...powerUp,
            remainingDuration: powerUp.duration
        });
        this.raceStats.powerUpsUsed++;
    }

    /**
     * Remove power-ups expirados
     */
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.remainingDuration--;
            return powerUp.remainingDuration > 0;
        });
    }

    /**
     * Calcula a velocidade efetiva considerando power-ups
     * @returns {number} Velocidade com modificadores
     */
    getEffectiveSpeed() {
        let speed = this.stats.velocidade;
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.effect === 'velocidade') {
                speed += powerUp.boost;
            }
        });
        
        return Math.max(1, speed); // Velocidade mínima de 1
    }

    /**
     * Calcula a manobrabilidade efetiva considerando power-ups
     * @returns {number} Manobrabilidade com modificadores
     */
    getEffectiveManeuverability() {
        let maneuverability = this.stats.manobrabilidade;
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.effect === 'manobrabilidade') {
                maneuverability += powerUp.boost;
            }
        });
        
        return Math.max(1, maneuverability);
    }

    /**
     * Calcula o poder efetivo considerando power-ups
     * @returns {number} Poder com modificadores
     */
    getEffectivePower() {
        let power = this.stats.poder;
        
        this.powerUps.forEach(powerUp => {
            if (powerUp.effect === 'poder') {
                power += powerUp.boost;
            }
        });
        
        return Math.max(1, power);
    }

    /**
     * Verifica se o personagem tem invencibilidade
     * @returns {boolean} True se invencível
     */
    isInvincible() {
        return this.powerUps.some(powerUp => powerUp.effect === 'invencibilidade');
    }

    /**
     * Adiciona pontos ao personagem
     * @param {number} points - Pontos a serem adicionados
     */
    addPoints(points) {
        this.pontos += points;
    }

    /**
     * Reseta o estado do personagem para uma nova corrida
     */
    resetForRace() {
        this.pontos = 0;
        this.position = 0;
        this.currentLap = 0;
        this.powerUps = [];
        this.effects = [];
        this.raceStats = {
            totalDistance: 0,
            blocksCompleted: 0,
            powerUpsUsed: 0,
            confrontsWon: 0,
            confrontsLost: 0
        };
    }

    /**
     * Retorna uma representação em string do personagem
     * @returns {string} Representação do personagem
     */
    toString() {
        return `${this.emoji} ${this.name} (${this.pontos} pts)`;
    }

    /**
     * Retorna os dados do personagem para serialização
     * @returns {Object} Dados do personagem
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            emoji: this.emoji,
            stats: this.stats,
            pontos: this.pontos,
            position: this.position,
            currentLap: this.currentLap,
            raceStats: this.raceStats
        };
    }
}

module.exports = Character;
