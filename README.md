# nextgenShit
Auto use brooch and rootbeer when main skill or buff pop
# Commands
- shit on   //enable this module
- shit off  //disable this module
- shit reload //reload shit config
- shit set brooch [item link]   //set brooch id *only that class
- shit set rootbeer [item link]   //set rootbeer id *only that class

# Config.json
```
{
    "enabled": true,                #Enable and Disable this module
    "rootbeer": [                   #set your rootbeer id
        80081
    ],
    "list": {
        "0": {                      #job or class id
            "rootbeerinfo": 80081,  #set your rootbeer id *if = 0 is auto detect
            "broochinfo": 0,        #set your brooch id *if = 0 is auto detect
            "buffid": 100811,       #buff for active
            "active": "nextskill",  #active type instance = after buff pop, nextskill = after use next skill
            "brooch": "once",       #once = active only 1 time when buff pop
            "rootbeer": "inbuff"    #inbuff = will used in buff when item cd finish
        },
}
```
**for brooch it will auto detect by system**</br>
**sometimes auto detect has problem**</br>
**just put item id by your self**</br>
**you can find item id from: https://teralore.com**</br>
