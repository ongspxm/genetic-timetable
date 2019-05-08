const chromosome = require('./chromosome.js');
const genLessons = require('./genLessons.js');

function sortByFitness(population) {
    return population
        .map(x => [x.fitness(), x])
        .sort().map(x => x[1]);
}

const env = {
    numStudent: 20,
    numTeacher: 7,
    numClass: 80,
    
    numDay: 5,
    numRoom: 10,
    numSlot: 10,
}
env.lessons = genLessons(env);

const c = chromosome(env).randomize();
const population = [];
for(let i=0; i<50; i++) {
    population.push(c.clone().randomize());
}

sortByFitness(population)
    .forEach(p => console.log(p.fitness()));
