cmake_minimum_required(VERSION 3.10)
project(QuantTrading)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

# Find Python and pybind11
find_package(Python REQUIRED COMPONENTS Interpreter Development)
find_package(pybind11 CONFIG)
if(NOT pybind11_FOUND)
  include(FetchContent)
  FetchContent_Declare(
    pybind11
    GIT_REPOSITORY https://github.com/pybind/pybind11.git
    GIT_TAG        v2.10.0
  )
  FetchContent_MakeAvailable(pybind11)
endif()

# Include directories
include_directories(include)

# Source files
set(SOURCES 
    src/cpp/backtester.cpp
    src/cpp/trade_simulator.cpp
    src/cpp/performance_metrics.cpp
)

# Create library
add_library(backtester STATIC ${SOURCES})

# Create pybind11 module
pybind11_add_module(quant_cpp_engine src/cpp/binding.cpp ${SOURCES})