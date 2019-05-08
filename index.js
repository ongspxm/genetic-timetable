const chromosome = require('./chromosome.js');
const genLessons = require('./genLessons.js');

const maxPop = 500;
const perRandom = 0.2;
const perCulling = 0;
const perMutation = 0.4;
const perCrossOver = 0.4;

const varMutationCount = 0.2;

//=== stats ===//
function sortByFitness(population) {
    return population
        .map(x => [x.fitness(), x])
        .sort().reverse().map(x => x[1]);
}

function printStats(population) {
    const l = population.length;
    console.log(
        population[0].fitness(),
        population[parseInt(l/2)].fitness(),
        population[l-1].fitness());
}

//=== genetic algo ===/
function getGenesis() {
    const population = [];
    for(let i=0; i<maxPop; i++) {
        population.push(c.clone().randomize());
    }
    return sortByFitness(population);
}

function runGeneration(gen1) {
    const size = gen1.length;

    // culling 
    const gen2 = sortByFitness(gen1).slice(0, parseInt((1-perCulling)*size));
    const size2 = gen2.length;

    function rand() {
        return parseInt(Math.random() * size2);
    }

    // crossover
    for(let i=0; i<size*perCrossOver; i++) {
        gen2.push(gen2[rand()].crossover(gen2[rand()]));
    }
    
    // mutation
    for(let i=0; i<size*perMutation; i++) {
        gen2.push(gen2[rand()].mutate());
    }

    // random new chromosome 
    const gene = gen1[0];
    for(let i=0; i<size*perRandom; i++) {
        gen2.push(gene.clone().randomize(gene.length*varMutationCount));
    }

    // killing of to pop size
    return sortByFitness(gen2).slice(0, maxPop);
}

const env = {
    numStudent: 20,
    numTeacher: 7,
    numClass: 80,
    
    numDay: 5,
    numRoom: 6,
    numSlot: 10,
}
env.lessons = genLessons(env);
const c = chromosome(env).randomize();

let population = getGenesis();
for(let i=0; i<100; i++) {
    population = runGeneration(population);
    printStats(population);
}
console.log(population[0].maxFitness);
