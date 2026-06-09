#include "wokwi-api.h"
#include <stdio.h>
#include <stdlib.h>


// Radiation Sensor — Custom Chip para Wokwi
// Simula sensor de radiacao ionizante
// Endereco I2C: 0x48
// Retorna valor em mSv/h * 100 (ex: 150 = 1.50 mSv/h)
// Leitura: 2 bytes — byte alto + byte baixo (big-endian int16)
 
  
#define RAD_I2C_ADDRESS 0x48
 
typedef struct {
  uint32_t radiation_attr; // atributo do slider (0-1000 = 0.00-10.00 mSv/h)
  uint8_t  buffer_index;
} chip_state_t;
 
static bool    on_i2c_connect(void *user_data, uint32_t address, bool connect);
static uint8_t on_i2c_read(void *user_data);
static bool    on_i2c_write(void *user_data, uint8_t data);
static void    on_i2c_disconnect(void *user_data);
 
void chip_init() {
  chip_state_t *chip = malloc(sizeof(chip_state_t));
  chip->buffer_index = 0;
  chip->radiation_attr = attr_init("radiation", 50); // default 0.50 mSv/h
 
  const i2c_config_t i2c_config = {
    .user_data  = chip,
    .address    = RAD_I2C_ADDRESS,
    .scl        = pin_init("SCL", INPUT),
    .sda        = pin_init("SDA", INPUT),
    .connect    = on_i2c_connect,
    .read       = on_i2c_read,
    .write      = on_i2c_write,
    .disconnect = on_i2c_disconnect,
  };
  i2c_init(&i2c_config);
 
  printf("RadSensor chip iniciado! Endereco I2C: 0x48\n");
}
 
bool on_i2c_connect(void *user_data, uint32_t address, bool connect) {
  return true;
}
 
uint8_t on_i2c_read(void *user_data) {
  chip_state_t *chip = user_data;
  uint32_t raw = attr_read(chip->radiation_attr); // 0-1000
  int16_t value = (int16_t)(raw & 0xFFFF);
 
  uint8_t result;
  if (chip->buffer_index == 0) {
    result = (value >> 8) & 0xFF; // byte alto
  } else {
    result = value & 0xFF;        // byte baixo
  }
  chip->buffer_index = (chip->buffer_index + 1) % 2;
  return result;
}
 
bool on_i2c_write(void *user_data, uint8_t data) {
  chip_state_t *chip = user_data;
  chip->buffer_index = 0; // reset no write
  return true;
}
 
void on_i2c_disconnect(void *user_data) {
  // nada
}
 






