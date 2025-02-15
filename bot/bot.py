from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "*"}})  # Allow CORS on /chat route

# Load the intent-based dataset
with open('intent_based_data.json', 'r') as file:
    bot_data = json.load(file)

# Function to find a response based on user query
def find_response(user_query):
    for intent in bot_data:
        if any(pattern.lower() in user_query.lower() for pattern in intent['Patterns']):
            return random.choice(intent['Responses'])
    return "I'm sorry, I couldn't find an answer to that. Can you try asking in a different way?"

# Handle CORS Preflight requests
@app.route('/chat', methods=['OPTIONS'])
def preflight():
    return '', 204  # Return an empty response with HTTP 204 (No Content)

# Chat API endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message.strip():
        return jsonify({"status": "error", "message": "Message is required"}), 400

    response = find_response(user_message)
    return jsonify({"status": "success", "user_message": user_message, "bot_reply": response})

# Run Flask server with dynamic port for Render
if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))  # Render dynamically assigns PORT
    print(f"Starting server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
