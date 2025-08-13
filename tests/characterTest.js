/**
 * Testes para a classe Character
 * @author Leonardo Mendes
 */

const Character = require('../src/models/Character');

module.exports = function(runner) {
    // Dados de teste
    const testCharacterData = {
        id: 'mario',
        name: 'Mario',
        emoji: '🍄',
        stats: {
            velocidade: 4,
            manobrabilidade: 3,
            poder: 3
        },
        description: 'O encanador mais famoso do mundo!',
        specialty: 'Versatilidade',
        color: '#FF0000'
    };

    // Teste 1: Criação de personagem
    runner.addTest('Character - Criação básica', () => {
        const character = new Character(testCharacterData);
        
        runner.assertEqual(character.id, 'mario', 'ID deve ser mario');
        runner.assertEqual(character.name, 'Mario', 'Nome deve ser Mario');
        runner.assertEqual(character.emoji, '🍄', 'Emoji deve ser 🍄');
        runner.assertEqual(character.stats.velocidade, 4, 'Velocidade deve ser 4');
        runner.assertEqual(character.pontos, 0, 'Pontos iniciais devem ser 0');
        runner.assertEqual(character.position, 0, 'Posição inicial deve ser 0');
    });

    // Teste 2: Cálculo de habilidade total
    runner.addTest('Character - Cálculo de habilidade total', () => {
        const character = new Character(testCharacterData);
        const totalSkill = character.getTotalSkill();
        
        runner.assertEqual(totalSkill, 10, 'Habilidade total deve ser 10 (4+3+3)');
    });

    // Teste 3: Aplicação de power-up
    runner.addTest('Character - Aplicação de power-up', () => {
        const character = new Character(testCharacterData);
        const powerUp = {
            id: 'mushroom',
            name: 'Super Cogumelo',
            effect: 'velocidade',
            boost: 2,
            duration: 1
        };
        
        character.applyPowerUp(powerUp);
        
        runner.assertEqual(character.powerUps.length, 1, 'Deve ter 1 power-up');
        runner.assertEqual(character.raceStats.powerUpsUsed, 1, 'Estatística de power-ups deve ser 1');
    });

    // Teste 4: Velocidade efetiva com power-up
    runner.addTest('Character - Velocidade efetiva com power-up', () => {
        const character = new Character(testCharacterData);
        const initialSpeed = character.getEffectiveSpeed();
        
        runner.assertEqual(initialSpeed, 4, 'Velocidade inicial deve ser 4');
        
        const powerUp = {
            effect: 'velocidade',
            boost: 2,
            remainingDuration: 1
        };
        
        character.powerUps.push(powerUp);
        const boostedSpeed = character.getEffectiveSpeed();
        
        runner.assertEqual(boostedSpeed, 6, 'Velocidade com boost deve ser 6');
    });

    // Teste 5: Atualização de power-ups
    runner.addTest('Character - Atualização de power-ups', () => {
        const character = new Character(testCharacterData);
        
        // Adiciona power-up com duração 1
        character.powerUps.push({
            effect: 'velocidade',
            boost: 2,
            remainingDuration: 1
        });
        
        runner.assertEqual(character.powerUps.length, 1, 'Deve ter 1 power-up');
        
        // Atualiza power-ups (reduz duração)
        character.updatePowerUps();
        
        runner.assertEqual(character.powerUps.length, 0, 'Power-up deve ter expirado');
    });

    // Teste 6: Invencibilidade
    runner.addTest('Character - Verificação de invencibilidade', () => {
        const character = new Character(testCharacterData);
        
        runner.assertEqual(character.isInvincible(), false, 'Não deve ser invencível inicialmente');
        
        character.powerUps.push({
            effect: 'invencibilidade',
            boost: 3,
            remainingDuration: 2
        });
        
        runner.assertEqual(character.isInvincible(), true, 'Deve ser invencível com power-up');
    });

    // Teste 7: Adição de pontos
    runner.addTest('Character - Adição de pontos', () => {
        const character = new Character(testCharacterData);
        
        character.addPoints(10);
        runner.assertEqual(character.pontos, 10, 'Deve ter 10 pontos');
        
        character.addPoints(5);
        runner.assertEqual(character.pontos, 15, 'Deve ter 15 pontos');
    });

    // Teste 8: Reset para nova corrida
    runner.addTest('Character - Reset para nova corrida', () => {
        const character = new Character(testCharacterData);
        
        // Modifica estado
        character.addPoints(20);
        character.position = 2;
        character.currentLap = 1;
        character.powerUps.push({ effect: 'test', remainingDuration: 1 });
        character.raceStats.blocksCompleted = 5;
        
        // Reset
        character.resetForRace();
        
        runner.assertEqual(character.pontos, 0, 'Pontos devem ser resetados');
        runner.assertEqual(character.position, 0, 'Posição deve ser resetada');
        runner.assertEqual(character.currentLap, 0, 'Volta atual deve ser resetada');
        runner.assertEqual(character.powerUps.length, 0, 'Power-ups devem ser limpos');
        runner.assertEqual(character.raceStats.blocksCompleted, 0, 'Estatísticas devem ser resetadas');
    });

    // Teste 9: Serialização JSON
    runner.addTest('Character - Serialização JSON', () => {
        const character = new Character(testCharacterData);
        character.addPoints(15);
        character.position = 1;
        
        const json = character.toJSON();
        
        runner.assertObjectHasProperty(json, 'id', 'JSON deve ter propriedade id');
        runner.assertObjectHasProperty(json, 'name', 'JSON deve ter propriedade name');
        runner.assertObjectHasProperty(json, 'pontos', 'JSON deve ter propriedade pontos');
        runner.assertEqual(json.pontos, 15, 'Pontos no JSON devem ser 15');
        runner.assertEqual(json.position, 1, 'Posição no JSON deve ser 1');
    });

    // Teste 10: Representação em string
    runner.addTest('Character - Representação em string', () => {
        const character = new Character(testCharacterData);
        character.addPoints(25);
        
        const stringRepresentation = character.toString();
        const expected = '🍄 Mario (25 pts)';
        
        runner.assertEqual(stringRepresentation, expected, 'String deve estar no formato correto');
    });
};
