const chromosome = require('./chromosome.js');
const genLessons = require('./genLessons.js');
const getHTMLTable = require('./getHTMLTable.js');

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

function getStats(population) {
    const l = population.length;

    return [
        population[0].fitness(),
        population[parseInt(l/2)].fitness(),
        population[l-1].fitness()].join(' ');
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
const stats = [];
for(let i=0; i<11; i++) {
    population = runGeneration(population);

    if (i%10===0) {
        stats.push(`<li>${getStats(population)}</li>`);
    }
}

const html = [];
html.push(`<h2>Population Max Fitness: ${population[0].maxFitness}</h2>`);
html.push(`<ul>${stats.join('')}</ul>`);

const best = population[0];
const { rooms, students, teachers } = best.getTimetable();

html.push(`<h2>Room Timetable</h2>`);
for(let r=0; r<env.numRoom; r++) {
    function formatLesson(slot) {
        if (!slot) {
            return '';
        }

        const lessons = [];
        for(let i=0; i<slot.length; i++) {
            lessons.push(`<strong>${slot[i].lessonId}</strong>`);
        }

        return lessons.join(`<hr/>`);
    }

    html.push(`<h3>Room ${r}</h3>`);
    html.push(getHTMLTable(rooms[r], env.numDay, env.numSlot, formatLesson));
}

console.log(`<html><body>${html.join('\n')}</body></html>`);
