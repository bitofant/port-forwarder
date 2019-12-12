# port-forwarder
> ** this project has ben superseded by [bitofant/tunneler](https://github.com/bitofant/tunneler) **

Forwards incoming http requests to a specified port; forward.domain.com/8081/request => port 8081

To customize your project add a config file like follows and name it `config.json`. If you link the schema file (as in the example below) you even get auto completion and descriptions for the config.
```JSON
{
  "$schema": "https://raw.githubusercontent.com/bitofant/port-forwarder/master/config-schema.json",
  "port": 8080,
  "allowedPorts": [
    3000,
    3500,
    {
      "from": 8080,
      "to": 8085
    }
  ]
}
```
