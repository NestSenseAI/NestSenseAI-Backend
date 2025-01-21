from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load the datasets
with open('data1.json', 'r') as file1:
    bot_data_1 = json.load(file1)

with open('data2.json', 'r') as file2:
    bot_data_2 = json.load(file2)

# Combine the datasets
bot_data = bot_data_1 + bot_data_2

# Function to find a response based on user query
def find_response(user_query):
    for entry in bot_data:
        if any(keyword.lower() in user_query.lower() for keyword in entry['Keywords']):
            return entry['BotResponse']
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
    print("Starting server on http://127.0.0.1:5001")
    app.run(debug=True, port=5001)
