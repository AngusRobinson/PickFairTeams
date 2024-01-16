function synTeamPlus(data, NTeams) {
    NTeams = Math.round(NTeams);
    const NStudents = data.prof.length;
    const lda = 0.8;
    let heat = 10;
    const coolingRate = 0.01;
    let PBest = Array.from(Array(NStudents), () => new Array(NTeams).fill(0));

    const MinTeamSize = Math.floor(NStudents / NTeams);
    const MaxTeamSize = Math.ceil(NStudents / NTeams);

    const prof = data.prof;
    let ordered = Array.from(prof.keys()).sort((a, b) => prof[b] - prof[a]);

    for (let i = 0; i < NStudents; i++) {
        PBest[ordered[i]][i % NTeams] = 1;
    }

    let startTime = Date.now();
    const foundUndefined=false;
    while (heat > 1 && Date.now() < startTime + 850000) {
        let teamprof = Array.from(Array(NTeams), (_, i) => 
            PBest.reduce((acc, val, j) => acc + val[i] * prof[j], 0));

        let Aindex, Bindex;
        if (Math.random() < 0.8) {
            Aindex = teamprof.indexOf(Math.max(...teamprof));
            Bindex = teamprof.indexOf(Math.min(...teamprof));
            if (Aindex === Bindex) {
                break;
            }
        } else {
            do {
                Aindex = Math.floor(Math.random() * NTeams);
                Bindex = Math.floor(Math.random() * NTeams);
            } while (Aindex === Bindex);
        }

        let teamset = [];
        let teama = [];
        let teamb = [];
        PBest.forEach((val, i) => {
            if (val[Aindex] === 1) {
                teama.push(i);
                teamset.push(i);
            }
            if (val[Bindex] === 1) {
                teamb.push(i);
                teamset.push(i);
            }
        });

        let teamprofA = teama.reduce((acc, i) => acc + prof[i], 0);
        let teamprofB = teamb.reduce((acc, i) => acc + prof[i], 0);
        let ABcurrenteval = Math.log(teamprofA) + Math.log(teamprofB);

        let altA = combination(teamset, teamset.length === 2 * MinTeamSize ? MinTeamSize : MaxTeamSize);
        let altB = altA.map(a => teamset.filter(i => !a.includes(i)));

        let ABbesteval = -Infinity;
        let ABbestindex = 0;

        altA.forEach((a, i) => {
            let teamprofA = a.reduce((acc, j) => acc + prof[j], 0);
            let teamprofB = altB[i].reduce((acc, j) => acc + prof[j], 0);
            let tempeval = Math.log(teamprofA) - Math.log(teamprofB);
            if (tempeval > ABbesteval && !arraysEqual(a, teama)) {
            ABbesteval = tempeval;
            ABbestindex = i;
            }
        });
        if (ABbesteval > ABcurrenteval || Math.max(0.05 * heat * (1 - (ABcurrenteval - ABbesteval)), 0) >= Math.random()) {
            altA[ABbestindex].forEach(i => {
                PBest[i][Aindex] = 1;
                PBest[i][Bindex] = 0;
            });
            altB[ABbestindex].forEach(j => {
                PBest[j][Aindex] = 0;
                PBest[j][Bindex] = 1;
                });
        }
        for (let i = 0; i < NStudents; i++) {
            for (let j = 0; j < NTeams; j++) {
                if (PBest[i][j] === undefined) {
                    foundUndefined = true;
                }
            }
        }
        
        heat -= coolingRate;
        if (foundUndefined) {
            console.log("Undefined found", { studentIndex: i, teamIndex: j });
            console.log({ PBest, teamset, teama, teamb, altA, altB, ABbestindex });
        }

    }
    return PBest;
}

function combination(array, size) {
    function p(t, i) {
        if (t.length === size) {
            result.push(t);
            return;
        }
        if (i + 1 > array.length) {
            return;
        }
        p(t.concat(array[i]), i + 1);
        p(t, i + 1);
    }
    var result = [];
    p([], 0);
    return result;
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}


