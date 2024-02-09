import math
import random
import itertools
import time

def SynTeamPlus(data, NTeams):
    NTeams = round(NTeams)
    NStudents = len(data["prof"])
    lda = 0.8
    heat = 10
    cooling_rate = 0.01
    PBest = [[0 for _ in range(NTeams)] for _ in range(NStudents)]

    MinTeamSize = NStudents // NTeams
    MaxTeamSize = -(-NStudents // NTeams)
    NSmallTeams = NTeams * MaxTeamSize - NStudents
    NLargeTeams = NTeams - NSmallTeams

    prof = data["prof"]
    ordered = sorted(range(NStudents), key=lambda i: prof[i], reverse=True)

    for i in range(NStudents):
        PBest[ordered[i]][i % NTeams] = 1

    start = time.time()
    while heat > 1 and time.time() < start + 850:
        teamprof = [sum(PBest[j][i] * prof[j] for j in range(NStudents)) for i in range(NTeams)]
        
        if random.random() < lda:
            Aindex, Bindex = teamprof.index(max(teamprof)), teamprof.index(min(teamprof))
            if Aindex == Bindex:
                break
        else:
            Aindex, Bindex = random.sample(range(NTeams), 2)

        teamset = [i for i in range(NStudents) if PBest[i][Aindex] == 1 or PBest[i][Bindex] == 1]
        teama, teamb = [i for i in teamset if PBest[i][Aindex] == 1], [i for i in teamset if PBest[i][Bindex] == 1]

        teamprofA = sum(prof[i] for i in teama)
        teamprofB = sum(prof[i] for i in teamb)
        ABcurrenteval = math.log(teamprofA) + math.log(teamprofB)

        if len(teamset) == 2 * MinTeamSize:
            altA = list(itertools.combinations(teamset, MinTeamSize))
        else:
            altA = list(itertools.combinations(teamset, MaxTeamSize))
        altB = [list(set(teamset) - set(a)) for a in altA]
        ABbesteval = -float('inf')
        ABbestindex = 0
    
        for i, a in enumerate(altA):
            teamprofA = sum(prof[j] for j in a)
            teamprofB = sum(prof[j] for j in altB[i])
            tempeval = math.log(teamprofA) + math.log(teamprofB)
            if tempeval > ABbesteval and set(a) != set(teama):
                ABbesteval = tempeval
                ABbestindex = i
    
        if ABbesteval > ABcurrenteval or max(0.05 * heat * (1 - (ABcurrenteval - ABbesteval)), 0) >= random.random():
            for i in altA[ABbestindex]:
                PBest[i][Aindex], PBest[i][Bindex] = 1, 0
            for j in altB[ABbestindex]:
                PBest[j][Aindex], PBest[j][Bindex] = 0, 1
    
        heat -= cooling_rate
    
    return PBest
    
