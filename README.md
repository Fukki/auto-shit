# nextgenShit
Auto use brooch and rootbeer sync with your main buff or main skill</br>
make you DPS Brust time better :D</br>
# Commands
- shit on   //enable this module
- shit off  //disable this module
- shit reload //reload shit config
- shit set brooch [item link]   //set brooch id *only that class
- shit set rootbeer [item link]   //set rootbeer id *only that class
</br>![image](https://user-images.githubusercontent.com/26898177/53790099-aafead80-3f58-11e9-8207-7b1c8788e9e5.png)

# Config.json
```
{
    "enabled": true,                #Enable and Disable this module
    "rootbeer": [                   #set your rootbeer id, this use for auto detect
        80081
    ],
    "list": {
        "0": {                      #job or class id
            "rootbeerinfo": 80081,  #set your rootbeer id *if 0 = auto detect
            "broochinfo": 0,        #set your brooch id *if 0 = auto detect
            "buffid": 100811,       #buff for active
            "active": "nextskill",  #active type instance = after buff pop, nextskill = after use next skill
            "brooch": "once",       #once = active 1 time only when buff/skill start and will skip to use if in cd
            "rootbeer": "inbuff"    #inbuff = will use in buff/skill when item cd finish
        },
}
```
# ISSUE
**sometimes system can't auto detect brooch</br>
you must set it by your self it easy to do</br>
with command "shit set brooch [item link]"**</br>
