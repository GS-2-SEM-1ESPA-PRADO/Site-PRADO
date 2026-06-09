// Based on https://wokwi.com/projects/344061754973618771

#include "wokwi-api.h"
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <math.h>

#define BUFFER_SIZE 6
uint8_t buffer[BUFFER_SIZE];

#define HMC5883_ADDRESS_MAG (0x3C >> 1) // 0011110x  (Standard address for magnetometers)
const int ADDRESS = HMC5883_ADDRESS_MAG;


typedef struct {
  pin_t pin_int;
  uint32_t altitude; // 0 to 360
  uint32_t azimuth; // 0 to 360
} chip_state_t;

static bool on_i2c_connect(void *user_data, uint32_t address, bool connect);
static uint8_t on_i2c_read(void *user_data);
static bool on_i2c_write(void *user_data, uint8_t data);
static void on_i2c_disconnect(void *user_data);

void chip_init() {
  chip_state_t *chip = malloc(sizeof(chip_state_t));
  chip->pin_int = pin_init("INT", INPUT);
  chip->altitude = 45; // debug
  chip->azimuth = 45; // debug

  const i2c_config_t i2c_config = {
    .user_data = chip,
    .address = ADDRESS,
    .scl = pin_init("SCL", INPUT),
    .sda = pin_init("SDA", INPUT),
    .connect = on_i2c_connect,
    .read = on_i2c_read,
    .write = on_i2c_write,
    .disconnect = on_i2c_disconnect, // Optional
  };
  i2c_init(&i2c_config);

  // This attribute can be edited by the user. It's defined in wokwi-custom-part.json:
  //chip->threshold_attr = attr_init("threshold", 127);
  chip->altitude =attr_init("azimuth", 30);
 chip->azimuth =attr_init("altitude", 40);
  //uint32_t attr_init(const char *name, uint32_t default_value)

  // The following message will appear in the browser's DevTools console:
  printf("Compass chip configured!\n");
}


bool on_i2c_connect(void *user_data, uint32_t address, bool connect) {
// printf("Address: %u, Connect: %s\n", address, connect ? "true" : "false");  
  return true; /* Ack */
}

///////////////


uint8_t on_i2c_read(void *user_data) {

    static int buffer_index = 0; // Variabile statica per tenere traccia dell'indice dell'array BUFFER

    chip_state_t *chip = user_data;
    const uint32_t altitude = attr_read(chip->altitude);
    const uint32_t azimuth = attr_read(chip->azimuth);
    uint8_t result;

    // Converti l'altezza e l'azimuth in radianti
    double rad_altitude = altitude * M_PI / 180.0; // Altezza
    double rad_azimuth = azimuth * M_PI / 180.0;   // Azimuth

    // Calcola le componenti X e Y del vettore basate sull'altezza e l'azimuth
    double x = cos(rad_azimuth) * cos(rad_altitude); // Componente X
    double y = sin(rad_azimuth) * cos(rad_altitude); // Componente Y
    double z = sin(rad_altitude);                    // Componente Z
    

    // Scala le componenti per adattarle al formato appropriato (ad esempio, converti in int16_t)
    int16_t scaled_x = (int8_t)(x * INT8_MAX);
    int16_t scaled_y = (int8_t)(y * INT8_MAX);
    int16_t scaled_z = (int8_t)(z * INT8_MAX);
    

    uint8_t buffer[BUFFER_SIZE];
    buffer[0] = (scaled_x >> 8) & 0xFF; // Byte più significativo di X
    buffer[1] = scaled_x & 0xFF;        // Byte meno significativo di X
    buffer[2] = (scaled_z >> 8) & 0xFF; // Byte più significativo di Z
    buffer[3] = scaled_z & 0xFF;        // Byte meno significativo di Z
    buffer[4] = (scaled_y >> 8) & 0xFF; // Byte più significativo di Y
    buffer[5] = scaled_y & 0xFF;        // Byte meno significativo di Y

    // Restituisci l'elemento corretto dell'array BUFFER e aggiorna l'indice
    result = buffer[buffer_index];
    buffer_index = (buffer_index + 1) % BUFFER_SIZE; // Incrementa l'indice e gestisci il wrap-around
    return result;
  }




//////////////

bool on_i2c_write(void *user_data, uint8_t data) {
    chip_state_t *chip = user_data;
 // printf("Received: %d\n", data);
  return true; // Ack //// DEBUG
}

void on_i2c_disconnect(void *user_data) {
  // Do nothing
}

/*
https://github.com/adafruit/Adafruit_HMC5883_Unified/blob/master/Adafruit_HMC5883_U.cpp

Chip must respond to this request:

void Adafruit_HMC5883_Unified::read() {
  // Read the magnetometer
  Wire.beginTransmission((byte)HMC5883_ADDRESS_MAG);
  // #define HMC5883_ADDRESS_MAG (0x3C >> 1) // 0011110x  (Standard address for magnetometers)
  Wire.write(HMC5883_REGISTER_MAG_OUT_X_H_M);
  // HMC5883_REGISTER_MAG_OUT_X_H_M = 0x03
  Wire.endTransmission(false);
  Wire.requestFrom((byte)HMC5883_ADDRESS_MAG, (byte)6, true);

// Note high before low (different than accel)
  uint8_t xhi = Wire.read();
  uint8_t xlo = Wire.read();
  uint8_t zhi = Wire.read();
  uint8_t zlo = Wire.read();
  uint8_t yhi = Wire.read();
  uint8_t ylo = Wire.read();


  // Shift values to create properly formed integer (low byte first)
  _magData.x = (int16_t)(xlo | ((int16_t)xhi << 8));
  _magData.y = (int16_t)(ylo | ((int16_t)yhi << 8));
  _magData.z = (int16_t)(zlo | ((int16_t)zhi << 8));

  // ToDo: Calculate orientation
  _magData.orientation = 0.0;
}
*/