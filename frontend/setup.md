# CampusAI Dependency Installation Guide

This file lists all required dependencies for the CampusAI system.

---

## Node.js Dependencies

```bash
# Authentication
npm install jsonwebtoken       # Used for creating and verifying JWT tokens
npm install bcryptjs           # Password hashing
npm install validator          # Input validation

# Security
npm install express-mongo-sanitize  # Prevent MongoDB injection attacks
npm install helmet                  # Secure HTTP headers

# File Upload
npm install multer             # Handle file uploads

# Blockchain / Web3
npm install ethers             # Ethereum blockchain interaction

# Data Processing
npm install xlsx               # Read and write Excel files

# Encryption
npm install crypto-js          # Client-side encryption utilities

# Scheduled Jobs
npm install node-cron          # Run scheduled tasks

# Fetch Requests
npm install node-fetch         # HTTP requests from Node.js


# FastAPI server for AI services
pip install fastapi uvicorn transformers torch datasets

# Jupyter Notebook for experimentation
pip install notebook

# PDF processing
pip install pypdf

# Vector database and embeddings
pip install faiss-cpu
pip install sentence-transformers

# Required for file uploads in FastAPI
pip install python-multipart

# Upgrade FAISS if needed
pip install faiss-cpu --upgrade

# Download local AI models
ollama pull tinyllama        # Lightweight local LLM
ollama pull qwen2:0.5b       # Small Qwen model


# CampusAI Setup & Run Guide

This guide explains how to install dependencies and run the CampusAI system.

---

## Start the AI Service (FastAPI)

```bash
# Navigate to the AI service folder
cd ai_service

# Activate the Conda environment
conda activate campushub_ai

# Start the FastAPI server
uvicorn app:app --port 8000



# Start the Ollama server
ollama serve