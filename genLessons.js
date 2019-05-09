function createClass(students, teachers, slots) {
    return {
        students,
        teachers,
        slots,
    };
}

function generateLesson(env) {
    const { numStudent, numTeacher, numClass } = env;
    function genRand(count, max) {
        const vals = [];
        for(let i=0; i<count; i++){
            vals.push(parseInt(Math.random()*max));
        }
        
        return vals;
    }

    // generate using the values given
    const lessons = [];
    for(let i=0; i<numClass; i++){
        lessons.push(createClass(
            genRand(1, numStudent),
            genRand(1, numTeacher),
            (Math.random()<0.2) + 1, 
        ));
    }

    return lessons;
}

module.exports = generateLesson;
