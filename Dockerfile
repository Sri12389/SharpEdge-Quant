# Multi-stage build for SharpEdge-Quant backend
FROM python:3.10-slim as backend-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install pybind11
RUN pip install pybind11

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy source code
COPY src/python ./src/python
COPY src/cpp ./src/cpp
COPY CMakeLists.txt .

# Build C++ library
RUN mkdir build && cd build && \
    cmake .. && \
    make

# Final backend stage
FROM python:3.10-slim

# Copy built artifacts and source code
COPY --from=backend-builder /app/build /app/build
COPY --from=backend-builder /app/src /app/src
COPY --from=backend-builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages

WORKDIR /app

# Set environment variables
ENV PYTHONPATH=/app/build:$PYTHONPATH
ENV FLASK_APP=src/python/api.py
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["flask", "run", "--host=0.0.0.0"]