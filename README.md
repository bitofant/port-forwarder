# port-forwarder
Forwards incoming http requests to a specified port; forward.domain.com/8081/request => port 8081

To customize your project add a config file like this and name it `config.json`:
```JSON
{
  "$schema": "config-schema.json",
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