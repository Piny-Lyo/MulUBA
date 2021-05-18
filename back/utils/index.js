class utils {
     // user_profile表列名转前端列名
     static userProfileColToFE(key) {
        const userProfileColFEColDic = {
            'gender_code': 'sex',
            'age_level': 'age',
            'pvalue_level': 'pvalue',
            'shopping_level': 'shopping',
            'occupation_code': 'student',
            'city_level': 'city'
        };
        return userProfileColFEColDic.hasOwnProperty(key) ?  userProfileColFEColDic[key] : key;
    }

    // 将数据库中的性别0，1转换为性别男，女
    static dbProfileToFE(key, value) {
        const userProfileDic = {
            'gender_code': {
                '1': 'Male',
                '2': 'Female'
            },
            'age_level': {
                '0': '0-9',
                '1': '10-19',
                '2': '20-29',
                '3': '30-39',
                '4': '40-49',
                '5': '50-59',
                '6': '60-69'
            },
            'pvalue_level': {
                '1': 'Level 1',
                '2': 'Level 2',
                '3': 'Level 3'
            },
            'shopping_level': {
                '1': 'Level 1', 
                '2': 'Level 2', 
                '3': 'Level 3'
            },
            'occupation_code': {
                '0': 'No', 
                '1': 'Yes'
            },
            'city_level': {
                '1': 'Level 1', 
                '2': 'Level 2', 
                '3': 'Level 3',
                '4': 'Level 4'
            },
        };
        return userProfileDic[key][String(value)];
    }

    /**
     * 数据库表time_stamp转前端time
     * @param {*} timeStamp 
     */
    static dbTimeStampToFETime(timeStamp) {
        return Number(timeStamp + '000');
    }

    /**
     * 前端time转数据库表time_stamp
     * @param {*} time 
     */
    static feTimeToDBTimeStamp(time) {
        let timeStr = time.toString();
        return timeStr.substring(0, timeStr.length-3);
    }

    /**
     * 获取一天的起始时间
     * @param {*} time 
     */
    static getStartTime(time) {
        return new Date(Number(time)).setHours(0, 0, 0, 0);
    }

    /**
     * 获取一天的结束时间
     * @param {*} time 
     */
    static getEndTime(time) {
        return new Date(Number(time)).setHours(23, 59, 59, 59);
    }

    /**
     * 获取一小时的起始时间
     * @param {*} time 
     */
    static getStartTimeOfHour(time) {
        return new Date(Number(time)).setMinutes(0, 0, 0);
    }

    /**
     * 获取一小时的结束时间
     * @param {*} time 
     */
    static getEndTimeOfHour(time) {
        return new Date(Number(time)).setMinutes(59, 59, 59);
    }
    
    /**
     * 升序比较函数
     * @param {Number} a 
     * @param {Number} b 
     */
    static ascending(a, b) {
        return a - b;
    }
}

module.exports = utils;