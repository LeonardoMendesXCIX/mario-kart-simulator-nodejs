/**
 * Testes para a classe RaceController
 * @author Leonardo Mendes
 */

const RaceController = require('../src/controllers/raceController');

module.exports = function(runner) {
    
    // Teste 1: Criação do RaceController
    runner.addTest('RaceController - Criação básica', () => {
        const controller = new RaceController();
        runner.assert(controller, 'RaceController deve ser criado');
        runner.assert(controller.raceEngine, 'Deve ter raceEngine');
        runner.assert(controller.activeRaces, 'Deve ter activeRaces Map');
        runner.assert(Array.isArray(controller.raceHistory), 'Deve ter raceHistory array');
    });

    // Teste 2: Obter personagens disponíveis
    runner.addTest('RaceController - Obter personagens', () => {
        const controller = new RaceController();
        const characters = controller.getAvailableCharacters();
        
        runner.assert(Array.isArray(characters), 'Personagens devem ser array');
        runner.assert(characters.length > 0, 'Deve ter personagens');
        
        const mario = characters.find(c => c.id === 'mario');
        runner.assert(mario, 'Deve ter Mario');
        runner.assertEqual(mario.name, 'Mario', 'Nome deve ser Mario');
    });

    // Teste 3: Obter pistas disponíveis
    runner.addTest('RaceController - Obter pistas', () => {
        const controller = new RaceController();
        const tracks = controller.getAvailableTracks();
        
        runner.assert(Array.isArray(tracks), 'Pistas devem ser array');
        runner.assert(tracks.length > 0, 'Deve ter pistas');
    });

    // Teste 4: Criar corrida com sucesso
    runner.addTest('RaceController - Criar corrida', async () => {
        const controller = new RaceController();
        const result = await controller.createRace(['mario', 'luigi'], 'mario-circuit');
        
        runner.assertEqual(result.success, true, 'Deve criar com sucesso');
        runner.assertObjectHasProperty(result, 'raceId', 'Deve ter raceId');
        runner.assert(controller.activeRaces.has(result.raceId), 'Deve estar ativa');
    });

    // Teste 5: Erro com poucos personagens
    runner.addTest('RaceController - Erro poucos personagens', async () => {
        const controller = new RaceController();
        const result = await controller.createRace(['mario'], 'mario-circuit');
        
        runner.assertEqual(result.success, false, 'Deve falhar');
        runner.assert(result.error.includes('pelo menos 2'), 'Erro correto');
    });

    // Teste 6: Obter status de corrida
    runner.addTest('RaceController - Status corrida', async () => {
        const controller = new RaceController();
        const createResult = await controller.createRace(['mario', 'luigi'], 'mario-circuit');
        const statusResult = controller.getRaceStatus(createResult.raceId);
        
        runner.assertEqual(statusResult.success, true, 'Deve obter status');
        runner.assertObjectHasProperty(statusResult, 'race', 'Deve ter dados da corrida');
    });

    // Teste 7: Histórico de corridas
    runner.addTest('RaceController - Histórico', () => {
        const controller = new RaceController();
        const history = controller.getRaceHistory();
        
        runner.assert(Array.isArray(history), 'Histórico deve ser array');
    });
};
