const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, 'schema');
const DATABASE_DIR = path.join(__dirname, 'database');
const LOGS_DIR = path.join(__dirname, 'logs');
const INDEX_FILE = path.join(__dirname, '_index.csv');
const SCHEMA_FILE = path.join(SCHEMA_DIR, '_schemas.csv');
const LOG_FILE = path.join(LOGS_DIR, 'logs.txt');

[SCHEMA_DIR, DATABASE_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

[LOG_FILE, INDEX_FILE].forEach(file => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '');
    }
});

class GalaxyDB {
    constructor(entity) {
        this.entity = entity;
        this.schema = this.loadSchema(entity);
        this.filePath = path.join(DATABASE_DIR, `${entity}.csv`);
        this.index = this.loadIndex();
        this.validateSchema();
        this.ensureFileExists();
    }

    log(message, isConsole = false) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        if (isConsole) {
            console.log(logMessage);
        } else {
            fs.appendFileSync(LOG_FILE, logMessage);
        }
    }

    loadSchema(entity) {
        const data = fs.readFileSync(SCHEMA_FILE, 'utf-8').trim().split('\n');
        for (let row of data) {
            const [name, fields] = row.split(':');
            if (name.trim() === entity) {
                return fields.split(',').map(f => f.trim());
            }
        }
        throw new Error(`Schema not found for ${entity}`);
    }

    validateSchema() {
        if (!this.schema.includes('_id')) {
            throw new Error(`Schema for ${this.entity} must have a primary key (_id)`);
        }
    }

    ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, this.schema.join(',') + '\n');
        }
    }

    loadIndex() {
        const indexMap = new Map();
        const indexData = fs.readFileSync(INDEX_FILE, 'utf-8').trim().split('\n');
        for (const line of indexData) {
            const [table, id, offset] = line.split(',');
            if (table === this.entity) {
                indexMap.set(id, parseInt(offset));
            }
        }
        return indexMap;
    }

    saveIndex() {
        const allIndexes = fs.readFileSync(INDEX_FILE, 'utf-8').trim().split('\n');
        const updatedIndexes = allIndexes.filter(line => !line.startsWith(`${this.entity},`));
        for (const [id, offset] of this.index.entries()) {
            updatedIndexes.push(`${this.entity},${id},${offset}`);
        }
        fs.writeFileSync(INDEX_FILE, updatedIndexes.join('\n'));
    }

    readAll() {
        const records = fs.readFileSync(this.filePath, 'utf-8').trim().split('\n');
        if (records.length < 2) return [];
        return records.slice(1).map(line => {
            const values = line.split(',');
            return Object.fromEntries(this.schema.map((field, index) => [field, values[index] || '']));
        });
    }

    create(obj) {
        if (!obj._id) {
            this.log(`Error: Primary key (_id) is missing`, true);
            return;
        }

        const records = this.readAll();
        if (records.some(record => record._id === obj._id)) {
            this.log(`Error: Primary key conflict: _id ${obj._id} already exists.`, true);
            return;
        }

        const csvLine = this.schema.map(field => obj[field] || '').join(',');
        fs.appendFileSync(this.filePath, csvLine + '\n');
        this.index.set(obj._id, fs.statSync(this.filePath).size - csvLine.length - 1);
        this.saveIndex();
    }

    update(id, updatedData) {
        const records = this.readAll();
        let updated = false;

        const updatedRecords = records.map(record => {
            if (record._id === id) {
                updated = true;
                return { ...record, ...updatedData };
            }
            return record;
        });

        if (!updated) {
            this.log(`Error: Update failed. No entry with _id ${id}.`, true);
            return;
        }

        this._writeData(updatedRecords);
        this.index.set(id, fs.statSync(this.filePath).size - 1);
        this.saveIndex();
    }

    delete(id) {
        const records = this.readAll().filter(record => record._id !== id);
        if (records.length === this.index.size) {
            this.log(`Error: Delete failed. No entry with _id ${id}.`, true);
            return;
        }
        this._writeData(records);
        this.index.delete(id);
        this.saveIndex();
    }

    _writeData(records) {
        const csvLines = [this.schema.join(',')].concat(records.map(record => this.schema.map(field => record[field] || '').join(',')));
        fs.writeFileSync(this.filePath, csvLines.join('\n') + '\n');
    }

    static queryWithForeignKey(primaryRepo, foreignRepo, foreignKey) {
        const primaryRecords = primaryRepo.readAll();
        const foreignRecords = foreignRepo.readAll();
        const foreignIndex = new Map(foreignRecords.map(record => [record._id, record]));
        return primaryRecords.map(primary => ({
            ...primary,
            related: foreignIndex.get(primary[foreignKey]) || null
        }));
    }
}

module.exports = { GalaxyDB };
