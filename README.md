# signalk-raspberry-pi-bh1750
BH1750 light intensity sensor information for SignalK. This plugin can be downloaded via the SignalK application.

## Getting Started
You will need a raspberry pi with SignalK installed along with a BH1750 sensor.

### The BH1750 sensor
Personally I am using the sensor found at the following link on Amazon. However there are many manufacturers to pick from.

Learn more: https://www.amazon.com/HiLetgo-GY-302-BH1750-Intensity-Illumination/dp/B00M0F29OS/

### Connecting the Sensor
All you need are pins 1 (3.3V Power), 3 (I2C1 SDA), 5 (I2C1 SCL) and 9 (GND). You need to connect these pins to VIN, SDA, SCL and GND pins of the BME module respectively. You need to make sure Raspberry Pi is turned off while doing this!

In order to use the sensor, the i2c bus must be enabled on your rasbperry pi. This can be accomplished using
sudo raspi-config.

## Troubleshooting
When you first start SK, you should see one of two things in the /var/log/syslog; BH1750 initialization succeeded or BH1750 initialization failed along with details of the failure.

If the sensor isn't found you can run `ls /dev/*i2c*` which should return `/dev/i2c-1`. If it doesnt return then make sure that the i2c bus is enabled using raspi-config.

You can also download the i2c-tools by running `sudo apt-get install -y i2c-tools`. Once those are installed you can run `i2cdetect -y 1`. You should see the BH1750 detected as address 0x23 or 0x5c.

If the sensor isn't detcted then go back and check the sensor wiring.

## Authors
* **Jeremy Carter** - *Author of this plugin*
