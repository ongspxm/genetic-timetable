const chromosome = require('./chromosome.js');
const genetic = require('./genetic.js');
const genLessons = require('./genLessons.js');
const getReport = require('./report.js');

function getStats(population) {
    const l = population.length;

    return [
        population[0].fitness(),
        population[parseInt(l/2)].fitness(),
        population[l-1].fitness()].join(' ');
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

//=== genetic algorithm ===//
const population = genetic(chromosome(env).randomize()).genesis(); 
const stats = [];
for(let i=0; i<150; i++) {
    population.next();

    if (i%10===0) {
        stats.push(`<li>${getStats(population.getData())}</li>`);
    }
}

const best = population.getData()[0];
console.log(getReport(best, stats, env));
