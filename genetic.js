function population(chromosome) { 
    const maxPop = 500;
    const perRandom = 0.2;
    const perCulling = 0;
    const perMutation = 0.4;
    const perCrossOver = 0.4;

    const varMutationCount = 0.2;

    let population = [];

    function sortByFitness(population) {
        return population
            .map(x => [x.fitness(), x])
            .sort().reverse().map(x => x[1]);
    }

    function genesis() {
        const population = [];
        for(let i=0; i<maxPop; i++) {
            population.push(chromosome.clone().randomize());
        }
        return sortByFitness(population);
    }

    function runGeneration() {
        const gen1 = population;
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

    return {
        genesis() {
            population = genesis();
            return this;
        },
        next() {
            population = runGeneration();
            return this;
        },
        getData() {
            return population;
        },
    };
}

module.exports = population;
