#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""

@author: angus robinson
Web version of SynTeamPlus

After Eva Andrejczuk's design of SynTeam
"""


import math
import random
import itertools
import time

def SynTeamPlus(data,NTeams):
    
  
    NTeams=round(NTeams)

    NStudents=len(data["prof"])
    lda=0.8
    prof=[0 for i in range(NStudents)]
    heat = 10
    cooling_rate = 0.01
    
    PBest = [[0 for i in range(NTeams)] for j in range(NStudents)] #Current best partition
    
    MinTeamSize=int(math.floor(NStudents/NTeams))
    MaxTeamSize=int(math.ceil(NStudents/NTeams))
    
    NSmallTeams=NTeams*MaxTeamSize - NStudents
    NLargeTeams=NTeams - NSmallTeams
    
    for s in range(NStudents):
        prof[s]=data["prof"][s]
        
    #Create a list of student indexes in order of proficiency
    ordered = [i for i in range(NStudents)] #indexes of students to shuffle
    for i in range(NStudents):
        for j in range(i,NStudents):
            if prof[j]>prof[i]:
                tmp=ordered[i]
                ordered[i]=ordered[j]
                ordered[j]=tmp
    
    #Partition students by allocating them to teams cyclically in order of proficiency
    Studentindex = 0
    Teamindex = 0
   
    for i in range(NStudents):
        PBest[ordered[Studentindex]][Teamindex] = 1
        Studentindex +=1
        Teamindex = (Teamindex+1) % NTeams
        

    start=time.time()
    # while time.time()<start+60:
    while heat > 1 and time.time()<start+850:
        # Choose two random teams, A and B, from the current best partition.
        teamprof= [0 for i in range(NTeams)]
        for i in range(NTeams):
            for j in range(NStudents):
                teamprof[i]+=PBest[j][i]*prof[j]
        if random.random() < 0.8:
        
            Aindex = teamprof.index(max(teamprof))
            Bindex = teamprof.index(min(teamprof))
            
            if (Aindex == Bindex):# or (max(teamprof)-min(teamprof)<0.5):
                break
        
        else:
            Aindex= random.randint(0,NTeams-1)
            Bindex = random.randint(0,NTeams-1)
            while Aindex == Bindex:
                Bindex = random.randint(0,NTeams-1)
       
        teamset=[] #The set of all students in either Team A or Team B
        teama = []
        teamb = []
        
        for i in range(NStudents):
            if (PBest[i][Aindex] == 1):
                teama.append(i)
                teamset.append(i)
            if (PBest[i][Bindex] == 1):
                teamb.append(i)
                teamset.append(i)
                
        #Evaluate current partition
        teamprofA=0
        teamprofB=0
        for i in teama:
            teamprofA+=prof[i]
        for i in teamb:
            teamprofB+=prof[i]
        ABcurrenteval=math.log(teamprofA)+math.log(teamprofB)
        # ABcurrenteval=abs(teamprofA-teamprofB)
           
                
        # Create a list of alternative partitions between the two teams
        if len(teamset) == 2*MinTeamSize: #i.e. if both teams are small
            altA = list(itertools.combinations(teamset,MinTeamSize))
        else:
            altA = list(itertools.combinations(teamset,MaxTeamSize))
            
        altB = [[] for i in range(len(altA))]
        for i in range(len(altA)):
            altB[i] = list(set(teamset)-set(altA[i]))
        
        # Test fairness of each team partition    
        ABbesteval = 1 # Current highest proficiency for a partition of A and B
        ABbestindex = 0 # Index of best partition in altA and altB
        
        for i in range(len(altA)):
            teamprofA=0
            teamprofB=0
            for j in altA[i]:
                teamprofA+=prof[j]
            for j in altB[i]:
                teamprofB+=prof[j]
            tempeval = math.log(teamprofA)+math.log(teamprofB)
            # tempeval=abs(teamprofA-teamprofB)
            if (tempeval > ABbesteval) and (set(altA[i]) != set(teama)):
                ABbesteval = tempeval
                ABbestindex = i
                
            
        #Reassign students of A and B into the optimal partition between those two teams.
        # if (ABbesteval < ABcurrenteval) or max(0.05*heat*(1-(ABbesteval-ABcurrenteval)),0) >= random.random():
        if (ABbesteval > ABcurrenteval) or max(0.05*heat*(1-(ABcurrenteval-ABbesteval)),0) >= random.random():
            for i in altA[ABbestindex]:
                PBest[i][Aindex] = 1
                PBest[i][Bindex] = 0
            for j in altB[ABbestindex]:
                PBest[j][Aindex] = 0
                PBest[j][Bindex] = 1
            
        heat -= cooling_rate
            
    return(PBest)        
        
            
    
    
    
    
    
    
    
    
