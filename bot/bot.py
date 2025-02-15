from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"  # Allow all origins
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route('/chat', methods=['OPTIONS'])
def handle_options():
    return '', 204  # Empty response for preflight

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "")

    if not user_message.strip():
        return jsonify({"status": "error", "message": "Message is required"}), 400

    response_text = "I received: " + user_message
    return jsonify({"status": "success", "bot_reply": response_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=False)
