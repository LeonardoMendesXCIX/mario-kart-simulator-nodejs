/**
 * Testes para a classe Race
 * @author Leonardo Mendes
 */

const Race = require('../src/models/Race');
const Character = require('../src/models/Character');

module.exports = function(runner) {
    // Dados de teste
    const testTrack = {
        id: 'mario-circuit',
        name: 'Circuito do Mario',
        emoji: '🏁',
        difficulty: 'Fácil',
        laps: 3,
        blocks: [
            { type: 'RETA', probability: 0.4 },
            { type: 'CURVA', probability: 0.4 },
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

    // Teste 1: Criação de corrida
    runner.addTest('Race - Criação básica', () => {
        const race = createTestRace();
        
        runner.assert(race.id, 'Race deve ter um ID');
        runner.assertEqual(race.track.name, 'Circuito do Mario', 'Nome da pista deve estar correto');
        runner.assertEqual(race.characters.length, 2, 'Deve ter 2 personagens');
        runner.assertEqual(race.status, 'waiting', 'Status inicial deve ser waiting');
        runner.assertEqual(race.currentRound, 0, 'Rodada atual deve ser 0');
        runner.assertEqual(race.maxRounds, 15, 'Máximo de rodadas deve ser 15 (3 laps * 5 blocos)');
    });

    // Teste 2: Geração de ID único
    runner.addTest('Race - Geração de ID único', () => {
        const race1 = createTestRace();
        const race2 = createTestRace();
        
        runner.assert(race1.id !== race2.id, 'IDs devem ser únicos');
        runner.assert(race1.id.startsWith('race_'), 'ID deve começar com race_');
    });

    // Teste 3: Inicialização de personagens
    runner.addTest('Race - Inicialização de personagens', () => {
        const race = createTestRace();
        
        race.characters.forEach((character, index) => {
            runner.assertEqual(character.pontos, 0, 'Pontos devem ser 0');
            runner.assertEqual(character.position, index + 1, `Posição deve ser ${index + 1}`);
            runner.assertEqual(character.currentLap, 0, 'Volta atual deve ser 0');
        });
    });

    // Teste 4: Início da corrida
    runner.addTest('Race - Início da corrida', () => {
        const race = createTestRace();
        
        race.start();
        
        runner.assertEqual(race.status, 'running', 'Status deve ser running');
        runner.assert(race.startTime, 'Deve ter tempo de início');
        runner.assert(race.raceLog.length > 0, 'Deve ter entradas no log');
    });

    // Teste 5: Erro ao iniciar corrida já iniciada
    runner.addTest('Race - Erro ao iniciar corrida já iniciada', () => {
        const race = createTestRace();
        race.start();
        
        try {
            race.start();
            runner.assert(false, 'Deveria ter lançado erro');
        } catch (error) {
            runner.assert(error.message.includes('já foi iniciada'), 'Erro deve mencionar que já foi iniciada');
        }
    });

    // Teste 6: Verificação de corrida finalizada
    runner.addTest('Race - Verificação de corrida finalizada', () => {
        const race = createTestRace();
        
        runner.assertEqual(race.isFinished(), false, 'Corrida não deve estar finalizada inicialmente');
        
        // Simula corrida finalizada por rodadas
        race.currentRound = race.maxRounds;
        runner.assertEqual(race.isFinished(), true, 'Corrida deve estar finalizada por rodadas');
        
        // Reset para testar finalização por voltas
        race.currentRound = 0;
        race.characters[0].currentLap = race.track.laps;
        runner.assertEqual(race.isFinished(), true, 'Corrida deve estar finalizada por voltas');
    });

    // Teste 7: Finalização da corrida
    runner.addTest('Race - Finalização da corrida', () => {
        const race = createTestRace();
        
        // Adiciona pontos diferentes para testar ordenação
        race.characters[0].addPoints(20);
        race.characters[1].addPoints(15);
        
        race.finish();
        
        runner.assertEqual(race.status, 'finished', 'Status deve ser finished');
        runner.assert(race.endTime, 'Deve ter tempo de fim');
        runner.assertEqual(race.winner.name, 'Mario', 'Mario deve ser o vencedor');
        runner.assertEqual(race.characters[0].position, 1, 'Mario deve estar em 1º');
        runner.assertEqual(race.characters[1].position, 2, 'Luigi deve estar em 2º');
    });

    // Teste 8: Adição ao log
    runner.addTest('Race - Adição ao log', () => {
        const race = createTestRace();
        
        race.addToLog('Teste de mensagem', 'system');
        
        runner.assertEqual(race.raceLog.length, 1, 'Deve ter 1 entrada no log');
        runner.assertEqual(race.raceLog[0].message, 'Teste de mensagem', 'Mensagem deve estar correta');
        runner.assertEqual(race.raceLog[0].type, 'system', 'Tipo deve ser system');
        runner.assertEqual(race.raceLog[0].round, 0, 'Rodada deve ser 0');
    });

    // Teste 9: Próxima rodada
    runner.addTest('Race - Próxima rodada', () => {
        const race = createTestRace();
        
        // Adiciona power-ups para testar atualização
        race.characters[0].powerUps.push({
            effect: 'velocidade',
            boost: 2,
            remainingDuration: 1
        });
        
        const initialRound = race.currentRound;
        race.nextRound();
        
        runner.assertEqual(race.currentRound, initialRound + 1, 'Rodada deve ter incrementado');
        runner.assertEqual(race.characters[0].powerUps.length, 0, 'Power-up deve ter expirado');
    });

    // Teste 10: Cálculo de progresso
    runner.addTest('Race - Cálculo de progresso', () => {
        const race = createTestRace();
        
        runner.assertEqual(race.getProgress(), 0, 'Progresso inicial deve ser 0');
        
        race.currentRound = race.maxRounds / 2;
        runner.assertEqual(race.getProgress(), 50, 'Progresso na metade deve ser 50');
        
        race.currentRound = race.maxRounds;
        runner.assertEqual(race.getProgress(), 100, 'Progresso no final deve ser 100');
    });

    // Teste 11: Tempo decorrido
    runner.addTest('Race - Tempo decorrido', () => {
        const race = createTestRace();
        
        runner.assertEqual(race.getElapsedTime(), 0, 'Tempo sem início deve ser 0');
        
        race.startTime = new Date(Date.now() - 5000); // 5 segundos atrás
        const elapsed = race.getElapsedTime();
        
        runner.assert(elapsed >= 4000 && elapsed <= 6000, 'Tempo decorrido deve estar próximo de 5000ms');
    });

    // Teste 12: Tempo formatado
    runner.addTest('Race - Tempo formatado', () => {
        const race = createTestRace();
        
        race.startTime = new Date(Date.now() - 65000); // 1 minuto e 5 segundos atrás
        const formatted = race.getFormattedTime();
        
        runner.assertEqual(formatted, '01:05', 'Tempo deve estar formatado como 01:05');
    });

    // Teste 13: Ranking atual
    runner.addTest('Race - Ranking atual', () => {
        const race = createTestRace();
        
        race.characters[0].addPoints(10);
        race.characters[1].addPoints(20);
        
        const ranking = race.getCurrentRanking();
        
        runner.assertEqual(ranking[0].name, 'Luigi', 'Luigi deve estar em 1º no ranking');
        runner.assertEqual(ranking[1].name, 'Mario', 'Mario deve estar em 2º no ranking');
    });

    // Teste 14: Estatísticas da corrida
    runner.addTest('Race - Estatísticas da corrida', () => {
        const race = createTestRace();
        race.start();
        race.currentRound = 5;
        
        const stats = race.getStats();
        
        runner.assertObjectHasProperty(stats, 'id', 'Stats devem ter ID');
        runner.assertObjectHasProperty(stats, 'track', 'Stats devem ter track');
        runner.assertObjectHasProperty(stats, 'status', 'Stats devem ter status');
        runner.assertObjectHasProperty(stats, 'currentRound', 'Stats devem ter currentRound');
        runner.assertObjectHasProperty(stats, 'participants', 'Stats devem ter participants');
        runner.assertEqual(stats.participants, 2, 'Deve ter 2 participantes');
        runner.assertEqual(stats.currentRound, 5, 'Rodada atual deve ser 5');
    });

    // Teste 15: Serialização JSON
    runner.addTest('Race - Serialização JSON', () => {
        const race = createTestRace();
        race.start();
        
        const json = race.toJSON();
        
        runner.assertObjectHasProperty(json, 'id', 'JSON deve ter ID');
        runner.assertObjectHasProperty(json, 'track', 'JSON deve ter track');
        runner.assertObjectHasProperty(json, 'characters', 'JSON deve ter characters');
        runner.assertObjectHasProperty(json, 'status', 'JSON deve ter status');
        runner.assertObjectHasProperty(json, 'raceLog', 'JSON deve ter raceLog');
        runner.assertEqual(json.characters.length, 2, 'JSON deve ter 2 personagens');
    });
};
