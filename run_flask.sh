#!/bin/bash

# Set the Python path to include the current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Set default port if not already set
export FLASK_PORT=${FLASK_PORT:-5001}

# Install required packages if not already installed
echo "Checking and installing required packages..."
pip3 install -r requirements.txt

# Download spaCy model if not already downloaded
echo "Checking spaCy model..."
python3 -m spacy download en_core_web_sm

# Run the Flask service
python3 src/main/java/com/openaiChatbot/Secure_Chatbot/anonymization_api.py 