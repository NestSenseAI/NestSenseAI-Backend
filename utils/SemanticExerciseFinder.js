const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { TfIdf } = require('natural');

let instance = null;

class SemanticExerciseFinder {
    constructor(csvFilePath) {
        if (instance) return instance;

        this.csvFilePath = path.resolve(csvFilePath);
        this.data = [];
        this.tfidf = new TfIdf();
        this.initialized = false;

        instance = this;
    }

    async initialize() {
        if (this.initialized) return;

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    this.data.push(row);
                    const searchText = this._createSearchText(row);
                    this.tfidf.addDocument(searchText);
                })
                .on('end', () => {
                    this.initialized = true;
                    console.log(`✅ Loaded ${this.data.length} exercises from CSV.`);
                    resolve();
                })
                .on('error', (error) => {
                    console.error('❌ Error loading CSV file:', error);
                    reject(error);
                });
        });
    }

    _createSearchText(row) {
        const weightedParts = [];

        if (row['Activity']) {
            weightedParts.push(`${row['Activity'].toLowerCase()} `.repeat(3));
        }

        if (row['Focus_Area']) {
            weightedParts.push(`${row['Focus_Area'].toLowerCase()} `.repeat(2));
        }

        const otherFields = [
            'Phase',
            'Delivery_Type',
            'Pelvic_Floor_Safe',
            'Diastasis_Safe',
            'Energy_Level_Required',
            'Instructions',
            'Trainer_Note',
            'Contraindications',
            'Breathwork_Integrated'
        ];

        otherFields.forEach(field => {
            if (row[field]) {
                weightedParts.push(row[field].toLowerCase());
            }
        });

        return weightedParts.join(' ');
    }

    findSimilarExercises(query, topN = 3) {
        const processedQuery = query.toLowerCase().trim();
        const scores = [];

        this.tfidf.tfidfs(processedQuery, (i, measure) => {
            scores.push({ index: i, score: measure });
        });

        scores.sort((a, b) => b.score - a.score);
        const topResults = scores.slice(0, topN);

        return topResults.map(({ index, score }) => ({
            ...this.data[index],
            relevanceScore: score.toFixed(4),
        }));
    }
}

module.exports = SemanticExerciseFinder;
