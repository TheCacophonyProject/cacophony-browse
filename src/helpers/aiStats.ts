import { NewVisit} from "@/api/Monitoring.api";

const labels = [
    "bird", 
    "possum", 
    "cat", 
    "hedgehog", 
    "rat", 
    "mustelid",
    "wallaby", 
    "other",
    "non animal",
    "undefined", 
    "none",
]

export function countByClassThenAiClass(visits: NewVisit[]) {

    const byClass =  visits.reduce((acc, visit: NewVisit) => {
        const classi = findLabelIndex(visit.classification);
        const aiClassi = findLabelIndex(visit.classificationAi);

        acc[classi] = acc[classi] || {};
        acc[classi][aiClassi] = (acc[classi][aiClassi] || 0) + Number(1); 

        return acc;
    }, {});

    return byClass;
}

function findLabelIndex(value) {
    let index = labels.findIndex(label => label === value);
    if (index < 0) {
        index = labels.findIndex(label => label === "other");
    }
}