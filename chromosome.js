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

    function extractInfo(slotId) {
        const day = getDay(slotId);
        const room = getRoom(slotId);
        const slot = getSlot(slotId);
        const daySlot = day*numSlot + slot;

        return { day, room, slot, daySlot };
    }

    function getBreakdown(data, func) {
        // func(freq array, data, lessonId)
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
                const info = extractInfo(data[c]); 

                for(let t=0; t<lesson.teachers.length; t++){
                    func(teachers[lesson.teachers[t]], info, i);
                }

                for(let s=0; s<lesson.students.length; s++){
                    func(students[lesson.students[s]], info, i);
                }

                func(rooms[info.room], info, i);
                c += 1;
            }
        }

        return { rooms, students, teachers };

    }

    function getDaySlotFreq(data) {
        function addFreq(freq, info) {
            const { daySlot } = info;

            if (!freq[daySlot]) {
                freq[daySlot] = 1;
            } else {
                freq[daySlot] += 1;
            }
        }

        return getBreakdown(data, addFreq);
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

    function rawFitnessMax(lesson) {
        return 4*lesson.slots;
    }

    function rawFitness(chromosome) {
        const { rooms, students, teachers } = getDaySlotFreq(chromosome);

        let c = 0; let fitness = 0;
        for(let i=0; i<lessons.length; i++) {
            const lesson = lessons[i];

            let sday, sroom, sslot;
            for(let l=0; l<lesson.slots; l++){
                const { day, room, slot, daySlot } = extractInfo(chromosome[c]);

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
                if(l==0 || (l>0 && day===sday && sroom===sroom && sslot===slot-1)){
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
        lessons, getBreakdown,
        numDay, numRoom, numSlot,
        rawCrossover, rawMutate,
        rawFitness, rawFitnessMax,
        rawRandChromosome,
    };
}

//=== chromosome ===//
function makeChromosome(env, data) {
    return chromosome(env).setData(data);
}

function chromosome(env) {
    function sum(array) {
        return array.reduce((a,b)=>a+b, 0);
    }


    let data = [];
    const length = sum(env.lessons.map(l => l.slots));
    const maxFitness = sum(env.lessons.map(l => env.rawFitnessMax(l)));

    return {
        env,
        length,
        maxFitness,
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

        getTimetable(){
            function addSlot(freq, info, lessonId) {
                const { day, slot, room } = info;

                if (!freq[day]) {
                    freq[day] = {};
                }

                if (!freq[day][slot]) {
                    freq[day][slot] = [];
                }

                freq[day][slot].push({ room, lessonId });
            }

            return env.getBreakdown(data, addSlot);
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
        },
    };
}

function setup(env) {
    return chromosome(calc(env));
}
module.exports = setup;
