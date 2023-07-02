import Database from 'better-sqlite3';

const db = new Database('personal-wiki-podcast.db');

// Function to create a new topic
export function createTopic({ title }) {
  const statement = db.prepare('INSERT INTO topics (title) VALUES (?)');
  const result = statement.run(title);
  return result.lastInsertRowid;
}

// Function to create a new article
export function createArticle({ title, wikipediaUrl }) {
  const statement = db.prepare('INSERT INTO articles (title, wikipedia_url) VALUES (?, ?)');
  const result = statement.run(title, wikipediaUrl);
  return result.lastInsertRowid;
}

// Function to create a new article section
export function createArticleSection({ title, articleId, htmlContent, script }) {
  const statement = db.prepare('INSERT INTO article_sections (title, article_id, html_content, script) VALUES (?, ?, ?, ?)');
  const result = statement.run(title, articleId, htmlContent, script);
  return result.lastInsertRowid;
}

// Function to create a new queue item
export function createQueueItem({ articleSectionId, topicId, queuePosition }) {
  const statement = db.prepare('INSERT INTO queue_items (article_section_id, topic_id, queue_position) VALUES (?, ?, ?)');
  const result = statement.run(articleSectionId, topicId, queuePosition);
  return result.lastInsertRowid;
}

// Function to create a new episode
export function createEpisode({ title, topicId, htmlDescription }) {
  const statement = db.prepare('INSERT INTO episodes (title, topic_id, html_description) VALUES (?, ?, ?)');
  const result = statement.run(title, topicId, htmlDescription);
  return result.lastInsertRowid;
}

export function addEpisodeMP3({ episodeId, mp3Url, mp3Duration, mp3BytesLength }) {
  const statement = db.prepare('UPDATE episodes SET mp3_url = ?, mp3_duration = ?, mp3_bytes_length = ?, is_processed = ? WHERE id = ?');
  return statement.run(mp3Url, mp3Duration, mp3BytesLength, 1, episodeId);
}

// Function to create a new episode chapter
export function createEpisodeChapter({ title, episodeId, articleSectionId }) {
  const statement = db.prepare('INSERT INTO episode_chapters (title, episode_id, article_section_id) VALUES (?, ?, ?)');
  const result = statement.run(title, episodeId, articleSectionId);
  return result.lastInsertRowid;
}

// Function to add MP3 data to an episode chapter
export function addEpisodeChapterMP3({ chapterId, mp3Url, mp3Duration, mp3BytesLength }) {
  const statement = db.prepare('UPDATE episode_chapters SET mp3_url = ?, mp3_duration = ?, mp3_bytes_length = ?, is_processed = ? WHERE id = ?');
  return statement.run(mp3Url, mp3Duration, mp3BytesLength, 1, chapterId);
}

// Function to retrieve all topics
export function getAllTopics() {
  const statement = db.prepare('SELECT * FROM topics');
  return statement.all();
}

// Function to retrieve all articles
export function getAllArticles() {
  const statement = db.prepare('SELECT * FROM articles');
  return statement.all();
}

// Function to retrieve all article sections
export function getAllArticleSections() {
  const statement = db.prepare('SELECT * FROM article_sections');
  return statement.all();
}

// Function to retrieve all queue items
export function getAllQueueItems() {
  const statement = db.prepare('SELECT * FROM queue_items');
  return statement.all();
}

// Function to retrieve all episodes
export function getAllEpisodes() {
  const statement = db.prepare('SELECT * FROM episodes');
  return statement.all();
}

// Function to retrieve all episode chapters
export function getAllEpisodeChapters() {
  const statement = db.prepare('SELECT * FROM episode_chapters');
  return statement.all();
}

// Function to update a topic
export function updateTopic({ id, title }) {
  const statement = db.prepare('UPDATE topics SET title = ? WHERE id = ?');
  return statement.run(title, id);
}

