from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load the intent-based dataset
with open('intent_based_data.json', 'r') as file:
    bot_data = json.load(file)

# Function to find a response based on user query
def find_response(user_query):
    for intent in bot_data:
        # Check if the user query matches any pattern in the intent
        if any(pattern.lower() in user_query.lower() for pattern in intent['Patterns']):
            # Randomly select a response to make conversations dynamic
            return random.choice(intent['Responses'])
    return "I'm sorry, I couldn't find an answer to that. Can you try asking in a different way?"

# Chat API endpoint
@app.route('/chat', methods=['POST'])
def chat():
    # Parse the JSON request
    data = request.json
    user_message = data.get("message", "")

    if not user_message.strip():
        return jsonify({
            "status": "error",
            "message": "Message is required"
        }), 400

    # Generate a response based on the dataset
    response = find_response(user_message)
    return jsonify({
        "status": "success",
        "user_message": user_message,
        "bot_reply": response
    })

# Run the Flask server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))  # Use Render's PORT or default to 5001
    print(f"Starting server on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)