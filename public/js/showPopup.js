let checkInBtn = document.querySelector(".check-in");
let absentBtn = document.querySelector(".absent");
let checkInModal = document.querySelector("#checkin-modal");
let absentModal = document.querySelector("#absent-modal");
let closeElCheckin = document.getElementsByClassName("close")[0];
let closeElAbsent = document.getElementsByClassName("close")[1];

function showCheckinModal(e) {
  e.preventDefault();
  checkInModal.style.display = "block";
}

function closeModal() {
  checkInModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == checkInModal) {
    checkInModal.style.display = "none";
  }
};
checkInBtn.addEventListener("click", showCheckinModal);
closeElCheckin.addEventListener("click", closeModal);

const nativeElement = document.getElementById("datePicker");
const config = {
  wrap: true,
  dateFormat: "d/m/Y H:i",
  altFormat: "d/m/Y H:i",
  enableTime: true,
  allowInput: true,
  mode: "multiple",
  time_24hr: true,
  minTime: "1:00",
  maxTime: "8:00",
};
flatpickr(nativeElement, config);

//Absent modal
function showAbsentModal(e) {
  e.preventDefault();
  absentModal.style.display = "block";
}

function closeAbsentModal() {
  absentModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == absentModal) {
    absentModal.style.display = "none";
  }
};
absentBtn.addEventListener("click", showAbsentModal);
closeElAbsent.addEventListener("click", closeAbsentModal);
