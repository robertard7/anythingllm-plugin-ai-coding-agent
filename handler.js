// handler.js - AI Coding Agent with Docker Storage Support
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Use Docker-mounted storage path if available
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(__dirname, "storage");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

module.exports.runtime = {
  handler: async function ({ task, language, framework, options, filename }) {
    try {
      console.log(`🔧 AI Coding Agent processing task: ${task}`);

      let result;
      switch (task.toLowerCase()) {
        case "generate_code":
          result = generateCode(language, framework, options);
          saveToStorage(filename, result);
          break;
        case "retrieve_code":
          result = retrieveFromStorage(filename);
          break;
        case "modify_code":
          result = modifyStoredCode(filename, options.newCode);
          break;
        case "delete_code":
          result = deleteFromStorage(filename);
          break;
        case "list_files":
          result = listStoredFiles();
          break;
        default:
          result = `❌ Unknown task '${task}'. Available: generate_code, retrieve_code, modify_code, delete_code, list_files.`;
      }

      return JSON.stringify({ task, result });
    } catch (e) {
      console.error(`❌ AI Agent failed: ${e.message}`);
      return `🚨 Error: ${e.message}`;
    }
  },
};

// ✅ Generates boilerplate code
function generateCode(language) {
  const templates = {
    javascript: `console.log("Hello, world!");`,
    python: `print("Hello, world!")`,
    java: `public class Main { public static void main(String[] args) { System.out.println("Hello, world!"); } }`,
  };

  return templates[language] || `🚨 Unsupported language '${language}'. Available: JavaScript, Python, Java.`;
}

// ✅ Save code to the Docker storage directory
function saveToStorage(filename, content) {
  const filePath = path.join(STORAGE_DIR, filename);
  fs.writeFileSync(filePath, content, "utf8");
  return `✅ Code saved to ${filePath}`;
}

// ✅ Retrieve code from the storage directory
function retrieveFromStorage(filename) {
  const filePath = path.join(STORAGE_DIR, filename);
  if (!fs.existsSync(filePath)) return `🚨 File '${filename}' not found.`;
  return fs.readFileSync(filePath, "utf8");
}

// ✅ Modify existing stored code
function modifyStoredCode(filename, newCode) {
  const filePath = path.join(STORAGE_DIR, filename);
  if (!fs.existsSync(filePath)) return `🚨 File '${filename}' not found.`;
  fs.writeFileSync(filePath, newCode, "utf8");
  return `✅ Code in '${filename}' updated.`;
}

// ✅ Delete a stored file
function deleteFromStorage(filename) {
  const filePath = path.join(STORAGE_DIR, filename);
  if (!fs.existsSync(filePath)) return `🚨 File '${filename}' not found.`;
  fs.unlinkSync(filePath);
  return `🗑️ '${filename}' deleted.`;
}

// ✅ List all stored files
function listStoredFiles() {
  return fs.readdirSync(STORAGE_DIR);
}
