const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { TfIdf } = require('natural');

class SemanticMealFinder {
  constructor(csvFilePath) {
    this.csvFilePath = path.resolve(csvFilePath);
    this.data = [];
    this.tfidf = new TfIdf();
    this.initialized = false;
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
          console.log(`✅ Loaded ${this.data.length} meals from CSV.`);
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

    if (row['Meal Type']) {
      const mealType = row['Meal Type'].toLowerCase();
      weightedParts.push(`${mealType} `.repeat(3)); // Strong weight
    }

    if (row['Nutritional Goals']) {
      weightedParts.push(`${row['Nutritional Goals'].toLowerCase()} `.repeat(2));
    }

    const otherFields = [
      'Food Items',
      'Nutritional Value',
      'Purpose',
      'Customization Options',
      'Dietary Restrictions',
      'Cultural Preferences'
    ];

    otherFields.forEach(field => {
      if (row[field]) {
        weightedParts.push(row[field].toLowerCase());
      }
    });

    return weightedParts.join(' ');
  }

  findSimilarMeals(query, topN = 2) {
    if (typeof query !== 'string') {
      throw new TypeError('Query must be a string.');
    }

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

module.exports = SemanticMealFinder;
