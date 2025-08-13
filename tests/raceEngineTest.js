/**
 * Testes para a classe RaceEngine
 * @author Leonardo Mendes
 */

const RaceEngine = require('../src/services/raceEngine');
const Character = require('../src/models/Character');
const Race = require('../src/models/Race');

module.exports = function(runner) {
    // Dados de teste
    const testTrack = {
        id: 'test-circuit',
        name: 'Circuito de Teste',
        emoji: '🧪',
        difficulty: 'Teste',
        laps: 2,
        blocks: [
            { type: 'RETA', probability: 0.5 },
            { type: 'CURVA', probability: 0.3 },
            { type: 'CONFRONTO', probability: 0.2 }
        ]
    };

    const testCharacterData1 = {
        id: 'mario',
        name: 'Mario',
        emoji: '🍄',
        stats: { velocidade: 4, manobrabilidade: 3, poder: 3 },
        description: 'Test character 1',
        specialty: 'Test',
        color: '#FF0000'
    };

    const testCharacterData2 = {
        id: 'luigi',
        name: 'Luigi',
        emoji: '👻',
        stats: { velocidade: 3, manobrabilidade: 4, poder: 4 },
        description: 'Test character 2',
        specialty: 'Test',
        color: '#00AA00'
    };

    function createTestRace() {
        const characters = [
            new Character(testCharacterData1),
            new Character(testCharacterData2)
        ];
        return new Race(testTrack, characters);
    }

    // Teste 1: Criação do RaceEngine
    runner.addTest('RaceEngine - Criação básica', () => {
        const engine = new RaceEngine();
        
        runner.assert(engine, 'RaceEngine deve ser criado');
        runner.assert(engine.powerUps, 'RaceEngine deve ter power-ups carregados');
        runner.assert(Array.isArray(engine.powerUps), 'Power-ups devem ser um array');
    });

    // Teste 2: Função rollDice
    runner.addTest('RaceEngine - Função rollDice', () => {
        const engine = new RaceEngine();
        
        // Testa valores padrão (1-6)
        for (let i = 0; i < 100; i++) {
            const result = engine.rollDice();
            runner.assert(result >= 1 && result <= 6, `Dado deve estar entre 1-6, obtido: ${result}`);
        }
        
        // Testa valores customizados
        for (let i = 0; i < 50; i++) {
            const result = engine.rollDice(10, 20);
            runner.assert(result >= 10 && result <= 20, `Dado customizado deve estar entre 10-20, obtido: ${result}`);
        }
    });

    // Teste 3: Geração de bloco aleatório
    runner.addTest('RaceEngine - Geração de bloco aleatório', () => {
        const engine = new RaceEngine();
        const validBlocks = ['RETA', 'CURVA', 'CONFRONTO'];
        
        // Testa múltiplas gerações
        for (let i = 0; i < 50; i++) {
            const block = engine.getRandomBlock(testTrack);
            runner.assert(validBlocks.includes(block), `Bloco deve ser válido: ${block}`);
        }
    });

    // Teste 4: Geração de power-up aleatório
    runner.addTest('RaceEngine - Geração de power-up aleatório', () => {
        const engine = new RaceEngine();
        
        let powerUpCount = 0;
        let nullCount = 0;
        
        // Testa múltiplas gerações
        for (let i = 0; i < 100; i++) {
            const powerUp = engine.getRandomPowerUp();
            if (powerUp) {
                powerUpCount++;
                runner.assertObjectHasProperty(powerUp, 'id', 'Power-up deve ter ID');
                runner.assertObjectHasProperty(powerUp, 'name', 'Power-up deve ter nome');
                runner.assertObjectHasProperty(powerUp, 'effect', 'Power-up deve ter efeito');
            } else {
                nullCount++;
            }
        }
        
        runner.assert(powerUpCount > 0, 'Deve gerar alguns power-ups');
        runner.assert(nullCount > 0, 'Deve ter alguns resultados nulos');
    });

    // Teste 5: Processamento de bloco RETA
    runner.addTest('RaceEngine - Processamento de bloco RETA', () => {
        const engine = new RaceEngine();
        const character = new Character(testCharacterData1);
        
        const points = engine.processReta(character, 5);
        const expectedPoints = 5 + character.stats.velocidade; // 5 + 4 = 9
        
        runner.assertEqual(points, expectedPoints, `Pontos RETA devem ser ${expectedPoints}`);
    });

    // Teste 6: Processamento de bloco CURVA
    runner.addTest('RaceEngine - Processamento de bloco CURVA', () => {
        const engine = new RaceEngine();
        const character = new Character(testCharacterData1);
        
        const points = engine.processCurva(character, 3);
        const expectedPoints = 3 + character.stats.manobrabilidade; // 3 + 3 = 6
        
        runner.assertEqual(points, expectedPoints, `Pontos CURVA devem ser ${expectedPoints}`);
    });

    // Teste 7: Processamento de bloco CONFRONTO
    runner.addTest('RaceEngine - Processamento de bloco CONFRONTO', () => {
        const engine = new RaceEngine();
        const character1 = new Character(testCharacterData1);
        const character2 = new Character(testCharacterData2);
        
        // Teste com vitória garantida
        const result = engine.processConfronto(character1, character2, 6, 1);
        
        runner.assertObjectHasProperty(result, 'points', 'Resultado deve ter pontos');
        runner.assertObjectHasProperty(result, 'message', 'Resultado deve ter mensagem');
        runner.assert(typeof result.points === 'number', 'Pontos devem ser número');
        runner.assert(typeof result.message === 'string', 'Mensagem deve ser string');
    });

    // Teste 8: Seleção de oponente aleatório
    runner.addTest('RaceEngine - Seleção de oponente aleatório', () => {
        const engine = new RaceEngine();
        const character1 = new Character(testCharacterData1);
        const character2 = new Character(testCharacterData2);
        const allCharacters = [character1, character2];
        
        const opponent = engine.getRandomOpponent(character1, allCharacters);
        
        runner.assertEqual(opponent.id, 'luigi', 'Oponente deve ser Luigi');
        runner.assert(opponent.id !== character1.id, 'Oponente não deve ser o próprio personagem');
    });

    // Teste 9: Processamento de turno de personagem
    runner.addTest('RaceEngine - Processamento de turno', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        const character = race.characters[0];
        
        const result = await engine.processCharacterTurn(character, 'RETA', race);
        
        runner.assertObjectHasProperty(result, 'character', 'Resultado deve ter personagem');
        runner.assertObjectHasProperty(result, 'blockType', 'Resultado deve ter tipo de bloco');
        runner.assertObjectHasProperty(result, 'points', 'Resultado deve ter pontos');
        runner.assertObjectHasProperty(result, 'totalPoints', 'Resultado deve ter pontos totais');
        runner.assertObjectHasProperty(result, 'message', 'Resultado deve ter mensagem');
        
        runner.assertEqual(result.character, 'Mario', 'Personagem deve ser Mario');
        runner.assertEqual(result.blockType, 'RETA', 'Tipo de bloco deve ser RETA');
        runner.assert(result.points >= 0, 'Pontos devem ser não-negativos');
    });

    // Teste 10: Execução de rodada completa
    runner.addTest('RaceEngine - Execução de rodada completa', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        race.start();
        
        const result = await engine.executeRound(race);
        
        runner.assertObjectHasProperty(result, 'finished', 'Resultado deve ter status finished');
        runner.assertObjectHasProperty(result, 'block', 'Resultado deve ter tipo de bloco');
        runner.assertObjectHasProperty(result, 'results', 'Resultado deve ter resultados');
        runner.assertObjectHasProperty(result, 'ranking', 'Resultado deve ter ranking');
        
        runner.assert(Array.isArray(result.results), 'Resultados devem ser array');
        runner.assertEqual(result.results.length, 2, 'Deve ter resultado para 2 personagens');
        runner.assert(Array.isArray(result.ranking), 'Ranking deve ser array');
    });

    // Teste 11: Execução em corrida finalizada
    runner.addTest('RaceEngine - Execução em corrida finalizada', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        race.start();
        race.currentRound = race.maxRounds; // Força finalização
        
        const result = await engine.executeRound(race);
        
        runner.assertEqual(result.finished, true, 'Corrida deve estar finalizada');
        runner.assertEqual(race.status, 'finished', 'Status da corrida deve ser finished');
    });

    // Teste 12: Distribuição de power-ups
    runner.addTest('RaceEngine - Distribuição de power-ups', () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        
        // Força geração de power-up (mock)
        const originalGetRandomPowerUp = engine.getRandomPowerUp;
        engine.getRandomPowerUp = () => ({
            id: 'test',
            name: 'Test Power-up',
            effect: 'velocidade',
            boost: 1,
            duration: 1
        });
        
        engine.distributeRandomPowerUps(race.characters, race);
        
        // Verifica se pelo menos um personagem recebeu power-up
        const totalPowerUps = race.characters.reduce((sum, char) => sum + char.powerUps.length, 0);
        runner.assert(totalPowerUps > 0, 'Pelo menos um personagem deve ter recebido power-up');
        
        // Restaura função original
        engine.getRandomPowerUp = originalGetRandomPowerUp;
    });

    // Teste 13: Simulação de corrida completa
    runner.addTest('RaceEngine - Simulação de corrida completa', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        
        const result = await engine.simulateRace(race);
        
        runner.assertObjectHasProperty(result, 'raceId', 'Resultado deve ter ID da corrida');
        runner.assertObjectHasProperty(result, 'winner', 'Resultado deve ter vencedor');
        runner.assertObjectHasProperty(result, 'finalRanking', 'Resultado deve ter ranking final');
        runner.assertObjectHasProperty(result, 'raceLog', 'Resultado deve ter log da corrida');
        runner.assertObjectHasProperty(result, 'stats', 'Resultado deve ter estatísticas');
        
        runner.assertEqual(race.status, 'finished', 'Corrida deve estar finalizada');
        runner.assert(result.winner, 'Deve ter um vencedor');
        runner.assert(Array.isArray(result.finalRanking), 'Ranking final deve ser array');
        runner.assertEqual(result.finalRanking.length, 2, 'Ranking deve ter 2 personagens');
    });

    // Teste 14: Atualização de estatísticas durante processamento
    runner.addTest('RaceEngine - Atualização de estatísticas', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        const character = race.characters[0];
        
        const initialStats = { ...character.raceStats };
        
        await engine.processCharacterTurn(character, 'RETA', race);
        
        runner.assert(character.raceStats.blocksCompleted > initialStats.blocksCompleted, 
            'Blocos completados devem ter incrementado');
        runner.assert(character.raceStats.totalDistance >= initialStats.totalDistance, 
            'Distância total deve ter incrementado');
    });

    // Teste 15: Validação de pontos não-negativos
    runner.addTest('RaceEngine - Pontos não-negativos', async () => {
        const engine = new RaceEngine();
        const race = createTestRace();
        const character = race.characters[0];
        
        // Testa múltiplos turnos para garantir que pontos nunca sejam negativos
        for (let i = 0; i < 10; i++) {
            const result = await engine.processCharacterTurn(character, 'CONFRONTO', race);
            runner.assert(result.points >= 0, `Pontos devem ser não-negativos: ${result.points}`);
            runner.assert(character.pontos >= 0, `Pontos totais devem ser não-negativos: ${character.pontos}`);
        }
    });
};
