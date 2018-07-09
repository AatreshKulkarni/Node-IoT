var config = {}

config.endpoint = "https://syscmdbsql.documents.azure.com:443/";
config.primaryKey = "rv8PyhrTXnCT8oEt2EyPZCISLaKJiwIBS4gpOr9MjC9wHjiFJyWutUObjiGGaked9HQ7WIuk104Ov29Fd2j5ig==";

config.database = {
    "id": "TemperatureDB"
};

config.collection = {
    "id": "TeperatureColl"
};

config.documents = {
    "Device1": {
        "id": "device.1",
        "Temperature": 30,
        "Humidity": 77
    },
    "Device2": {
        id: "device.2",
        "Temperature": 35,
        "Humidity": 75
    }
};

module.exports = config;