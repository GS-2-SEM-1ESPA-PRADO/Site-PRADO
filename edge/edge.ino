// Dragon Capsule Telemetry — FIWARE Descomplicado
// Protocolo: Ultralight 2.0 via MQTT
// Alertas: recebidos via FIWARE, acionam LED e buzzer

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>


const char* SSID        = "Wokwi-GUEST";
const char* PASSWORD    = "";
const char* BROKER_MQTT = "35.247.216.21";
const int   BROKER_PORT = 1883;
const char* ID_MQTT     = "dragon-capsule-001";

const char* TOPIC_SUBSCRIBE = "/TEF/dragon001/cmd";
const char* TOPIC_ATTRS     = "/TEF/dragon001/attrs";
const char* TOPIC_TEMP      = "/TEF/dragon001/attrs/temp";
const char* TOPIC_PRESS     = "/TEF/dragon001/attrs/press";
const char* TOPIC_GAS       = "/TEF/dragon001/attrs/gas";
const char* TOPIC_MAG       = "/TEF/dragon001/attrs/mag";
const char* TOPIC_MAG_FLAG  = "/TEF/dragon001/attrs/mag_flag";
const char* TOPIC_RAD       = "/TEF/dragon001/attrs/rad";
const char* TOPIC_PROP      = "/TEF/dragon001/attrs/prop";
const char* TOPIC_AX        = "/TEF/dragon001/attrs/ax";
const char* TOPIC_AY        = "/TEF/dragon001/attrs/ay";
const char* TOPIC_AZ        = "/TEF/dragon001/attrs/az";

#define PIN_MQ2_AO     34
#define PIN_MQ2_DO     33
#define PIN_TRIG       13
#define PIN_ECHO       12
#define PIN_LED_R      25
#define PIN_LED_G      26
#define PIN_LED_B      27
#define PIN_BUZZER     23

#define HMC5883_ADDR   0x1E
#define RADIATION_ADDR 0x48
#define TANK_HEIGHT_CM 400.0

Adafruit_BMP085  bmp;
Adafruit_MPU6050 mpu;
WiFiClient       espClient;
PubSubClient     MQTT(espClient);
float            headingRef = -1;

void setLed(bool r, bool g, bool b) {
  digitalWrite(PIN_LED_R, r);
  digitalWrite(PIN_LED_G, g);
  digitalWrite(PIN_LED_B, b);
}

void beep(int freq, int duracao) {
  tone(PIN_BUZZER, freq, duracao);
  delay(duracao + 50);
  noTone(PIN_BUZZER);
}

// Canal LEDC para o LED verde (necessário no ESP32 para PWM)
#define LEDC_CHANNEL_G 0
#define LEDC_FREQ      5000
#define LEDC_RES       8

void acionarAlerta(String param) {
  Serial.println("[ALERTA] Parametro: " + param);

  if (param == "temp") {
    // Vermelho — beep longo
    setLed(true, false, false);
    beep(1000, 800);

  } else if (param == "press") {
    // Amarelo — beep duplo
    setLed(true, true, false);
    beep(900, 300); delay(100); beep(900, 300);

  } else if (param == "gas") {
    // Roxo — beep rapido continuo
    setLed(true, false, true);
    for (int i = 0; i < 5; i++) {
      beep(1400, 100);
      delay(50);
    }

  } else if (param == "rad") {
    // Branco — beep alternado
    setLed(true, true, true);
    beep(800, 200); delay(80); beep(1600, 200);

  } else if (param == "mag") {
    // Azul — beep curto
    setLed(false, false, true);
    beep(1200, 150);

  } else if (param == "prop") {
    // Laranja — LED vermelho + verde dim via LEDC + beep triplo
    digitalWrite(PIN_LED_R, HIGH);
    digitalWrite(PIN_LED_B, LOW);
    ledcWrite(PIN_LED_G, 60); // ~24% duty = laranja
    beep(700, 200); delay(80); beep(700, 200); delay(80); beep(700, 200);

  } else if (param == "accel") {
    // Ciano — beep crescente (aceleracao critica)
    setLed(false, true, true);
    beep(600, 100); delay(50);
    beep(900, 100); delay(50);
    beep(1200, 300);

  } else {
    // Parametro desconhecido — pisca branco
    setLed(true, true, true);
    beep(500, 500);
  }

  delay(3000);
  ledcWrite(PIN_LED_G, 255); // restaura verde cheio
  setLed(false, true, false);     // volta para verde (nominal)
}

float lerDistanciaCm() {
  float soma = 0; int validas = 0;
  for (int i = 0; i < 5; i++) {
    digitalWrite(PIN_TRIG, LOW); delayMicroseconds(2);
    digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);
    long dur = pulseIn(PIN_ECHO, HIGH, 30000);
    float dist = dur / 58.0;
    if (dur > 0 && dist >= 2 && dist <= 400) {
      soma += dist;
      validas++;
    }
    delay(10);
  }
  return validas == 0 ? -1 : soma / validas;
}

float lerHeading() {
  Wire.beginTransmission(HMC5883_ADDR);
  Wire.write(0x03);
  if (Wire.endTransmission(false) != 0) return -1;
  Wire.requestFrom(HMC5883_ADDR, 6, true);
  if (Wire.available() < 6) return -1;
  uint8_t xhi = Wire.read(); uint8_t xlo = Wire.read();
  Wire.read(); Wire.read();
  uint8_t yhi = Wire.read(); uint8_t ylo = Wire.read();
  int16_t magx = (int16_t)(xlo | ((int16_t)xhi << 8));
  int16_t magy = (int16_t)(ylo | ((int16_t)yhi << 8));
  float h = atan2(magy, magx) * 180.0 / PI;
  if (h < 0) h += 360.0;
  return h;
}

float lerRadiacao() {
  Wire.beginTransmission(RADIATION_ADDR);
  Wire.write(0x00);
  if (Wire.endTransmission(false) != 0) return -1;
  Wire.requestFrom(RADIATION_ADDR, 2, true);
  if (Wire.available() < 2) return -1;
  uint8_t hi = Wire.read(); uint8_t lo = Wire.read();
  return (int16_t)((hi << 8) | lo) / 100.0;
}

void conectaWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(SSID, PASSWORD);
  Serial.print("[WiFi] Conectando");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\n[WiFi] OK: " + WiFi.localIP().toString());
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.println("[CMD] " + msg);

  // Formato esperado: "dragon001@alerta|param"
  // Exemplos: "dragon001@alerta|temp", "dragon001@alerta|gas"
  if (msg.startsWith("dragon001@alerta|")) {
    String param = msg.substring(msg.indexOf("|") + 1);
    param.trim();
    acionarAlerta(param);
  }
}

void reconectaMQTT() {
  if (MQTT.connected()) return;
  Serial.print("[MQTT] Conectando...");
  if (MQTT.connect(ID_MQTT)) {
    Serial.println("OK");
    MQTT.subscribe(TOPIC_SUBSCRIBE);
    MQTT.publish(TOPIC_ATTRS, "s|on");
  } else {
    Serial.println("Falhou rc=" + String(MQTT.state()));
  }
}

void publicaTelemetria() {
  float temp  = bmp.readTemperature();
  float press = bmp.readPressure() / 100.0;

  sensors_event_t accel, gyro, tempMPU;
  mpu.getEvent(&accel, &gyro, &tempMPU);

  int   gasADC  = analogRead(PIN_MQ2_AO);

  float heading = lerHeading();
  if (headingRef < 0 && heading >= 0) {
    headingRef = heading;
    Serial.println("[MAG] Referencia: " + String(headingRef, 1));
  }
  float varMag   = -1;
  int   magFlag  = 0;
  if (heading >= 0 && headingRef >= 0) {
    varMag = abs(heading - headingRef);
    if (varMag > 180) varMag = 360 - varMag;
    magFlag = (varMag > 30.0) ? 1 : 0;
  }

  float rad  = lerRadiacao();
  float dist = lerDistanciaCm();
  float prop = (dist > 0)
               ? constrain(((TANK_HEIGHT_CM - dist) / TANK_HEIGHT_CM) * 100.0, 0, 100)
               : -1;

  Serial.println("-------------------------------");
  Serial.println("Temp     : " + String(temp, 1) + " C");
  Serial.println("Pressao  : " + String(press, 1) + " hPa");
  Serial.println("Gas      : " + String(gasADC));
  Serial.println("Heading  : " + String(heading, 1) + " var:" + String(varMag, 1));
  Serial.println("Radiacao : " + (rad < 0 ? String("[offline]") : String(rad, 2) + " mSv/h"));
  Serial.println("Prop     : " + String(prop, 0) + " %");
  Serial.println("Acel X   : " + String(accel.acceleration.x, 2));
  Serial.println("Acel Y   : " + String(accel.acceleration.y, 2));
  Serial.println("Acel Z   : " + String(accel.acceleration.z, 2));

  if (MQTT.connected()) {
    char buf[16];
    dtostrf(temp,                   4, 1, buf); MQTT.publish(TOPIC_TEMP,     buf);
    dtostrf(press,                  6, 1, buf); MQTT.publish(TOPIC_PRESS,    buf);
    itoa(gasADC,                        buf, 10); MQTT.publish(TOPIC_GAS,    buf);
    dtostrf(heading,                5, 1, buf); MQTT.publish(TOPIC_MAG,      buf);
    MQTT.publish(TOPIC_MAG_FLAG, magFlag ? "1" : "0");
    dtostrf(rad >= 0 ? rad : 0,     5, 2, buf); MQTT.publish(TOPIC_RAD,      buf);
    dtostrf(prop,                   5, 1, buf); MQTT.publish(TOPIC_PROP,     buf);
    dtostrf(accel.acceleration.x,   5, 2, buf); MQTT.publish(TOPIC_AX,       buf);
    dtostrf(accel.acceleration.y,   5, 2, buf); MQTT.publish(TOPIC_AY,       buf);
    dtostrf(accel.acceleration.z,   5, 2, buf); MQTT.publish(TOPIC_AZ,       buf);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("[Dragon] Iniciando...");

  pinMode(PIN_LED_R,  OUTPUT);
  pinMode(PIN_LED_G,  OUTPUT);
  pinMode(PIN_LED_B,  OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_MQ2_DO, INPUT);
  pinMode(PIN_TRIG,   OUTPUT);
  pinMode(PIN_ECHO,   INPUT);
  analogSetAttenuation(ADC_11db);

  // Configura LEDC para PWM no LED verde (efeito laranja no alerta de prop)
  ledcAttach(PIN_LED_G, LEDC_FREQ, LEDC_RES);
  ledcWrite(PIN_LED_G, 255); // inicia com verde cheio

  Wire.begin(21, 22);
  delay(100);
  bmp.begin();
  if (!mpu.begin()) Serial.println("[ERRO] MPU6050 nao encontrado!");

  setLed(false, false, true);
  beep(1000, 200);

  conectaWiFi();
  MQTT.setServer(BROKER_MQTT, BROKER_PORT);
  MQTT.setCallback(mqtt_callback);
  reconectaMQTT();

  delay(500);
  setLed(false, true, false);
  Serial.println("[Dragon] Pronto.");
}

void loop() {
  conectaWiFi();
  if (!MQTT.connected()) reconectaMQTT();
  MQTT.loop();
  publicaTelemetria();
  delay(5000);
}