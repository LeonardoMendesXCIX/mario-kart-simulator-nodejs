/**
 * Script de Validação - Testa todos os componentes individualmente
 * @author Leonardo Mendes
 */

const Character = require('./src/models/Character');
const Race = require('./src/models/Race');
const RaceEngine = require('./src/services/raceEngine');
const RaceController = require('./src/controllers/raceController');

console.log('🧪 VALIDAÇÃO DE COMPONENTES - MARIO KART RACING SIMULATOR\n');

// 1. Teste da classe Character
console.log('1️⃣ TESTANDO CLASSE CHARACTER...');
try {
    const mario = new Character({
        id: 'mario',
        name: 'Mario',
        emoji: '🍄',
        stats: { velocidade: 4, manobrabilidade: 3, poder: 3 },
        description: 'O encanador mais famoso!',
        specialty: 'Versatilidade',
        color: '#FF0000'
    });
    
    console.log(`✅ Character criado: ${mario.toString()}`);
    console.log(`✅ Habilidade total: ${mario.getTotalSkill()}`);
    
    mario.addPoints(10);
    console.log(`✅ Pontos adicionados: ${mario.pontos}`);
    
} catch (error) {
    console.log(`❌ Erro no Character: ${error.message}`);
}

// 2. Teste da classe Race
console.log('\n2️⃣ TESTANDO CLASSE RACE...');
try {
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
    
    const characters = [
        new Character({
            id: 'mario', name: 'Mario', emoji: '🍄',
            stats: { velocidade: 4, manobrabilidade: 3, poder: 3 },
            description: 'Test', specialty: 'Test', color: '#FF0000'
        }),
        new Character({
            id: 'luigi', name: 'Luigi', emoji: '👻',
            stats: { velocidade: 3, manobrabilidade: 4, poder: 4 },
            description: 'Test', specialty: 'Test', color: '#00AA00'
        })
    ];
    
    const race = new Race(testTrack, characters);
    console.log(`✅ Race criada: ID ${race.id}`);
    console.log(`✅ Personagens: ${race.characters.length}`);
    console.log(`✅ Status: ${race.status}`);
    
    race.start();
    console.log(`✅ Race iniciada: ${race.status}`);
    
} catch (error) {
    console.log(`❌ Erro na Race: ${error.message}`);
}

// 3. Teste do RaceEngine
console.log('\n3️⃣ TESTANDO RACE ENGINE...');
try {
    const engine = new RaceEngine();
    console.log(`✅ RaceEngine criado`);
    
    const dice = engine.rollDice();
    console.log(`✅ Dado rolado: ${dice} (1-6)`);
    
    const powerUp = engine.getRandomPowerUp();
    console.log(`✅ Power-up gerado: ${powerUp ? powerUp.name : 'Nenhum'}`);
    
} catch (error) {
    console.log(`❌ Erro no RaceEngine: ${error.message}`);
}

// 4. Teste do RaceController
console.log('\n4️⃣ TESTANDO RACE CONTROLLER...');
try {
    const controller = new RaceController();
    console.log(`✅ RaceController criado`);
    
    const characters = controller.getAvailableCharacters();
    console.log(`✅ Personagens carregados: ${characters.length}`);
    
    const tracks = controller.getAvailableTracks();
    console.log(`✅ Pistas carregadas: ${tracks.length}`);
    
    // Teste de criação de corrida
    controller.createRace(['mario', 'luigi'], 'mario-circuit')
        .then(result => {
            if (result.success) {
                console.log(`✅ Corrida criada com sucesso: ${result.raceId}`);
            } else {
                console.log(`❌ Erro ao criar corrida: ${result.error}`);
            }
        })
        .catch(error => {
            console.log(`❌ Erro no teste de corrida: ${error.message}`);
        });
    
} catch (error) {
