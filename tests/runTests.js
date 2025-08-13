/**
 * Test Runner - Executa todos os testes unitários
 * @author Leonardo Mendes
 */

const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Adiciona um teste
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Executa todos os testes
     */
    async runAll() {
        console.log('\n🧪 ===============================================');
        console.log('🏁 MARIO KART RACING SIMULATOR - TESTES');
        console.log('🧪 ===============================================\n');

        for (const test of this.tests) {
            await this.runTest(test);
        }

        this.showResults();
    }

    /**
     * Executa um teste individual
     */
    async runTest(test) {
        try {
            console.log(`🔍 Testando: ${test.name}`);
            await test.testFunction();
            console.log(`✅ PASSOU: ${test.name}\n`);
            this.results.passed++;
        } catch (error) {
            console.log(`❌ FALHOU: ${test.name}`);
            console.log(`   Erro: ${error.message}\n`);
            this.results.failed++;
        }
        this.results.total++;
    }

    /**
     * Mostra resultados finais
     */
    showResults() {
        console.log('📊 ===============================================');
        console.log('📈 RESULTADOS DOS TESTES');
        console.log('📊 ===============================================');
        console.log(`✅ Testes Aprovados: ${this.results.passed}`);
        console.log(`❌ Testes Falharam: ${this.results.failed}`);
        console.log(`📊 Total de Testes: ${this.results.total}`);
        console.log(`🎯 Taxa de Sucesso: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        console.log('📊 ===============================================\n');

        if (this.results.failed === 0) {
            console.log('🎉 TODOS OS TESTES PASSARAM! 🎉\n');
        } else {
            console.log('⚠️  ALGUNS TESTES FALHARAM ⚠️\n');
        }
    }

    /**
     * Função de assert simples
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    /**
     * Assert de igualdade
     */
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    /**
     * Assert de objeto
     */
    assertObjectHasProperty(obj, property, message) {
        if (!obj.hasOwnProperty(property)) {
            throw new Error(message || `Object does not have property: ${property}`);
        }
    }
}

// Carrega e executa testes
async function loadAndRunTests() {
    const runner = new TestRunner();

    // Importa testes individuais
    const testFiles = [
        './characterTest.js',
        './raceTest.js',
        './raceEngineTest.js',
        './raceControllerTest.js'
    ];

    for (const testFile of testFiles) {
        try {
            const testModule = require(testFile);
            if (typeof testModule === 'function') {
                testModule(runner);
            }
        } catch (error) {
            console.log(`⚠️  Não foi possível carregar ${testFile}: ${error.message}`);
        }
    }

    await runner.runAll();
}

// Executa se chamado diretamente
if (require.main === module) {
    loadAndRunTests();
}

module.exports = TestRunner;
