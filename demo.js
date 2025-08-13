/**
 * Script de Demonstração - Mario Kart Racing Simulator
 * @author Leonardo Mendes
 */

const RaceController = require('./src/controllers/raceController');

async function runDemo() {
    console.log('🏁 MARIO KART RACING SIMULATOR - DEMONSTRAÇÃO\n');
    
    const controller = new RaceController();
    
    // 1. Mostrar personagens disponíveis
    console.log('👥 PERSONAGENS DISPONÍVEIS:');
    const characters = controller.getAvailableCharacters();
    characters.forEach(char => {
        console.log(`${char.emoji} ${char.name} - Vel:${char.stats.velocidade} Man:${char.stats.manobrabilidade} Pod:${char.stats.poder}`);
    });
    
    // 2. Mostrar pistas disponíveis
    console.log('\n🏁 PISTAS DISPONÍVEIS:');
    const tracks = controller.getAvailableTracks();
    tracks.forEach(track => {
        console.log(`${track.emoji} ${track.name} - ${track.difficulty} (${track.laps} voltas)`);
    });
    
    // 3. Criar e simular uma corrida
    console.log('\n🚀 CRIANDO CORRIDA...');
    const raceResult = await controller.createRace(['mario', 'luigi', 'peach'], 'mario-circuit');
    
    if (raceResult.success) {
        console.log(`✅ Corrida criada com ID: ${raceResult.raceId}`);
        
        // 4. Simular corrida completa
        console.log('\n🏃‍♂️ SIMULANDO CORRIDA COMPLETA...\n');
        const simulationResult = await controller.simulateRace(raceResult.raceId);
        
        if (simulationResult.success) {
            console.log('🏆 RESULTADO DA CORRIDA:');
            console.log(`🥇 Vencedor: ${simulationResult.winner.emoji} ${simulationResult.winner.name} (${simulationResult.winner.pontos} pontos)`);
            
            console.log('\n📊 CLASSIFICAÇÃO FINAL:');
            simulationResult.finalRanking.forEach((char, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                console.log(`${medal} ${index + 1}º - ${char.emoji} ${char.name}: ${char.pontos} pontos`);
            });
            
            console.log('\n📈 ESTATÍSTICAS:');
            console.log(`⏱️  Duração: ${simulationResult.stats.formattedTime}`);
            console.log(`🔄 Rodadas: ${simulationResult.stats.totalRounds}`);
            console.log(`👥 Participantes: ${simulationResult.stats.participants}`);
            
            // 5. Mostrar algumas entradas do log
            console.log('\n📝 LOG DA CORRIDA (últimas 5 entradas):');
            const lastLogs = simulationResult.raceLog.slice(-5);
            lastLogs.forEach(log => {
                console.log(`[R${log.round}] ${log.message}`);
            });
        }
    } else {
        console.log(`❌ Erro ao criar corrida: ${raceResult.error}`);
    }
    
    // 6. Mostrar histórico
    console.log('\n📚 HISTÓRICO DE CORRIDAS:');
    const history = controller.getRaceHistory();
    if (history.length > 0) {
        history.forEach((race, index) => {
            console.log(`${index + 1}. Vencedor: ${race.winner.emoji} ${race.winner.name} - ${race.endTime.toLocaleString()}`);
        });
    } else {
        console.log('Nenhuma corrida no histórico.');
    }
    
    console.log('\n✨ DEMONSTRAÇÃO CONCLUÍDA!');
    console.log('🌐 Acesse http://localhost:3000 para a interface web completa!');
}

// Executar demonstração
if (require.main === module) {
    runDemo().catch(console.error);
}

module.exports = { runDemo };
