/**
 * Mario Kart Racing Simulator - Servidor Principal
 * @author Leonardo Mendes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const RaceController = require('./controllers/raceController');

class MarioKartServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.raceController = new RaceController();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Configura middlewares
     */
    setupMiddleware() {
        // Segurança
        this.app.use(helmet({
            contentSecurityPolicy: false // Permite inline scripts para desenvolvimento
        }));
        
        // CORS
        this.app.use(cors());
        
        // Compressão
        this.app.use(compression());
        
        // Logging
        this.app.use(morgan('combined'));
        
        // Parse JSON
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        // Arquivos estáticos
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    /**
     * Configura rotas da API
     */
    setupRoutes() {
        // Rota principal
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });

        // API Routes
        const apiRouter = express.Router();

        // Informações do sistema
        apiRouter.get('/info', (req, res) => {
            res.json({
                name: 'Mario Kart Racing Simulator',
                version: '1.0.0',
                author: 'Leonardo Mendes',
                description: 'Simulador de corrida Mario Kart com interface web',
                endpoints: {
                    characters: '/api/characters',
                    tracks: '/api/tracks',
                    races: '/api/races'
                }
            });
        });

        // Personagens
        apiRouter.get('/characters', (req, res) => {
            try {
                const characters = this.raceController.getAvailableCharacters();
                res.json({ success: true, characters });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Pistas
        apiRouter.get('/tracks', (req, res) => {
            try {
                const tracks = this.raceController.getAvailableTracks();
                res.json({ success: true, tracks });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Criar corrida
        apiRouter.post('/races', async (req, res) => {
            try {
                const { characterIds, trackId } = req.body;
                const result = await this.raceController.createRace(characterIds, trackId);
                
                if (result.success) {
                    res.status(201).json(result);
                } else {
                    res.status(400).json(result);
                }
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Status da corrida
        apiRouter.get('/races/:raceId', (req, res) => {
            try {
                const result = this.raceController.getRaceStatus(req.params.raceId);
                
                if (result.success) {
                    res.json(result);
                } else {
                    res.status(404).json(result);
                }
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Executar rodada
        apiRouter.post('/races/:raceId/round', async (req, res) => {
            try {
                const result = await this.raceController.executeRound(req.params.raceId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Simular corrida completa
        apiRouter.post('/races/:raceId/simulate', async (req, res) => {
            try {
                const result = await this.raceController.simulateRace(req.params.raceId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Histórico de corridas
        apiRouter.get('/history', (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 20;
                const history = this.raceController.getRaceHistory(limit);
                res.json({ success: true, history });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.use('/api', apiRouter);
    }

    /**
     * Configura tratamento de erros
     */
    setupErrorHandling() {
        // 404 Handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Endpoint não encontrado',
                path: req.path
            });
        });

        // Error Handler
        this.app.use((error, req, res, next) => {
            console.error('Erro no servidor:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
    }

    /**
     * Inicia o servidor
     */
    start() {
        this.app.listen(this.port, () => {
            console.log('\n🏁 ===============================================');
            console.log('🍄 MARIO KART RACING SIMULATOR');
            console.log('🏁 ===============================================');
            console.log(`🚀 Servidor rodando em: http://localhost:${this.port}`);
            console.log(`📱 Interface Web: http://localhost:${this.port}`);
            console.log(`🔧 API Endpoint: http://localhost:${this.port}/api`);
            console.log('👨‍💻 Desenvolvido por: Leonardo Mendes');
            console.log('🏁 ===============================================\n');
        });
    }
}

// Inicia o servidor se executado diretamente
if (require.main === module) {
    const server = new MarioKartServer();
    server.start();
}

module.exports = MarioKartServer;
