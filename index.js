
const BH1750 = require('bh1750')

module.exports = function (app) {
  let timer = null
  let plugin = {}

  plugin.id = 'signalk-raspberry-pi-bh1750'
  plugin.name = 'Raspberry-Pi BH1750'
  plugin.description = 'BH1750 light intensity sensor on Raspberry-Pi'

  plugin.schema = {
    type: 'object',
    properties: {
      rate: {
        title: "Sample Rate (in seconds)",
        type: 'number',
        default: 60
      },
      path: {
        type: 'string',
        title: 'SignalK Path',
        description: 'This is used to build the path in Signal K. It will be appended to \'environment\'',
        default: 'inside.salon'
      },
      i2c_bus: {
        type: 'integer',
        title: 'I2C bus number',
        default: 1,
      },
      i2c_address: {
        type: 'string',
        title: 'I2C address',
        default: '0x23',
      },
    }
  }

  plugin.start = function (options) {

    function createDeltaMessage (lightintensity) {
      var values = [
        {
          'path': 'environment.' + options.path + '.lightintensity',
          'value': lightintensity
        }
      ];

      return {
        'context': 'vessels.' + app.selfId,
        'updates': [
          {
            'source': {
              'label': plugin.id
            },
            'timestamp': (new Date()).toISOString(),
            'values': values
          }
        ]
      }
    }

    // The BH1750 constructor options are optional.
    //
    const bh1750options = {
      //i2cBusNo   : options.i2c_bus || 1, // defaults to 1
      device: '/dev/i2c-1',
      address : Number(options.i2c_address || '0x23'), // defaults to 0x77
      lenght:2,
      command: 0x10
    };

    // 0x00 - No active state
    // 0x01 - Wating for measurment command
    // 0x07 - Reset data register value - not accepted in POWER_DOWN mode
    // 0x10 - Start measurement at 1lx resolution. Measurement time is approx 120ms.
    // 0x11 - Start measurement at 0.5lx resolution. Measurement time is approx 120ms.
    // 0x13 - Start measurement at 4lx resolution. Measurement time is approx 16ms.
    // 0x20 - Start measurement at 1lx resolution. Measurement time is approx 120ms. Device is automatically set to Power Down after measurement.
    // 0x21 - Start measurement at 0.5lx resolution. Measurement time is approx 120ms. Device is automatically set to Power Down after measurement.
    // 0x23 - Start measurement at 1lx resolution. Measurement time is approx 120ms. Device is automatically set to Power Down after measurement.
 

    const bh1750 = new BH1750(bh1750options);

    // Read BH1750 sensor data
    function readSensorData() {
  	  bh1750.readSensorData()
          .then((data) => {
        // light intensity is returned.
        lightintensity = data.lightintensity;

        console.log(`data = ${JSON.stringify(data, null, 2)}`);

        // create message
        var delta = createDeltaMessage(lightintensity)

        // send temperature
        app.handleMessage(plugin.id, delta)

      })
      .catch((err) => {
        console.log(`BH1750 read error: ${err}`);
      });
    }

    bh1750.init()
        .then(() => {
      console.log('BH1750 initialization succeeded');
      readSensorData();
    })
    .catch((err) => console.error(`BH1750 initialization failed: ${err} `));

    timer = setInterval(readSensorData, options.rate * 1000);
  }

  plugin.stop = function () {
    if(timer){
      clearInterval(timer);
      timeout = null;
    }
  }

  return plugin
}
