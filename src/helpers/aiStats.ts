import { NewVisit, NewVisitQuery} from "@/api/Monitoring.api";

export class ClassificationCounter {
    userClassIndex: number;
    aiClassIndex: number;
    recIds: number[];
    count: number;
    otherClasses: string[];

    constructor(aUserClass: number, anAiClass: number) {
        this.userClassIndex = aUserClass;
        this.aiClassIndex = anAiClass;
        this.recIds = [];
        this.count = 0;
        this.otherClasses = [];
    }

    addVisit(visit: NewVisit) {
        this.count++;
        const recordingIds = visit.recordings.map(rec => rec.recId);
        this.recIds.push(...recordingIds);
    }

    addOtherClass(className: string) {
        if (this.otherClasses.findIndex(name => name === className) < 0){
            this.otherClasses.push(className);
        }
    }

}

export function countByClassThenAiClass(visits: NewVisit[], allLabels: string[], otherLabel: string) {

    const otherIndex = allLabels.findIndex(label => label === otherLabel);

    const byClass =  visits.reduce((acc, visit: NewVisit) => {

        const classi = visit.classification || "none";
        const aiClassi = visit.classificationAi || "none";
        const index = findLabelIndex(classi, allLabels, otherIndex);
        const aiIndex = findLabelIndex(aiClassi, allLabels, otherIndex);

        const key = `${index}-${aiIndex}`;

        const counter = acc[key] || new ClassificationCounter(index, aiIndex);
        counter.addVisit(visit);
        if (aiIndex == otherIndex) {
            counter.addOtherClass(aiClassi);
        }
        acc[key] = counter;
        return acc;
    }, {});


    const heatMapPoints = [];
    
    for (const [key, aCounter ] of Object.entries(byClass)) {
        const counter = (aCounter as ClassificationCounter);
        heatMapPoints.push([counter.aiClassIndex, counter.userClassIndex, counter.count]);
    }

    return {
        heatMapPoints,
        counters : byClass
    }
}


function findLabelIndex(value: string, allLabels: string[], defaultValue: number): number {
    let index = allLabels.findIndex(label => label === value);
    if (index < 0) {
        index = defaultValue;
    }
    return index;
}