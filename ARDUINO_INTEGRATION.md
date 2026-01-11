# Arduino Integration Guide

This guide explains how to integrate your Arduino with the Power Monitor Dashboard.

## Overview
Your Arduino should send sensor readings (voltage, current, power) to the backend API via HTTP POST requests.

## API Endpoint
```
POST {BACKEND_URL}/api/readings
```

Replace `{BACKEND_URL}` with your actual backend URL.

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)
```json
{
    "voltage": 220.5,
    "current": 2.534,
    "power": 0.5588
}
```

### Field Specifications
- **voltage**: Float (Voltage in Volts)
- **current**: Float (Current in Amperes)
- **power**: Float (Power in Kilowatts)

## Arduino Example Code

### Using ESP8266/ESP32 with WiFi

```cpp
#include <ESP8266WiFi.h>  // For ESP8266
// #include <WiFi.h>      // For ESP32
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API URL
const char* serverUrl = "http://YOUR_BACKEND_URL/api/readings";

// Sensor pins (adjust based on your setup)
const int VOLTAGE_PIN = A0;
const int CURRENT_PIN = A1;

// Calibration factors (adjust based on your sensors)
const float VOLTAGE_CALIBRATION = 220.0 / 1023.0;
const float CURRENT_CALIBRATION = 5.0 / 1023.0;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("Connected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read sensor values
  int voltageRaw = analogRead(VOLTAGE_PIN);
  int currentRaw = analogRead(CURRENT_PIN);
  
  // Convert to actual values
  float voltage = voltageRaw * VOLTAGE_CALIBRATION;
  float current = currentRaw * CURRENT_CALIBRATION;
  float power = (voltage * current) / 1000.0; // Convert to kW
  
  // Send data to server
  sendReadingToServer(voltage, current, power);
  
  // Wait 5 seconds before next reading
  delay(5000);
}

void sendReadingToServer(float voltage, float current, float power) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["voltage"] = voltage;
    doc["current"] = current;
    doc["power"] = power;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
}
```

## Required Arduino Libraries

Install these libraries via Arduino Library Manager:

1. **ESP8266WiFi** or **WiFi** (built-in for ESP boards)
2. **ESP8266HTTPClient** or **HTTPClient** (built-in)
3. **ArduinoJson** (by Benoit Blanchon)

## Testing Your Arduino Integration

### 1. Using curl (for testing without Arduino)
```bash
curl -X POST http://YOUR_BACKEND_URL/api/readings \
  -H "Content-Type: application/json" \
  -d '{"voltage": 220.5, "current": 2.5, "power": 0.551}'
```

### 2. Check if reading was received
```bash
curl http://YOUR_BACKEND_URL/api/readings/latest
```

## Sensor Setup Recommendations

### Voltage Sensor
- **Recommended**: ZMPT101B AC Voltage Sensor Module
- **Range**: 0-250V AC
- **Output**: 0-5V analog

### Current Sensor
- **Recommended**: ACS712 Current Sensor (5A/20A/30A versions)
- **Output**: Analog voltage proportional to current
- **Connection**: In series with load

### Wiring Safety
⚠️ **IMPORTANT SAFETY WARNINGS:**
- Never work on live circuits
- Use proper isolation for high voltage measurements
- Use optocouplers for Arduino protection
- Always have proper grounding
- Consider using a pre-built energy monitor module if unsure

## Calibration

### Voltage Calibration
1. Measure actual voltage with a multimeter
2. Read Arduino analog value
3. Calculate: `VOLTAGE_CALIBRATION = actual_voltage / analog_value`

### Current Calibration
1. Measure actual current with a multimeter
2. Read Arduino analog value
3. Calculate: `CURRENT_CALIBRATION = actual_current / analog_value`

## Troubleshooting

### Arduino can't connect to WiFi
- Check SSID and password
- Ensure Arduino is in range of WiFi router
- Verify WiFi supports 2.4GHz (ESP8266 doesn't support 5GHz)

### Readings not appearing on dashboard
- Check backend URL is correct and accessible
- Verify Arduino serial monitor shows successful POST (code 200)
- Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
- Test API manually with curl

### Inaccurate readings
- Calibrate sensors properly
- Check sensor connections
- Use moving average for stable readings
- Ensure proper power supply to sensors

## Advanced Features

### Adding Moving Average Filter
```cpp
const int NUM_SAMPLES = 10;
float voltageBuffer[NUM_SAMPLES];
int bufferIndex = 0;

float getAverageVoltage(float newReading) {
  voltageBuffer[bufferIndex] = newReading;
  bufferIndex = (bufferIndex + 1) % NUM_SAMPLES;
  
  float sum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    sum += voltageBuffer[i];
  }
  return sum / NUM_SAMPLES;
}
```

### Adding Retry Logic
```cpp
bool sendWithRetry(float voltage, float current, float power, int maxRetries = 3) {
  for (int i = 0; i < maxRetries; i++) {
    if (sendReadingToServer(voltage, current, power)) {
      return true;
    }
    delay(1000 * (i + 1)); // Exponential backoff
  }
  return false;
}
```

## Support
For issues or questions, check the backend logs and ensure your Arduino code matches the API specification above.
