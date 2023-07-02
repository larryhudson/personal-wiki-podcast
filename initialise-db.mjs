import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve("personal-wiki-podcast.db");

const db = new Database(dbPath, {
  verbose: console.log,
});
db.pragma("journal_mode = WAL");

const tableStatements = [
  `CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    wikipedia_url TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS article_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    html_content TEXT NOT NULL,
    script TEXT NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id)
  );`,
  `CREATE TABLE IF NOT EXISTS queue_items (
    id INTEGER,
    article_section_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    queue_position REAL NOT NULL,
    FOREIGN KEY (article_section_id) REFERENCES article_sections(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );`,
  `CREATE TABLE IF NOT EXISTS episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    topic_id INTEGER NOT NULL,
    html_description TEXT,
    publish_date DATE,
    is_processed INTEGER DEFAULT 0,
    mp3_url TEXT,
    mp3_duration TEXT,
    mp3_bytes_length INTEGER,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
  );`,
  `CREATE TABLE IF NOT EXISTS episode_chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    episode_id INTEGER NOT NULL,
    article_section_id INTEGER NOT NULL,
    is_processed INTEGER DEFAULT 0,
    mp3_url TEXT,
    mp3_duration TEXT,
    mp3_bytes_length INTEGER,
    FOREIGN KEY (episode_id) REFERENCES episodes(id),
    FOREIGN KEY (article_section_id) REFERENCES article_sections(id)
  );`
];

tableStatements.forEach((statement) => {
  db.exec(statement);
});

db.close();
