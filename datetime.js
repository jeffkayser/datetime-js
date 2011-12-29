// http://corneliusweiss.de/2008/10/14/dealing-with-time-zones-in-javascript/
// http://www.timeanddate.com/library/abbreviations/timezones/
// TODO: convert to UTC internally
// TODO: Reorder function defs logically
// TODO: add testing framework
// TODO: make modular version (break out related functions to different, optional files)
// TODO: add locale-aware toString() formatters (as modular addons)
// TODO: Inconsistent API: week() and dayOfYear() are protected from over-/underflow but other methods allow it and handle gracefull
function Datetime() {
    this.date = null;
    this.timezone = null;
    this.locale = 'en-US';
    var year = 1970;
    var month = 0;
    var day = 1;
    var hour = 0;
    var minute = 0;
    var second = 0;
    var millisecond = 0;
    this.holidays = [];
    switch(arguments.length) {
        case 7:
            millisecond = parseInt(arguments[6]);
        case 6:
            second = parseInt(arguments[5]);
        case 5:
            minute = parseInt(arguments[4]);
        case 4:
            hour = parseInt(arguments[3]);
        case 3:
            day = parseInt(arguments[2]);
        case 2:
            month = parseInt(arguments[1]);
        case 1:
            if(arguments.length == 1) {
                if(arguments[0] instanceof Datetime) {
                    this.date = new Date(arguments[0].date);
                } else if(arguments[0] instanceof Date) {
                    this.date = new Date(arguments[0]);
                } else {
                    switch(typeof arguments[0]) {
                        case 'string':
                        case 'number':
                            this.date = new Date(arguments[0]);
                            break;
                        default:
                            break;
                    }
                }
            } else {
                year = parseInt(arguments[0]);
            }
            break;
        case 0:
            this.date = new Date();
            break;
        default:
            break;
    }
    if(this.date == null) {
        this.date = new Date(year, month - 1, day, hour, minute, second, millisecond);
        var s = this.date.toString();
        this.timezone = s.substring(s.lastIndexOf('(') + 1, s.lastIndexOf(')'));
    }
}

Datetime.now = function() {
    return new Datetime();
}

Datetime.Month = {'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12};
Datetime.Day = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6};

Datetime.MonthName = {
    'en-US': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    'ja-JP': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
Datetime.DayName = {
    'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'ja-JP': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
    };
Datetime.MonthNameShort = {
    'en-US': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'ja-JP': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    };
Datetime.DayNameShort = {
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'ja-JP': ['日', '月', '火', '水', '木', '金', '土']
    };
Datetime.AmPm = {
    'en-US': ['AM', 'PM'],
    'ja-JP': ['午前', '午後']
    };
Datetime.AmPmShort = {
    'en-US': ['A', 'P'],
    'ja-JP': ['㏂', '㏘']
    };

Datetime.prototype.year = function(value) {
    if(value == undefined) {
        return this.date.getFullYear();
    } else {
        this.date.setFullYear(parseInt(value));
        return this;
    }
}

Datetime.prototype.Uyear = function(value) {
    if(value == undefined) {
        return this.date.getUTCFullYear();
    } else {
        this.date.setUTCFullYear(parseInt(value));
        return this;
    }
}

Datetime.prototype.month = function(value) {
    if(value == undefined) {
        return this.date.getMonth() + 1;
    } else {
        this.date.setMonth(parseInt(value) - 1);
        return this;
    }
}

Datetime.prototype.Umonth = function(value) {
    if(value == undefined) {
        return this.date.getUTCMonth() + 1;
    } else {
        this.date.setUTCMonth(parseInt(value) - 1);
        return this;
    }
}

// TODO: Examine/incorporate merits of alternative implementation
// http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
Datetime.prototype.week = function(value) {
    if(value == undefined) {
        var day = this.weekday();
        if(day == Datetime.Day.Sunday) {
            // Change Sunday..Saturday as 0..6 to Monday..Sunday as 1..7
            day = 7;
        }
        var nearestThursday = new Datetime(this).addDays(Datetime.Day.Thursday - day).hour(0).minute(0).second(0);
        var firstDay = new Datetime(nearestThursday.year(), 1, 1);
        return Math.floor(1 + nearestThursday.daysSince(firstDay) / 7);
    } else {
        // Limit specified week to between 1..# of weeks in the year
        value = Math.min(Math.max(1, parseInt(value)), this.weeksInYear());
        return this.addWeeks(value - this.week());
    }
}

Datetime.prototype.day = function(value) {
    if(value == undefined) {
        return this.date.getDate();
    } else {
        this.date.setDate(parseInt(value));
        return this;
    }
}

Datetime.prototype.Uday = function(value) {
    if(value == undefined) {
        return this.date.getUTCDate();
    } else {
        this.date.setUTCDate(parseInt(value));
        return this;
    }
}

Datetime.prototype.dayOfYear = function(value) {
    if(value == undefined) {
        var days = this.day();
        for(var month = Datetime.Month.January; month < this.month(); month++) {
            days += Datetime.daysInMonth(month, this.year());
        }
        return days;
    } else {
        // Limit specified day of year to between 1..# of days in the year
        value = Math.min(Math.max(1, parseInt(value)), this.daysInYear());
        return this.addDays(value - this.dayOfYear());
    }
}

Datetime.prototype.hour = function(value) {
    if(value == undefined) {
        return this.date.getHours();
    } else {
        this.date.setHours(parseInt(value));
        return this;
    }
}

Datetime.prototype.minute = function(value) {
    if(value == undefined) {
        return this.date.getMinutes();
    } else {
        this.date.setMinutes(parseInt(value));
        return this;
    }
}

Datetime.prototype.second = function(value) {
    if(value == undefined) {
        return this.date.getSeconds();
    } else {
        this.date.setSeconds(parseInt(value));
        return this;
    }
}

Datetime.prototype.Uhour = function(value) {
    if(value == undefined) {
        return this.date.getUTCHours();
    } else {
        this.date.setUTCHours(parseInt(value));
        return this;
    }
}

Datetime.prototype.Uminute = function(value) {
    if(value == undefined) {
        return this.date.getUTCMinutes();
    } else {
        this.date.setUTCMinutes(parseInt(value));
        return this;
    }
}

Datetime.prototype.Usecond = function(value) {
    if(value == undefined) {
        return this.date.getUTCSeconds();
    } else {
        this.date.setUTCSeconds(parseInt(value));
        return this;
    }
}

Datetime.prototype.millisecond = function(value) {
    if(value == undefined) {
        return this.date.getMilliseconds();
    } else {
        this.date.setMilliseconds(parseInt(value));
        return this;
    }
}

Datetime.prototype.Umillisecond = function(value) {
    if(value == undefined) {
        return this.date.getUTCMilliseconds();
    } else {
        this.date.setUTCMilliseconds(parseInt(value));
        return this;
    }
}

Datetime.prototype.milliseconds_from_epoch = function(value) {
    if(value == undefined) {
        return this.date.getTime();
    } else {
        this.date.setTime(parseInt(value));
        return this;
    }
}

Datetime.prototype.seconds_from_epoch = function(value) {
    if(value == undefined) {
        return this.milliseconds_from_epoch() / 1000;
    } else {
        this.milliseconds_from_epoch(value * 1000);
        return this;
    }
}

Datetime.prototype.weekday = function() {
    return this.date.getDay();
}

// TODO: Implement
Datetime.prototype.timezone = function(value) {
    if(value == undefined) {
        return this.timezone;
    } else {
        console.log("Datetime.timezone(value) not yet implemented");
        return this;
    }
}

Datetime.prototype.timezoneOffset = function(value) {
    if(value == undefined) {
        return this.date.getTimezoneOffset();
    } else {
        console.log("Datetime.timezoneOffset(value) not yet implemented");
        return this;
    }
}

Datetime.prototype.midnight = function() {
    return new Datetime(this).hour(0).minute(0).second(0).millisecond(0);
}

Datetime.prototype.lastMinute = function() {
    return new Datetime(this).hour(23).minute(59).second(59).millisecond(999);
}

Datetime.prototype.addYears = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.year(this.year() + parseInt(value || 1));
    }
}

Datetime.prototype.addMonths = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.month(this.month() + parseInt(value || 1));
    }
}

Datetime.prototype.addWeeks = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.day(this.day() + 7 * parseInt(value || 1));
    }
}

Datetime.prototype.addDays = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.day(this.day() + parseInt(value || 1));
    }
}

Datetime.prototype.addBusinessDays = function(value) {
    if(value == 0) {
        return this;
    } else {
        if(value == undefined) {
            value = 1;
        } else {
            value = parseInt(value);
        }
        var sign = value < 0 ? -1 : 1;
        value = Math.abs(value);
        if(this.isHoliday()) {
            do {
                //this.day(this.day() + sign * 1);
                this.addDays(1 * sign);
            } while(this.isHoliday());
            value -= 1;
        }
        if(value >= 5) {
            var fullWeeks = Math.floor(value / 5);
            this.addDays(fullWeeks * 7 * sign);
            value -= fullWeeks * 5;
        }
        //remainder
        while(value > 0) {
            this.addDays(1 * sign);
            value -= 1;
        }
        while(this.isHoliday()) {
            this.addDays(1 * sign);
        }
        return this;
    }
}

Datetime.prototype.addHours = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.hour(this.hour() + parseInt(value || 1));
    }
}

Datetime.prototype.addMinutes = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.minute(this.minute() + parseInt(value || 1));
    }
}

Datetime.prototype.addSeconds = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.second(this.second() + parseInt(value || 1));
    }
}

Datetime.prototype.addMilliseconds = function(value) {
    if(value == 0) {
        return this;
    } else {
        return this.millisecond(this.millisecond() + parseInt(value || 1));
    }
}

Datetime.prototype.dayBeforeYesterday = function() {
    return new Datetime(this).addDays(-2);
}

Datetime.prototype.yesterday = function() {
    return new Datetime(this).addDays(-1);
}

Datetime.prototype.today = function() {
    return new Datetime(this);
}

Datetime.prototype.tomorrow = function() {
    return new Datetime(this).addDays(1);
}

Datetime.prototype.dayAfterTomorrow = function() {
    return new Datetime(this).addDays(2);
}

Datetime.prototype.lastYear = function() {
    return new Datetime(this).addYears(-1);
}

Datetime.prototype.nextYear = function() {
    return new Datetime(this).addYears(1);
}

Datetime.prototype.lastMonth = function() {
    return new Datetime(this).addMonths(-1);
}

Datetime.prototype.nextMonth = function() {
    return new Datetime(this).addMonths(1);
}

Datetime.prototype.lastWeek = function() {
    return new Datetime(this).addDays(-7);
}

Datetime.prototype.nextWeek = function() {
    return new Datetime(this).addDays(7);
}

Datetime.prototype.previousBusinessDay = function() {
    return new Datetime(this).addBusinessDays(-1);
}

Datetime.prototype.nextBusinessDay = function() {
    return new Datetime(this).addBusinessDays(1);
}

Datetime.isLeapYear = function(value) {
    var year = value;
    return (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
}

Datetime.prototype.isLeapYear = function() {
    Datetime.isLeapYear(this.year());
}


Datetime.prototype.isWeekend = function() {
    return this.weekday() == Datetime.Day.Sunday || this.weekday() == Datetime.Day.Saturday;
}

Datetime.prototype.isWeekday = function() {
    return !this.isWeekend();
}

Datetime.prototype.isHoliday = function() {
    return this.isWeekend() || this.date in this.holidays;
}

Datetime.prototype.isBusinessDay = function() {
    return !this.isHoliday();
}

Datetime.prototype.isValid = function() {
    return !isNaN(this.date.getTime());
}

Datetime.daysInMonth = function(month, year) {
    if(year == undefined) {
        if(month == undefined) {
            month = new Datetime().month();
        }
        year = new Datetime().year();
    }
    if(month == Datetime.Month.February) {
        if(Datetime.isLeapYear(year)) {
            return 29;
        } else {
            return 28;
        }
    } else {
        switch(month) {
            case Datetime.Month.January:
            case Datetime.Month.March:
            case Datetime.Month.May:
            case Datetime.Month.July:
            case Datetime.Month.August:
            case Datetime.Month.October:
            case Datetime.Month.December:
                return 31;
                break;
            case Datetime.Month.April:
            case Datetime.Month.June:
            case Datetime.Month.September:
            case Datetime.Month.November:
                return 30;
                break;
            default:
                break;
        }
    }
    return null;
}

Datetime.prototype.daysInMonth = function(month, year) {
    return Datetime.daysInMonth(this.month(), this.year());
}

Datetime.daysInYear = function(year) {
    if(year == undefined) {
        year = new Datetime().year();
    }
    if(Datetime.isLeapYear(year)) {
        return 366;
    } else {
        return 365;
    }
}

Datetime.prototype.daysInYear = function() {
    return Datetime.daysInYear(this.year());
}

Datetime.weeksInYear = function(year) {
    if(year == undefined) {
        year = new Datetime().year();
    }
    var lastDay = new Datetime(year, 12, 31);
    if(lastDay.weekday() <= Datetime.Day.Wednesday) {
        lastDay.addDays(-lastDay.weekday());
    }
    return lastDay.week();
}

Datetime.prototype.weeksInYear = function() {
    return Datetime.weeksInYear(this.year());
}

Datetime.prototype.addHoliday = function(value) {
    if(value != undefined) {
        var holiday = new Datetime(value);
        if(holiday.isValid() && this.holidays.indexOf(holiday) == -1) {
            this.holidays.push(holiday);
        }
    }
    return this;
}

Datetime.prototype.removeHoliday = function(value) {
    if(value != undefined) {
        var holiday = new Datetime(value);
        if(holiday.isValid()) {
            var index = this.holidays.indexOf(holiday);
            if(index >= 0) {
                this.holidays.splice(index, 1);
            }
        }
    }
    return this;
}

Datetime.millisecondsBetween = function(first, second) {
    if(second == undefined) {
        if(first == undefined) {
            return null;
        } else {
            second = new Datetime();
        }
    }
    return second.date - first.date;
}

Datetime.prototype.millisecondsSince = function(value) {
    return Datetime.millisecondsBetween(value, this);
}

Datetime.secondsBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 1000;
}

Datetime.prototype.secondsSince = function(value) {
    return Datetime.secondsBetween(value, this);
}

Datetime.minutesBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 60000;
}

Datetime.prototype.minutesSince = function(value) {
    return Datetime.minutesBetween(value, this);
}

Datetime.hoursBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 3600000;
}

Datetime.prototype.hoursSince = function(value) {
    return Datetime.hoursBetween(value, this);
}

Datetime.daysBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 86400000;
}

Datetime.prototype.daysSince = function(value) {
    return Datetime.daysBetween(value, this);
}

// TODO: Implement
Datetime.businessDaysBetween = function(first, second, holidays) {
    if(second == undefined) {
        if(first == undefined) {
            return null;
        } else {
            second = new Datetime();
        }
    }
    first = first.midnight();
    second = second.midnight();
    if(first > second) {
        var temp = new Datetime(second);
        second = new Datetime(first);
        first = temp;
    }
    //console.log(first.date + ',' + second.date);
    var weeksBetween = Math.floor(Datetime.weeksBetween(first, second));
    var dayRemainder = Datetime.daysBetween(first, second) - weeksBetween * 7;
    var sign = dayRemainder < 0 ? -1 : 1;
    dayRemainder = Math.floor(Math.abs(dayRemainder));
    dayRemainder -= sign;
    console.log('wk: ' + weeksBetween + ' dayrem: ' + dayRemainder + ' sign: ' + sign);
    var businessDays = weeksBetween * 5;
    var temp = new Datetime(second).addWeeks(-weeksBetween);
    console.log(temp.date);
    temp.holidays = holidays;
    while(dayRemainder != 0) {
        console.log('dayrem: ' + dayRemainder + ' date: ' + temp.date + ' weekday?: ' + temp.isWeekday() + ' biz: ' + businessDays);
        if(temp.isWeekday()) {
            businessDays += sign;
        }
        temp.addDays(sign); 
        --dayRemainder;
    }
    for(idx in holidays) {
        if(this.isBetweenDays(first, second, holidays[idx]) && holidays[idx].isWeekday) {
            --businessDays;
        }
    }
    return businessDays;
}

Datetime.prototype.businessDaysSince = function(value) {
    return Datetime.businessDaysBetween(value, this);
}

Datetime.weeksBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 604800000;
}

Datetime.prototype.weeksSince = function(value) {
    return Datetime.weeksBetween(value, this);
}

// TODO: Make more accurate
Datetime.monthsBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 2592000000;
}

Datetime.prototype.monthsSince = function(value) {
    return Datetime.monthsBetween(value, this);
}

// TODO: Make more accurate
Datetime.yearsBetween = function(first, second) {
    return Datetime.millisecondsBetween(first, second) / 3155695200;
}

Datetime.prototype.yearsSince = function(value) {
    return Datetime.yearsBetween(value, this);
}

var padLeft = function(value, length, character) {
    if(typeof value != 'string') {
        value = new String(value);
    }
    if(character == undefined) {
        character = ' ';
    }
    while(value.length < length) {
        value = character + value;
    }
    return value;
}

var padRight = function(value, length, character) {
    if(typeof value != 'string') {
        value = new String(value);
    }
    if(character == undefined) {
        character = ' ';
    }
    while(value.length < length) {
        value += character;
    }
    return value;
}

// NOTE: Use nulls '\0' between specifiers to allow strings such as "YYYYMMDD" (i.e., specify as "YYYY\0MM\0DD") to yield 20120131 for January 31, 2012
// Nulls will be automatically stripped from the result, unless specified otherwise
var formatter = function(date, format, locale, preserveNull) {
    if(date == undefined || format == null) {
        return '';
    }
    if(locale == undefined) {
        locale = 'en-US';
    }
    if(preserveNull == undefined) {
        preserveNull = false;
    }
    var formatted = '';
    var segments = format.split(/(\W)/);
    for(idx in segments) {
        switch(segments[idx]) {
            case 'yyyy':
                formatted += date.getFullYear();
                break;
            case 'yy':
                formatted += date.getYear() % 100;
                break;
            case 'MMMM':
                formatted += Datetime.MonthName[locale][date.getMonth()];
                break;
            case 'MMM':
                formatted += Datetime.MonthNameShort[locale][date.getMonth()];
                break;
            case 'MM':
                formatted += padLeft(date.getMonth() + 1, 2, '0');
                break;
            case 'M':
                formatted += date.getMonth() + 1;
                break;
            case 'dddd':
                formatted += Datetime.DayName[locale][date.getDay()];
                break;
            case 'ddd':
                formatted += Datetime.DayNameShort[locale][date.getDay()];
                break;
            case 'dd':
                formatted += padLeft(date.getDate(), 2, '0');
                break;
            case 'd':
                formatted += date.getDate();
                break;
            case 'HH':
                formatted += padLeft(date.getHours(), 2, '0');
                break;
            case 'H':
                formatted += date.getHours();
                break;
            case 'hh':
                formatted += padLeft(date.getHours() % 12, 2, '0');
                break;
            case 'h':
                formatted += date.getHours() % 12;
                break;
            case 'mm':
                formatted += padLeft(date.getMinutes(), 2, '0');
                break;
            case 'm':
                formatted += date.getMinutes();
                break;
            case 'ss':
                formatted += padLeft(date.getSeconds(), 2, '0');
                break;
            case 's':
                formatted += date.getSeconds();
                break;
            case 'tt':
                formatted += Datetime.AmPm[locale][date.getHours() < 12 ? 0 : 1];
                break;
            case 't':
                formatted += Datetime.AmPmShort[locale][date.getHours() < 12 ? 0 : 1];
                break;
            case 'ddS':
                if(date.getDate() < 10) {
                    formatted += '0';
                }
            case 'dS':
                formatted += date.getDate();
            case 'S':
                //switch(this.locale) {
                //    case 'en-US':
                switch(date.getDate() % 10) {
                    case 1:
                        formatted += 'st';
                        break;
                    case 2:
                        formatted += 'nd';
                        break;
                    case 3:
                        formatted += 'rd';
                        break;
                    default:
                        formatted += 'th';
                        break;
                }
                //break;
                //    default:
                //        break;
                //}
                break;
            case 'Z':
                //formatted += timezone
                break;
            case '\0':
                if(preserveNull) {
                    formatted += segments[idx];
                }
                break;
            default:
                formatted += segments[idx];
                break;
        }
    }
    return formatted;
}

// TODO: Fix 'r' (GMT) doesn't actually translate to GMT time
// TODO: Fix 'u' (timezone) doesn't actually use timezone
// http://code.google.com/p/datejs/wiki/FormatSpecifiers
Datetime.prototype.toString = function(value) {
    if(value == undefined) {
        return this.date.toString();
    } else {
        switch(value) {
            case 'd':
                format = 'M/d/yyyy';
                break;
            case 'D':
                format = 'dddd, MMMM dd, yyyy';
                break;
            case 'F':
                format = 'dddd, MMMM dd, yyyy h:mm:ss tt';
                break;
            case 'm':
                format = 'MMMM dd';
                break;
            case 'r':
                format = 'ddd, dd MMM yyyy HH:mm:ss GMT';
                break;
            case 's':
                format = 'yyyy-MM-dd\0T\0HH:mm:ss';
                break;
            case 't':
                format = 'h:mm tt';
                break;
            case 'T':
                format = 'h:mm:ss tt';
                break;
            case 'u':
                format = 'yyyy-MM-dd HH:mm:ss\0Z';
                break;
            case 'y':
                format = 'MMMM, yyyy';
                break;
            case 'sql':
                format = 'yyyy-MM-dd HH:mm:ss';
                break;
            default:
                format = value;
                break;
        }
        return formatter(this.date, format, this.locale);
    }
}

Datetime.isBetween = function(target, first, second) {
    if(second == undefined) {
        second = new Datetime();
    }
    if(first > second) {
        var temp = new Datetime(second);
        second = new Datetime(first);
        first = temp;
    }
    console.log(first.date + ' <= ' + target.date + ' <= ' + second.date);
    return target >= first && target <= second;
}

Datetime.isBetweenDate = function(target, first, second) {
    if(second == undefined) {
        second = new Datetime();
    }
    return Datetime.between(target.midnight(), first.midnight(), second.midnight());
}

Datetime.prototype.isBetween = function(first, second) {
    return Datetime.between(this, first, second);
}

Datetime.prototype.isBetweenDate = function(first, second) {
    return Datetime.betweenDate(this, first, second);
}

// TODO: Implement
Datetime.prototype.calendar = function(value) {
    if(value != undefined) {
        switch(value) {
            case 'json':
                break;
            case 'xml':
                break;
            case 'text':
                break;
            case 'html':
                break;
            case 'canvas':
                break;
            default:
                break;
        }
    }
}
