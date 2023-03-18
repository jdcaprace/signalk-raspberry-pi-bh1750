
const BH1750 = require('bh1750-sensor')

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
      i2cBusNo   : options.i2c_bus || 1, // defaults to 1
      i2cAddress : Number(options.i2c_address || '0x23'), // defaults to 0x23
      readMode: BH1750.ONETIME_H_RESOLUTION_MODE
    };  

    const bh1750 = new BH1750(bh1750options);

    // Read BH1750 sensor data
    function readSensorData() {
  	  let data = bh1750.readData();
      console.log(data);
        // light intensity is returned.
        lightintensity = data;

        console.log(`data = ${JSON.stringify(data, null, 2)}`);

        // create message
        var delta = createDeltaMessage(lightintensity)

        // send light intensity
        app.handleMessage(plugin.id, delta)
    }

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
