const moment1 = require("moment-precise-range-plugin");
const moment = require("moment");
const workingTime = (startTime, endTime) => {
  let start = moment(startTime, " HH:mm:ss");
  let end = moment(endTime, " HH:mm:ss");
  let diff = moment.preciseDiff(start, end, true);
  // intervals = ["hours", "minutes", "seconds"];
  // let workTime = [];
  const seconds = diff["seconds"];
  const minutes = diff["minutes"];
  const hours = diff["hours"];
  const totalTime =
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  return totalTime;
  // for (let i = 0; i < intervals.length; i++) {
  //   let time = diff[intervals[i]];
  //   if (time < 10) {
  //     time = "0" + time;
  //   } else {
  //     time = time;
  //   }
  //   workTime.push(time + " " + intervals[i]);
  // }
  // return workTime.join(" ");
};

const totalWorkedTime = (timesheets) => {
  let totalTime = 0;
  for (i = 0; i < timesheets.length; i++) {
    let covertToNumb = parseInt(timesheets[i].workTime);
    totalTime = totalTime + covertToNumb;
  }
  return totalTime;
};

const totalWorkedTimeInMonth = (timesheets) => {
  const result = {
    totalWorkTimeInMonth: 0,
    totalOverTimeInMonth: 0,
  };

  for (i = 0; i < timesheets.length; i++) {
    let covertWorkTimeInDayToNumb = parseInt(timesheets[i].totalWorkTimeInDay);
    let covertOverTimeToNumb = parseInt(timesheets[i].overTimeInDay);
    result.totalWorkTimeInMonth =
      result.totalWorkTimeInMonth + covertWorkTimeInDayToNumb;
    result.totalOverTimeInMonth =
      result.totalOverTimeInMonth + covertOverTimeToNumb;
  }

  return result;
};

const covertSecondsToHoursAndMin = (seconds) => {
  let duration = seconds;
  let hours = duration / 3600;
  duration = duration % 3600;

  let min = parseInt(duration / 60);
  duration = duration % 60;

  let sec = parseInt(duration);

  if (sec < 10) {
    sec = `0${sec}`;
  }
  if (min < 10) {
    min = `0${min}`;
  }
  if (parseInt(hours, 10) > 0) {
    return `${parseInt(hours, 10)} hours ${min} minutes ${sec} seconds`;
  }
  return ` ${min} minutes ${sec} seconds`;
};

const getDayOffTime = (staff) => {
  let dayOffTime = 0;
  const findDayOffIndex = staff.dayOff.findIndex((dayOff) => {
    return (dayOff.dateoff = date.toString());
  });
  if (findDayOffIndex !== -1) {
    dayOffTime = staff.dayOff[findDayOffIndex].hours;
  }
  return dayOffTime;
};

exports.workingTime = workingTime;
exports.totalWorkedTime = totalWorkedTime;
exports.totalWorkedTimeInMonth = totalWorkedTimeInMonth;
exports.covertSecondsToHoursAndMin = covertSecondsToHoursAndMin;
exports.getDayOffTime = getDayOffTime;
