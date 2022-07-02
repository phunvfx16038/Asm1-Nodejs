const staff = require("../models/staff");
const Staff = require("../models/staff");
const workingTime = require("../public/js/calcWorkingTime");

exports.getHomePage = (req, res, next) => {
  const staffId = req.staff.id;
  Staff.findById(staffId)
    .then((staff) => {
      res.render("home", {
        pageTitle: "Trang chủ",
        staff: staff,
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

exports.postCheckInAndOut = (req, res, next) => {
  const staffState = req.staff.state;
  let today = new Date();
  let currentDate =
    today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const staffId = req.staff.id;
  const date = currentDate;
  const month = today.getMonth() + 1;

  if (staffState === false) {
    const workPlace = req.body.workplace;
    const startWork = time;
    const endWork = null;
    const state = true;

    Staff.findById(staffId)
      .then((staff) => {
        const indexOfTimsheetItem = staff.timesheets.timesheetItem.length - 1;
        const checkMonth =
          staff.timesheets.timesheetItem[indexOfTimsheetItem].month;

        if (checkMonth == null) {
          staff.timesheets.timesheetItem[indexOfTimsheetItem].month = month;
          return staff.save();
        } else {
          return staff;
        }
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });

        if (monthIndex !== -1) {
          const indexOfWorking =
            staff.timesheets.timesheetItem[monthIndex].working.length - 1;

          const checkday =
            staff.timesheets.timesheetItem[monthIndex].working[indexOfWorking]
              .day;

          if (checkday == null) {
            staff.timesheets.timesheetItem[monthIndex].working[
              indexOfWorking
            ].day = date;
            return staff.save();
          }
          return staff;
        } else {
          const currentMonthObj = [...staff.timesheets.timesheetItem];
          const newMonthObj = {
            month: month,
            working: [
              {
                day: date,
                worksheet: [],
              },
            ],
          };
          const addNewMonthObj = [...currentMonthObj, { ...newMonthObj }];
          const timesheetItem = addNewMonthObj;
          staff.timesheets.timesheetItem = timesheetItem;
          return staff.save();
        }
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });

        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;

        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });
        const worksheetData = {
          startWork: startWork,
          endWork: endWork,
          workPlace: workPlace,
          date: date,
        };
        if (dayIndex !== -1) {
          const updateWorksheetItems = [
            ...updateWorksheetInDay[dayIndex].worksheet,
          ];

          const worksheetlist = [...updateWorksheetItems, { ...worksheetData }];

          staff.timesheets.timesheetItem[monthIndex].working[
            dayIndex
          ].worksheet = worksheetlist;

          staff.state = state;

          return staff.save();
        } else {
          const newDay = {
            day: date,
            worksheet: [worksheetData],
          };
          const addNewDay = [...updateWorksheetInDay, { ...newDay }];
          staff.timesheets.timesheetItem[monthIndex].working = addNewDay;
          return staff.save();
        }
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });
        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;
        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });
        const data =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .worksheet;
        const lasttimeSheet = data.length - 1;

        res.render("home", {
          staff: staff,
          pageTitle: "Trang chủ",
          data: data[lasttimeSheet],
          lists: data,
          totalWorkedTime: null,
          covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
        });
      })
      .catch((err) => console.log(err));
  } else {
    const state = false;
    const endWork = time;

    Staff.findById(staffId)
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });
        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;
        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });

        const currentWorksheet =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .worksheet;

        const currentIndex = currentWorksheet.length - 1;

        let workTime = 0;
        if (staff.dayOff.length !== 0) {
          const indexdayOff = staff.dayOff.findIndex((day) => {
            return day.dateoff === date.toString();
          });

          if (indexdayOff !== -1) {
            workTime =
              workingTime.workingTime(
                currentWorksheet[currentIndex].startWork,
                endWork
              ) + parseInt(staff.dayOff[indexdayOff].hours * 3600);
          } else {
            workTime = workingTime.workingTime(
              currentWorksheet[currentIndex].startWork,
              endWork
            );
          }
        } else {
          workTime = workingTime.workingTime(
            currentWorksheet[currentIndex].startWork,
            endWork
          );
        }

        const currentTimesheet = [...currentWorksheet];
        currentTimesheet[currentIndex].endWork = endWork;
        currentTimesheet[currentIndex].workTime = workTime;
        currentTimesheet[currentIndex].date = date;

        staff.timesheets.timesheetItem[monthIndex].working[dayIndex].worksheet =
          currentTimesheet;
        staff.state = state;
        return staff.save();
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });
        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;
        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });

        const currentWorksheet =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .worksheet;

        let totalWorkTimeInDay = workingTime.totalWorkedTime(currentWorksheet);

        let overTimeInDay = 0;
        // 8h = 28800 seconds
        if (totalWorkTimeInDay > 28800) {
          overTimeInDay = totalWorkTimeInDay - 28800;
        }

        staff.timesheets.timesheetItem[monthIndex].working[
          dayIndex
        ].totalWorkTimeInDay = totalWorkTimeInDay;
        staff.timesheets.timesheetItem[monthIndex].working[
          dayIndex
        ].overTimeInDay = overTimeInDay;
        return staff.save();
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });
        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;
        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });

        const currentWorking =
          staff.timesheets.timesheetItem[monthIndex].working;

        const totalTimeInMonth =
          workingTime.totalWorkedTimeInMonth(currentWorking);

        staff.timesheets.timesheetItem[monthIndex].totalWorkTimeInMonth =
          totalTimeInMonth.totalWorkTimeInMonth;
        staff.timesheets.timesheetItem[monthIndex].overTimeInMonth =
          totalTimeInMonth.totalOverTimeInMonth;
        return staff.save();
      })
      .then((staff) => {
        const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
          return item.month.toString() === month.toString();
        });
        const updateWorksheetInDay =
          staff.timesheets.timesheetItem[monthIndex].working;
        const dayIndex = updateWorksheetInDay.findIndex((item) => {
          return item.day.toString() === date.toString();
        });
        const data =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .worksheet;
        const lasttimeSheet = data.length - 1;

        res.render("home", {
          staff: staff,
          pageTitle: "Trang chủ",
          data: data[lasttimeSheet],
          lists: data,
          totalWorkedTime: data[lasttimeSheet].workTime,
          covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getAbsent = (req, res, next) => {
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      let leave;
      if (staff.annualLeave <= 0) {
        leave = false;
      }
      return { staff, leave };
    })
    .then((staff) => {
      res.render("absent", {
        pageTitle: "Absent",
        leave: staff.leave,
        dayOff: staff.staff.dayOff,
        annualLeave: staff.staff.annualLeave,
        totalHourAbsent: 0,
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
      dateoff: absent[0],
      hours: absent[1].slice(1, 2),
      reason: reason.trim(),
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
        res.render("absent", {
          pageTitle: "Absent",
          leave: false,
          dayOff: staff.dayOff,
          annualLeave: staff.annualLeave,
          totalHourAbsent: 0,
        });
      }
      // calculate annualLeave
      const annualLeaveRemain = annualLeave - totalHourAbsent;
      const newDayOff = [...staff.dayOff, ...dayOff];

      staff.annualLeave = annualLeaveRemain;
      staff.dayOff = newDayOff;
      return staff.save();
    })
    .then((staff) => {
      res.render("absent", {
        pageTitle: "Absent",
        leave: true,
        dayOff: staff.dayOff,
        annualLeave: staff.annualLeave,
        totalHourAbsent: totalHourAbsent,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInfo = (req, res, next) => {
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      res.render("info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postInfo = (req, res, next) => {
  const image = req.body.imageFile;
  const staffId = req.staff._id;
  Staff.findById(staffId)
    .then((staff) => {
      staff.image = image;
      return staff.save();
    })
    .then((staff) => {
      res.render("info", {
        pageTitle: "Thông tin nhân viên",
        staff: staff,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getTimeList = (req, res, next) => {
  let today = new Date();
  let currentDate =
    today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
  const date = currentDate;
  const month = today.getMonth() + 1;
  const staffId = req.staff._id;
  Staff.findById(staffId).then((staff) => {
    const monthIndex = staff.timesheets.timesheetItem.findIndex((item) => {
      return item.month.toString() === month.toString();
    });
    if (monthIndex !== -1) {
      const updateWorksheetInDay =
        staff.timesheets.timesheetItem[monthIndex].working;
      const dayIndex = updateWorksheetInDay.findIndex((item) => {
        return item.day.toString() === date.toString();
      });

      if (dayIndex !== -1) {
        const data =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .worksheet;
        const timesheetIndex = data.length - 1;

        const totalWorkTimeInDay =
          staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
            .totalWorkTimeInDay;

        const dayOffTimeValue = workingTime.getDayOffTime;
        const totalTimeInDay =
          parseInt(totalWorkTimeInDay) + parseInt(dayOffTimeValue * 3600);
        res.render("timelist", {
          pageTitle: "Tra cứu thông tin",
          timesheet: data[timesheetIndex],
          covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
          annualLeave: staff.annualLeave,
          dayOff: staff.dayOff,
          totalTime: data[timesheetIndex].workTime,
          totalTimeInDay: totalTimeInDay,
          overTime:
            staff.timesheets.timesheetItem[monthIndex].working[dayIndex]
              .overTimeInDay,
          dayOffTime: dayOffTimeValue,
          listMonth: staff.timesheets.timesheetItem,
          salaryScale: staff.salaryScale,
        });
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  });
};

exports.getCovideInfo = (req, res, next) => {
  res.render("covidInfo", {
    pageTitle: "Đăng ký thông tin Covid",
  });
};

exports.postCovideInfo = (req, res, next) => {
  const staffId = req.staff._id;
  const temp = req.body.temp;
  const date = req.body.covidDateTime;
  const isCovid = req.body.checkCovid;
  const vaccine1 = req.body.vaccine1;
  const vaccine2 = req.body.vaccine2;
  const vaccine3 = req.body.vaccine3;
  const vaccineType1 = req.body.vaccineType1;
  const vaccineType2 = req.body.vaccineType2;
  const vaccineType3 = req.body.vaccineType3;

  Staff.findById(staffId)
    .then((staff) => {
      const objVaccine1 = { day: vaccine1, type: vaccineType1 };
      const objVaccine2 = { day: vaccine2, type: vaccineType2 };
      const objVaccine3 = { day: vaccine3, type: vaccineType3 };

      const newVaccineArray = [...staff.covidInfo.vaccine];
      const addVaccine = [
        ...newVaccineArray,
        { ...objVaccine1 },
        { ...objVaccine2 },
        { ...objVaccine3 },
      ];
      staff.covidInfo.vaccine = addVaccine;
      staff.covidInfo.temp = temp;
      staff.covidInfo.date = date;
      staff.covidInfo.isCovid = isCovid;
      return staff.save();
    })
    .then((staff) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
