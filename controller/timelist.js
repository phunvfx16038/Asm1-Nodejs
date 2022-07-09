const TimeSheet = require("../models/timesheet");
const Absent = require("../models/absent");
const workingTime = require("../public/js/calcWorkingTime");

exports.getTimeList = (req, res, next) => {
  let today = new Date();
  let currentDate = today.getDate();
  const month = today.getMonth() + 1;
  const staffId = req.staff._id;

  TimeSheet.find({ staffId: staffId, month: month, day: currentDate })
    .then((timesheet) => {
      //check timesheet exist
      if (timesheet.length != 0) {
        const timesheetIndex = timesheet.length - 1;
        //get current worksheet and render
        timesheet[timesheetIndex].populate("staff").then((timesheet) => {
          const currentDay = timesheet.day + "/" + timesheet.month;
          const currentWorkSheetIndex = timesheet.worksheet.length - 1;
          const currentWorkSheet = timesheet.worksheet[currentWorkSheetIndex];

          Absent.find({ staffId: staffId }).then((absent) => {
            res.render("timeList/timelist", {
              pageTitle: "Tra cứu thông tin giờ làm",
              path: "/timelist",
              currentWorkSheet: currentWorkSheet,
              timesheet: timesheet,
              date: currentDay,
              absent: absent,
              timelist: true,
              salary: null,
              missingTime: null,
              salaryScale: null,
              calTotalOverTimeInMonth: null,
              covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
            });
          });
        });
      } else {
        //render to timelist page when don't have timesheet
        res.render("timeList/timelist", {
          pageTitle: "Tra cứu thông tin giờ làm",
          path: "/timelist",
          currentWorkSheet: null,
          timesheet: null,
          date: null,
          absent: null,
          timelist: false,
          salaryScale: null,
          salary: null,
          missingTime: null,
          calTotalOverTimeInMonth: null,
          covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postTimeList = (req, res, next) => {
  const monthSelected = req.body.selectMonth;
  const staffId = req.staff._id;
  TimeSheet.find({ month: monthSelected }).then((timesheet) => {
    //check timesheet exist
    if (timesheet.length != 0) {
      //calculate total Work time of staff
      const calTotalWorkTimeInMonth = timesheet.reduce(
        (totalTimeInMonth, current) => {
          return (totalTimeInMonth =
            totalTimeInMonth + current.totalWorkTimeInDay);
        },
        0
      );

      //calculate overtime of staff
      const calTotalOverTimeInMonth = timesheet.reduce(
        (totalOverTimeInMonth, current) => {
          return (totalOverTimeInMonth =
            totalOverTimeInMonth + current.overTimeInDay);
        },
        0
      );
      //calculate standard worktime in month
      const standardTimeInMonth = timesheet.length * 8 * 3600;

      //calculate missing time
      const missingTime = standardTimeInMonth - calTotalWorkTimeInMonth;

      //get current timesheet index
      const currentTimesheetIndex = timesheet.length - 1;

      timesheet[currentTimesheetIndex]
        .populate("staff.staffId")
        .then((timesheet) => {
          const currentDay = timesheet.day + "/" + timesheet.month;
          const currentWorkSheetIndex = timesheet.worksheet.length - 1;
          const currentWorkSheet = timesheet.worksheet[currentWorkSheetIndex];

          //calculate salary
          const salary =
            timesheet.staff.staffId.salaryScale * 3000000 +
            //convert calTotalOverTimeInMonth and missingTime to hours
            (calTotalOverTimeInMonth / 3600 - missingTime / 3600) * 200000;

          Absent.find({ staffId: staffId }).then((absent) => {
            res.render("timeList/timelist", {
              pageTitle: "Tra cứu thông tin giờ làm",
              path: "/timelist",
              currentWorkSheet: currentWorkSheet,
              timesheet: timesheet,
              date: currentDay,
              absent: absent,
              salaryScale: timesheet.staff.staffId.salaryScale,
              timelist: true,
              salary: salary.toFixed(2),
              missingTime: missingTime,
              calTotalOverTimeInMonth: calTotalOverTimeInMonth,
              covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
            });
          });
        });
    } else {
      res.render("timeList/timelist", {
        pageTitle: "Tra cứu thông tin giờ làm",
        path: "/timelist",
        currentWorkSheet: null,
        timesheet: null,
        date: null,
        absent: null,
        timelist: false,
        salary: null,
        salaryScale: null,
        missingTime: null,
        calTotalOverTimeInMonth: null,
        covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
      });
    }
  });
};

exports.postSearch = (req, res, next) => {
  const search = req.body.search;
  TimeSheet.find({
    $or: [{ day: search }, { month: search }],
  }).then((result) => {
    console.log("result line 149:" + result);
  });
};
