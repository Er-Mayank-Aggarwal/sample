from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
from flask_cors import CORS

app = Flask(__name__, static_folder="frontend")  # Ensure this folder exists
CORS(app)

@app.route("/")
def serve_frontend():
    return send_from_directory("frontend", "index.html")

@app.route("/run-code", methods=["POST"])
def run_code():
    data = request.json
    language = data.get("language")
    code = data.get("code")
    user_input = data.get("input")  # Capture user input

    if not code:
        return jsonify({"output": "Error: No code provided."})

    temp_file = "temp"

    try:
        if language == "python":
            result = subprocess.run(
                ["python3", "-c", code], 
                input=user_input,  # Pass the input to the code execution
                capture_output=True, text=True, timeout=5
            )

        elif language == "c":
            with open(f"{temp_file}.c", "w") as f:
                f.write(code)
            subprocess.run(["gcc", f"{temp_file}.c", "-o", temp_file], capture_output=True, text=True)
            result = subprocess.run([f"./{temp_file}"], input=user_input, capture_output=True, text=True, timeout=5)

        elif language == "cpp":
            with open(f"{temp_file}.cpp", "w") as f:
                f.write(code)
            subprocess.run(["g++", f"{temp_file}.cpp", "-o", temp_file], capture_output=True, text=True)
            result = subprocess.run([f"./{temp_file}"], input=user_input, capture_output=True, text=True, timeout=5)

        elif language == "java":
            with open("Temp.java", "w") as f:
                f.write(code)
            subprocess.run(["javac", "Temp.java"], capture_output=True, text=True)
            result = subprocess.run(["java", "Temp"], input=user_input, capture_output=True, text=True, timeout=5)

        else:
            return jsonify({"output": "Error: Unsupported language."})

        return jsonify({"output": result.stdout + result.stderr})

    except subprocess.TimeoutExpired:
        return jsonify({"output": "Error: Code execution timed out."})

    finally:
        for ext in [".c", ".cpp", ".class", "", ".java"]:
            if os.path.exists(temp_file + ext):
                os.remove(temp_file + ext)

if __name__ == "__main__":
    app.run(debug=True)
