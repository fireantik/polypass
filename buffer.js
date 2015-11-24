module.exports = require("protobufjs").newBuilder({})['import']({
    "package": null,
    "messages": [
        {
            "name": "BlockInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "id",
                    "id": 1
                },
                {
                    "rule": "required",
                    "type": "bytes",
                    "name": "iv",
                    "id": 2
                },
                {
                    "rule": "required",
                    "type": "bytes",
                    "name": "tag",
                    "id": 3
                },
                {
                    "rule": "required",
                    "type": "uint32",
                    "name": "length",
                    "id": 4
                }
            ]
        },
        {
            "name": "MainInfo",
            "fields": [
                {
                    "rule": "required",
                    "type": "bytes",
                    "name": "salt",
                    "id": 1
                },
                {
                    "rule": "repeated",
                    "type": "BlockInfo",
                    "name": "blocks",
                    "id": 2
                }
            ]
        }
    ]
}).build();