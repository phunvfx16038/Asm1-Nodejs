const Staff = require("../models/staff");
const TimeSheet = require("../models/timesheet");
const Absent = require("../models/absent");

const workingTime = require("../public/js/calcWorkingTime");
const ITEM_PER_PAGE = 2;

exports.getTimesheetConfirm = (req, res, next) => {
  const staffId = req.staff._id;
  const role = req.staff.role;
  if (role === "Admin") {
    Staff.find({ "manager.managerId": staffId }).then((staffs) => {
      res.render("confirmTimesheet/confirm", {
        pageTitle: "Xác nhận giờ làm nhân viên",
        staffs: staffs,
        path: "/confirm",
        role: role,
        timelist: false,
      });
    });
  } else {
    // res.render("confirmTimesheet/confirm",{
    //     pageTitle:"Xác nhận giờ làm nhân viên",
    //     role:role,
    //     path:""
    // })
  }
};

exports.getTimesheetConfirmOfStaff = (req, res, next) => {
  const staffSelect = req.params.staffId;
  const page = +req.query.page || 1;

  let totalItems;
  TimeSheet.find({ "staff.staffId": staffSelect })
    .countDocuments()
    .then((numberCount) => {
      totalItems = numberCount;
      return TimeSheet.find({ "staff.staffId": staffSelect })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
    })
    .then((timesheet) => {
      const timesheets = [...timesheet];
      //check timesheet exist
      if (timesheet.length != 0) {
        const timesheetIndex = timesheet.length - 1;
        //get current worksheet and render
        timesheet[timesheetIndex].populate("staff").then((timesheet) => {
          const currentWorkSheetIndex = timesheet.worksheet.length - 1;
          const currentWorkSheet = timesheet.worksheet[currentWorkSheetIndex];

          Absent.find({ staffId: staffSelect }).then((absent) => {
            res.render("confirmTimesheet/confirmTimesheet", {
              pageTitle: "Thông tin chi tiết giờ làm",
              path: "/confirm",
              currentWorkSheet: currentWorkSheet,
              timesheet: timesheets,
              name: timesheet.staff.name,
              absent: absent,
              timelist: true,
              covertTimeFunction: workingTime.covertSecondsToHoursAndMin,
              totalItems: totalItems,
              currentPage: page,
              hasNextPage: ITEM_PER_PAGE * page < totalItems,
              hasPreviousPage: page < 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: Math.ceil(totalItems / ITEM_PER_PAGE),
              role: req.staff.role,
            });
          });
        });
      } else {
        res.render("confirmTimesheet/confirmTimesheet", {
          pageTitle: "Thông tin chi tiết giờ làm",
          path: "/confirm",
          timelist: false,
          role: req.staff.role,
        });
      }
    });
};

exports.postConfirmStaffTimesheet = (req, res, next) => {
  const endWork = req.body.endWorkConfirm;
  const startWork = req.body.startWorkConfirm;
  const workSheetid = req.body.workSheetId;
  const timesheetId = req.body.timeSheetId;

  TimeSheet.findById(timesheetId)
    .then((timesheet) => {
      const worksheetIndex = timesheet.worksheet.findIndex((item) => {
        return item._id == workSheetid;
      });

      const worksheetUpdated = timesheet.worksheet[worksheetIndex];
      worksheetUpdated.startWork = startWork;
      worksheetUpdated.endWork = endWork;
      worksheetUpdated.confirmState = true;
      return timesheet.save();
    })
    .then((result) => {
      const staffId = result.staff.staffId;
      res.redirect(`/confirmTimesheet/${staffId}`);
    });
};
