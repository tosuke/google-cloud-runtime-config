# google-cloud-runtime-config
runtime configuration for google cloud platform

## Installation
```shell
npm install --save google-cloud-runtime-config
```


## Usage
```javascript
const runtimeConfig = require('google-cloud-runtime-config')({
  projectId: '{{your project id}}'
})

exports.entry = (req, res) => {
  return runtimeConfig.getConfig('{{your runtime configuration name}}')
    .then(config => {
      // write your own function!
    })
}
```

## License
[The MIT License (MIT)](/LICENSE)