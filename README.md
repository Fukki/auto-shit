# nextgenShit
Auto use brooch and rootbeer when main skill or buff pop

# Config.json
```
{
    "enabled": true,                #Enable and Disable this module
    "rootbeer": [                   #set your rootbeer id
        80081
    ],
    "list": {
        "0": {                      #job or class id
            "buffid": 100811,       #buff for active
            "active": "nextskill",  #active type instance = after buff pop, nextskill = after use next skill
            "brooch": "once",       #once = active only 1 time when buff pop
            "rootbeer": "inbuff"    #inbuff = will used in buff when item cd finish
        },
}
```
**for brooch it will auto detect by system**</br>
**now only problem in slayer, archer, gunner**</br>
