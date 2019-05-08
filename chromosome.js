// 5 days, 10 slots per day per room

function calc(env) {
    const { lessons, 
        numDay, numRoom, numSlot,
        numStudent, numTeacher, numClass } = env;

    //=== calculation functions ===//
    function getDay(x) {
        return parseInt(x / (numRoom * numSlot));
    }

    function getRoom(x) {
        return parseInt((x / numSlot) % numRoom);
    }

    function getSlot(x) {
        return parseInt(x % numSlot);
    }

    function getSlotId(day, room, slot) {
        return ((day*numRoom + room)*numSlot) + slot;
    }

    //=== genetic algorithm ===//
    function rawRandChromosome() {
        const totalSlots = numDay * numRoom * numSlot;

        const chromosome = [];
        for(const i in lessons) {
            const lesson = lessons[i];
            const startSlot = parseInt(Math.random() * (totalSlots - lesson.slots));

            for(let j=0; j<lesson.slots; j++) {
                chromosome.push(startSlot + j);
            }
        }

        return chromosome;
    }

    function rawFitness(chromosome) {
        function addFreq(freq, val) {
            if (!freq[val]) {
                freq[val] = 1;
            } else {
                freq[val] += 1;
            }
        }

        function initArray(cnt) {
            const array = []; 
            for(let i=0; i<cnt; i++) {
                array.push({});
            }
            return array;
        }

        const rooms = initArray(numRoom);
        const students = initArray(numStudent);
        const teachers = initArray(numTeacher); 
        
        // building the tables
        let c = 0;
        for(let i=0; i<lessons.length; i++) {
            const lesson = lessons[i];

            for(let l=0; l<lesson.slots; l++){
                const slotId = chromosome[c];
                const day = getDay(slotId);
                const room = getRoom(slotId);
                const slot = getSlot(slotId);

                const daySlot = day*numSlot + slot;

                for(let t=0; t<lesson.teachers.length; t++){
                    addFreq(teachers[lesson.teachers[t]], daySlot);
                }

                for(let s=0; s<lesson.students.length; s++){
                    addFreq(students[lesson.students[s]], daySlot);
                }

                addFreq(rooms[room], daySlot);
                c += 1;
            }
        }
        
        c = 0; let fitness = 0;
        for(let i=0; i<lessons.length; i++) {
            const lesson = lessons[i];

            let sday, sroom, sslot;
            for(let l=0; l<lesson.slots; l++){
                const slotId = chromosome[c];
                const day = getDay(slotId);
                const room = getRoom(slotId);
                const slot = getSlot(slotId);

                const daySlot = day*numSlot + slot;

                for(let t=0; t<lesson.teachers.length; t++){
                    const teacher = lesson.teachers[t];

                    // f: teachers have no clashing slot
                    if(teachers[teacher][daySlot] === 1) {
                        fitness += 1;
                    }
                }

                for(let s=0; s<lesson.students.length; s++){
                    const student = lesson.students[s];

                    // f: students have no clashing slot
                    if(students[student][daySlot] === 1) {
                        fitness += 1;
                    }
                }
                
                // f: rooms have no clashing slot
                if(rooms[room][daySlot] === 1) {
                    fitness += 1;
                }

                // f: different slots is subsequent slots 
                if(l>0 && day===sday && sroom===sroom && sslot===slot-1){
                    fitness += 1;
                }
                
                sday = day; sroom = room; sslot = slot;
                c += 1;
            }
        }

        return fitness;
    }

    function rawCrossover(data1, data2) {
        const length = data1.length;

        const a = parseInt(Math.random() * length);
        const b = a + parseInt(Math.random() * (length-a-1));
        
        const data3 = [];
        for(let i=0; i<length; i++) {
            if(i<a || i>b) {
                data3.push(data2[i]);
            }else{
                data3.push(data1[i]); 
            }
        }

        return data3;
    }

    function rawMutate(data) {
        const length = data.length;

        const a = parseInt(Math.random() * length);
        const b = parseInt(Math.random() * length);

        const tmp = data[a];
        data[a] = data[b];
        data[b] = tmp;
    }

    return {
        lessons,
        numDay, numRoom, numSlot,
        rawCrossover, rawMutate,
        rawFitness, rawRandChromosome,
    };
}

//=== chromosome ===//
function makeChromosome(env, data) {
    return chromosome(env).setData(data);
}

function chromosome(env) {
    let data = [];
    const length = env.lessons.map(l => l.slots)
            .reduce((a,b)=>a+b, 0);

    return {
        length,
        getData() { return data; },

        clone() {
            return makeChromosome(env, data.slice(0));
        },
        setData(array) {
            if (length === array.length) { 
                data = array;
                return this;
            } else {
                throw `chromosome wrong size: needed ${length} got ${array.length}`; 
            }
        },
        randomize() {
            data = env.rawRandChromosome(); 
            return this;
        },

        fitness() {
            return env.rawFitness(data);
        },
        crossover(other) {
            return makeChromosome(env, env.rawCrossover(data, other.getData())); 
        },
        mutate(count) {
            const data2 = data.slice(0);
            for(let i=0; i<count; i++) {
                env.rawMutate(data2);
            } 
            return makeChromosome(env, data2);
        }
    };
}

function setup(env) {
    return chromosome(calc(env));
}
module.exports = setup;
