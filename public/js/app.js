/**
 * Mario Kart Racing Simulator - Frontend JavaScript
 * @author Leonardo Mendes
 */

class MarioKartApp {
    constructor() {
        this.selectedCharacters = [];
        this.selectedTrack = null;
        this.currentRace = null;
        this.apiBase = '/api';
        
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        this.setupEventListeners();
        await this.loadCharacters();
        await this.loadTracks();
        this.showSection('setup-section');
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botões principais
        document.getElementById('create-race-btn').addEventListener('click', () => this.createRace());
        document.getElementById('simulate-race-btn').addEventListener('click', () => this.simulateRace());
        document.getElementById('next-round-btn').addEventListener('click', () => this.executeRound());
        document.getElementById('reset-race-btn').addEventListener('click', () => this.resetToSetup());
        document.getElementById('new-race-btn').addEventListener('click', () => this.resetToSetup());
        document.getElementById('view-history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('back-to-setup-btn').addEventListener('click', () => this.resetToSetup());
    }

    /**
     * Carrega personagens da API
     */
    async loadCharacters() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/characters`);
            const data = await response.json();
            
            if (data.success) {
                this.renderCharacters(data.characters);
            } else {
                this.showError('Erro ao carregar personagens');
            }
        } catch (error) {
            this.showError('Erro de conexão ao carregar personagens');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Carrega pistas da API
     */
    async loadTracks() {
        try {
            const response = await fetch(`${this.apiBase}/tracks`);
            const data = await response.json();
            
            if (data.success) {
                this.renderTracks(data.tracks);
            } else {
                this.showError('Erro ao carregar pistas');
            }
        } catch (error) {
            this.showError('Erro de conexão ao carregar pistas');
        }
    }

    /**
     * Renderiza personagens na interface
     */
    renderCharacters(characters) {
        const grid = document.getElementById('characters-grid');
        grid.innerHTML = '';

        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.dataset.characterId = character.id;
            
            card.innerHTML = `
                <span class="character-emoji">${character.emoji}</span>
                <div class="character-name">${character.name}</div>
                <div class="character-stats">
                    <div class="stat">
                        <span class="stat-label">Velocidade</span>
                        <span class="stat-value">${character.stats.velocidade}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Manobrabilidade</span>
                        <span class="stat-value">${character.stats.manobrabilidade}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Poder</span>
                        <span class="stat-value">${character.stats.poder}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.toggleCharacterSelection(character, card));
            grid.appendChild(card);
        });
    }

    /**
     * Renderiza pistas na interface
     */
    renderTracks(tracks) {
        const grid = document.getElementById('tracks-grid');
        grid.innerHTML = '';

        tracks.forEach(track => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.dataset.trackId = track.id;
            
            card.innerHTML = `
                <span class="track-emoji">${track.emoji}</span>
                <div class="track-name">${track.name}</div>
                <div class="track-difficulty">Dificuldade: ${track.difficulty}</div>
                <div class="track-description">${track.description}</div>
            `;

            card.addEventListener('click', () => this.selectTrack(track, card));
            grid.appendChild(card);
        });
    }

    /**
     * Alterna seleção de personagem
     */
    toggleCharacterSelection(character, card) {
        const index = this.selectedCharacters.findIndex(c => c.id === character.id);
        
        if (index > -1) {
            // Remove personagem
            this.selectedCharacters.splice(index, 1);
            card.classList.remove('selected');
        } else {
            // Adiciona personagem (máximo 6)
            if (this.selectedCharacters.length < 6) {
                this.selectedCharacters.push(character);
                card.classList.add('selected');
            } else {
                this.showError('Máximo de 6 personagens permitidos');
                return;
            }
        }

        this.updateSelectedCharacters();
        this.updateCreateButton();
    }

    /**
     * Seleciona pista
     */
    selectTrack(track, card) {
        // Remove seleção anterior
        document.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
        
        // Adiciona nova seleção
        card.classList.add('selected');
        this.selectedTrack = track;
        
        this.updateCreateButton();
    }

    /**
     * Atualiza lista de personagens selecionados
     */
    updateSelectedCharacters() {
        const container = document.getElementById('selected-characters');
        
        if (this.selectedCharacters.length === 0) {
            container.innerHTML = '<p class="empty-message">Nenhum personagem selecionado</p>';
        } else {
            container.innerHTML = this.selectedCharacters.map(char => 
                `<div class="selected-character">
                    ${char.emoji} ${char.name}
                </div>`
            ).join('');
        }
    }

    /**
     * Atualiza estado do botão criar corrida
     */
    updateCreateButton() {
        const createBtn = document.getElementById('create-race-btn');
        const simulateBtn = document.getElementById('simulate-race-btn');
        const canCreate = this.selectedCharacters.length >= 2 && this.selectedTrack;
        
        createBtn.disabled = !canCreate;
        simulateBtn.disabled = !canCreate;
    }

    /**
     * Cria uma nova corrida
     */
    async createRace() {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBase}/races`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    characterIds: this.selectedCharacters.map(c => c.id),
                    trackId: this.selectedTrack.id
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentRace = data.race;
                this.showRaceSection();
                this.updateRaceInfo();
                this.showSuccess('Corrida criada! Clique em "Próxima Rodada" para começar.');
            } else {
                this.showError(data.error || 'Erro ao criar corrida');
            }
        } catch (error) {
            this.showError('Erro de conexão ao criar corrida');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Simula corrida completa
     */
    async simulateRace() {
        try {
            this.showLoading(true);
            
            // Primeiro cria a corrida
            const createResponse = await fetch(`${this.apiBase}/races`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    characterIds: this.selectedCharacters.map(c => c.id),
                    trackId: this.selectedTrack.id
                })
            });

            const createData = await createResponse.json();
            
            if (!createData.success) {
                throw new Error(createData.error || 'Erro ao criar corrida');
            }

            // Depois simula
            const simulateResponse = await fetch(`${this.apiBase}/races/${createData.raceId}/simulate`, {
                method: 'POST'
            });

            const simulateData = await simulateResponse.json();
            
            if (simulateData.success) {
                this.currentRace = simulateData.raceLog[simulateData.raceLog.length - 1];
                this.showResultsSection(simulateData);
            } else {
                this.showError(simulateData.error || 'Erro ao simular corrida');
            }
        } catch (error) {
            this.showError('Erro de conexão ao simular corrida');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Executa próxima rodada
     */
    async executeRound() {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBase}/races/${this.currentRace.id}/round`, {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentRace = data.race;
                this.updateRaceInfo();
                this.updateRanking(data.ranking);
                this.updateRaceLog(data.race.raceLog);
                
                if (data.finished) {
                    this.showResultsSection(data);
                }
            } else {
                this.showError(data.error || 'Erro ao executar rodada');
            }
        } catch (error) {
            this.showError('Erro de conexão ao executar rodada');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Mostra seção da corrida
     */
    showRaceSection() {
        this.showSection('race-section');
    }

    /**
     * Mostra seção de resultados
     */
    showResultsSection(raceData) {
        this.showSection('results-section');
        
        // Atualiza vencedor
        if (raceData.winner) {
            document.getElementById('winner-text').textContent = 
                `🥇 ${raceData.winner.emoji} ${raceData.winner.name} Venceu!`;
        }
        
        // Atualiza ranking final
        this.updateFinalRanking(raceData.finalRanking || raceData.ranking);
        
        // Atualiza estatísticas
        this.updateRaceStats(raceData.stats || raceData.raceStats);
    }

    /**
     * Atualiza informações da corrida
     */
    updateRaceInfo() {
        if (!this.currentRace) return;
        
        document.getElementById('race-track').textContent = 
            `${this.currentRace.track.emoji} ${this.currentRace.track.name}`;
        
        document.getElementById('race-progress').textContent = 
            `Rodada ${this.currentRace.currentRound}/${this.currentRace.maxRounds}`;
    }

    /**
     * Atualiza ranking atual
     */
    updateRanking(ranking) {
        const container = document.getElementById('current-ranking');
        container.innerHTML = '';

        ranking.forEach((character, index) => {
            const item = document.createElement('div');
            item.className = `ranking-item ${index === 0 ? 'winner' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`;
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏁';
            
            item.innerHTML = `
                <div class="ranking-character">
                    <span class="ranking-position">${medal}</span>
                    <div class="ranking-info">
                        <div class="ranking-name">${character.emoji} ${character.name}</div>
                        <div class="ranking-points">${character.pontos} pontos</div>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * Atualiza ranking final
     */
    updateFinalRanking(ranking) {
        const container = document.getElementById('final-ranking');
        container.innerHTML = '';

        ranking.forEach((character, index) => {
            const item = document.createElement('div');
            item.className = `ranking-item ${index === 0 ? 'winner' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`;
            
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏁';
            
            item.innerHTML = `
                <div class="ranking-character">
                    <span class="ranking-position">${medal}</span>
                    <div class="ranking-info">
                        <div class="ranking-name">${character.emoji} ${character.name}</div>
                        <div class="ranking-points">${character.pontos} pontos</div>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * Atualiza log da corrida
     */
    updateRaceLog(raceLog) {
        const container = document.getElementById('race-log');
        container.innerHTML = '';

        raceLog.slice(-20).forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${entry.type}`;
            logEntry.textContent = entry.message;
            container.appendChild(logEntry);
        });

        container.scrollTop = container.scrollHeight;
    }

    /**
     * Atualiza estatísticas da corrida
     */
    updateRaceStats(stats) {
        const container = document.getElementById('race-stats');
        container.innerHTML = `
            <div class="stat-card">
                <h5>Duração</h5>
                <div class="value">${stats.elapsedTime}</div>
            </div>
            <div class="stat-card">
                <h5>Rodadas</h5>
                <div class="value">${stats.currentRound}</div>
            </div>
            <div class="stat-card">
                <h5>Participantes</h5>
                <div class="value">${stats.participants}</div>
            </div>
            <div class="stat-card">
                <h5>Progresso</h5>
                <div class="value">${Math.round(stats.progress)}%</div>
            </div>
        `;
    }

    /**
     * Mostra histórico de corridas
     */
    async showHistory() {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBase}/history`);
            const data = await response.json();
            
            if (data.success) {
                this.renderHistory(data.history);
                this.showSection('history-section');
            } else {
                this.showError('Erro ao carregar histórico');
            }
        } catch (error) {
            this.showError('Erro de conexão ao carregar histórico');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Renderiza histórico de corridas
     */
    renderHistory(history) {
        const container = document.getElementById('race-history');
        
        if (history.length === 0) {
            container.innerHTML = '<p class="empty-message">Nenhuma corrida no histórico</p>';
            return;
        }

        container.innerHTML = history.map(race => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-track">${race.track.emoji} ${race.track.name}</span>
                    <span class="history-date">${new Date(race.endTime).toLocaleString()}</span>
                    <span class="history-winner">🏆 ${race.winner.emoji} ${race.winner.name}</span>
                </div>
                <div class="history-participants">
                    Participantes: ${race.characters.map(c => `${c.emoji} ${c.name}`).join(', ')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Reseta para configuração inicial
     */
    resetToSetup() {
        this.selectedCharacters = [];
        this.selectedTrack = null;
        this.currentRace = null;
        
        // Remove seleções visuais
        document.querySelectorAll('.character-card, .track-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.updateSelectedCharacters();
        this.updateCreateButton();
        this.showSection('setup-section');
    }

    /**
     * Mostra seção específica
     */
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    /**
     * Mostra/esconde loading
     */
    showLoading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    }

    /**
     * Mostra mensagem de sucesso
     */
    showSuccess(message) {
        // Implementação simples com alert - pode ser melhorada com toast
        alert('✅ ' + message);
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        // Implementação simples com alert - pode ser melhorada com toast
        alert('❌ ' + message);
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new MarioKartApp();
});
