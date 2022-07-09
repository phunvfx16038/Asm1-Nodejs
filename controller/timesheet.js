const TimeSheet = require("../models/timesheet");
const Staff = require("../models/staff");
const workingTime = require("../public/js/calcWorkingTime");
const mongoose = require("mongoose");
const Absent = require("../models/absent");

exports.getHomePage = (req, res, next) => {
  const staffId = req.staff.id;
  Staff.findById(staffId)
    .then((staff) => {
      res.render("home", {
        pageTitle: "Trang chủ",
        staff: staff,
        path: "/",
        data: null,
        lists: null,
        totalWorkedTime: 0,
        covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// #region CHECK IN

exports.getCheckin = (req, res, next) => {
  const staffId = req.staff._id;
  TimeSheet.find({
    staffId: staffId,
    month: month,
    day: currentDate,
  });
  res.render("timesheet/checkin", {
    pageTitle: "Đăng ký giờ làm",
    path: "/",
  });
};

exports.postCheckin = (req, res, next) => {
  const staffId = req.staff._id;
  const workPlace = req.body.workplace;
  let today = new Date();
  let currentDate = parseInt(today.getDate());
  const month = parseInt(today.getMonth() + 1);
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  Staff.findById(staffId)
    .then((staff) => {
      //update state of staff
      staff.state = true;
      staff.save();

      TimeSheet.find({
        staffId: staffId,
        month: month,
        day: currentDate,
      })
        .then((timesheet) => {
          //if timesheet is not exist then create new one
          if (!timesheet[0]) {
            const worksheetData = {
              startWork: time,
              workPlace: workPlace,
              endWork: null,
            };
            const worksheetArr = [];
            const worksheet = [...worksheetArr, { ...worksheetData }];

            const timesheet = new TimeSheet({
              month: month,
              day: currentDate,
              worksheet: worksheet,
              staff: {
                name: staff.name,
                staffId: mongoose.Types.ObjectId(staffId),
              },
            });

            return timesheet.save();
          } else {
            //timesheet exist then update new data
            const currentWorksheet = [...timesheet[0].worksheet];
            const worksheetData = {
              startWork: time,
              workPlace: workPlace,
              endWork: null,
            };

            const worksheet = [...currentWorksheet, { ...worksheetData }];
            timesheet[0].worksheet = worksheet;

            return timesheet[0].save();
          }
        })
        .then((timesheet) => {
          const worksheetIndex = timesheet.worksheet.length - 1;
          const currentTimesheet = timesheet.worksheet[worksheetIndex];
          res.render("timesheet/checkin", {
            pageTitle: "Đăng ký giờ làm",
            path: "/",
            name: timesheet.staff.name,
            timesheet: currentTimesheet,
          });
        });
    })

    .catch((err) => console.log(err));
};

// #end region CHECK IN

// #region CHECK OUT

exports.getCheckout = (req, res, next) => {
  const staffId = req.staff._id;
  let today = new Date();
  let currentDate = parseInt(today.getDate());
  const month = parseInt(today.getMonth() + 1);
  TimeSheet.find({ staffId: staffId, month: month, day: currentDate }).then(
    (timesheet) => {
      res.render("timesheet/checkout", {
        pageTitle: "Kết thúc công việc",
        path: "/",
        lists: timesheet[0].worksheet,
        covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
        totalWorkedTime: timesheet[0].totalWorkTimeInDay,
      });
    }
  );
};

exports.postCheckout = (req, res, next) => {
  const staffId = req.staff._id;
  let today = new Date();
  let currentDate = parseInt(today.getDate());
  const month = parseInt(today.getMonth() + 1);
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

  //remove worksheet without checkout in same day
  TimeSheet.find({
    staffId: staffId,
    month: month,
    day: { $lt: currentDate },
    "worksheet.endWork": null,
  })
    .then((timesheet) => {
      if (timesheet.length !== 0) {
        const worksheetUpdate = timesheet[0].worksheet.filter((item) => {
          return item.endWork !== null;
        });

        timesheet[0].worksheet = worksheetUpdate;
        timesheet[0].save();

        Staff.findById(staffId)
          .then((staff) => {
            staff.state = false;
            staff.save();
          })
          .then((staff) => {
            res.render("timesheet/checkout", {
              pageTitle: "Kết thúc công việc",
              path: "/",
              checkout: false,
            });
          });
      } else {
        //checkout the timesheet in currentday
        TimeSheet.find({
          staffId: staffId,
          month: month,
          day: currentDate,
        })
          .then((timesheet) => {
            //update state to false
            Staff.findById(staffId).then((staff) => {
              staff.state = false;
              staff.save();
            });
            return timesheet;
          })
          .then((timesheet) => {
            //update endwork on new timesheet in day
            const timesheetIndex = timesheet.length - 1;
            const worksheetIndex = timesheet[
              timesheetIndex
            ].worksheet.findIndex((sheet) => {
              return sheet.endWork == null;
            });

            Absent.findOne(staffId)
              .then((absent) => {
                if (absent) {
                  const absentIndex = absent.date.findIndex((item) => {
                    return item.day == currentDate;
                  });

                  if (absentIndex !== -1) {
                    //calculate worktime of worksheet include absent in currentday
                    const workTime =
                      workingTime.workingTime(
                        timesheet[timesheetIndex].worksheet[worksheetIndex]
                          .startWork,
                        time
                      ) +
                      parseInt(absent.date[absentIndex].hours) * 3600;

                    //get absent hour and convert to seconds
                    if (absent.date[absentIndex].hours === 8) {
                      workTime =
                        parseInt(absent.date[absentIndex].hours) * 3600;
                    }

                    //update endwork and work time to database
                    timesheet[timesheetIndex].worksheet[
                      worksheetIndex
                    ].endWork = time;
                    timesheet[timesheetIndex].worksheet[
                      worksheetIndex
                    ].workTime = workTime;

                    return timesheet[timesheetIndex].save();
                  } else {
                    //calculate worktime if absent is not tcurrrent day
                    const workTime = workingTime.workingTime(
                      timesheet[timesheetIndex].worksheet[worksheetIndex]
                        .startWork,
                      time
                    );
                    timesheet[timesheetIndex].worksheet[
                      worksheetIndex
                    ].endWork = time;
                    timesheet[timesheetIndex].worksheet[
                      worksheetIndex
                    ].workTime = workTime;
                    return timesheet[timesheetIndex].save();
                  }
                } else {
                  //calculate worktime without absent
                  const workTime = workingTime.workingTime(
                    timesheet[timesheetIndex].worksheet[worksheetIndex]
                      .startWork,
                    time
                  );
                  timesheet[timesheetIndex].worksheet[worksheetIndex].endWork =
                    time;
                  timesheet[timesheetIndex].worksheet[worksheetIndex].workTime =
                    workTime;
                  return timesheet[timesheetIndex].save();
                }
              })
              .then((timesheet) => {
                // calcualte total worktime in day
                const totalWorkTimeInDay = workingTime.totalWorkedTime(
                  timesheet.worksheet
                );
                const overTimeInDay = 0;
                //overtime = total work time - standard time (8 hours = 28800 seconds)
                if (totalWorkTimeInDay > 28800) {
                  overTimeInDay = totalWorkTimeInDay - 28800;
                  totalWorkTimeInDay = 28800;
                }

                //update totalWorkTimeInDay and overtime to database
                timesheet.totalWorkTimeInDay = totalWorkTimeInDay;
                timesheet.overTimeInDay = overTimeInDay;
                return timesheet.save();
              })
              .then((timesheet) => {
                //render timesheet
                res.render("timesheet/checkout", {
                  pageTitle: "Kết thúc công việc",
                  path: "/",
                  checkout: true,
                  lists: timesheet.worksheet,
                  covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
                  totalWorkedTime: timesheet.totalWorkTimeInDay,
                });
              })
              .catch((err) => console.log(err));
          });
      }
    })
    .catch((err) => console.log(err));
};
// #end region CHECK OUT

//#region ABSENT
exports.getAbsent = (req, res, next) => {
  const staffId = req.staff._id;

  Absent.find(staffId)
    .then((absent) => {
      const absentIndex = absent.length - 1;
      absent[absentIndex].populate("staffId").then((absent) => {
        res.render("timesheet/absent", {
          pageTitle: "Absent",
          leave: true,
          path: "/",
          absent: absent,
          annualLeave: absent.staffId.annualLeave,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAbsent = (req, res, next) => {
  const absentDateTime = req.body.absentDateTime;
  const reason = req.body.reason;
  const staffId = req.staff._id;
  // absentDateTime from string to Array
  const absentArray = absentDateTime.split(", ");

  //convert from array to array with many object items to save
  const dayOff = absentArray.reduce((result, absentDay) => {
    const absent = absentDay.trim().split(" ");
    result.push({
      day: absent[0],
      hours: absent[1].slice(1, 2),
    });
    return result;
  }, []);

  //calculate total absent hour
  const totalHourAbsent = dayOff.reduce((total, date) => {
    return (total = total + parseFloat(date.hours));
  }, 0);

  Staff.findById(staffId)
    .then((staff) => {
      const annualLeave = staff.annualLeave;
      if (annualLeave < totalHourAbsent) {
        Absent.find(staffId).then((absent) => {
          const absentIndex = absent.length - 1;
          absent[absentIndex].populate("staffId").then((absent) => {
            res.render("timesheet/absent", {
              pageTitle: "Absent",
              leave: false,
              path: "/",
              absent: absent,
              annualLeave: absent.staffId.annualLeave,
            });
          });
        });
      } else {
        // calculate annualLeave
        const annualLeaveRemain = annualLeave - totalHourAbsent;

        //update annualLeave after create new absent
        staff.annualLeave = annualLeaveRemain;
        staff.save();

        //create new absent
        const absent = new Absent({
          reason: reason,
          date: dayOff,
          staffId: mongoose.Types.ObjectId(staffId),
        });
        return absent.save();
      }
    })
    .then((absent) => {
      absent.populate("staffId").then((absent) => {
        console.log(absent);
        res.render("timesheet/absent", {
          pageTitle: "Absent",
          leave: true,
          path: "/",
          absent: absent,
          annualLeave: absent.staffId.annualLeave,
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//#end region ABSENT
