(function () {
  "use strict";

  var CM_PER_INCH = 2.54;
  var SEX_OFFSET_CM = 13;   // mid-parental adjustment for sex
  var RANGE_CM = 8.5;       // approximate range around the estimate

  var unit = "metric";

  var toggleButtons = document.querySelectorAll(".dt-toggle-btn");
  var metricBlock = document.querySelector(".dt-units-metric");
  var imperialBlock = document.querySelector(".dt-units-imperial");
  var calcBtn = document.getElementById("dt-calc-btn");
  var errorEl = document.getElementById("dt-calc-error");
  var resultEl = document.getElementById("dt-calc-result");
  var valueEl = document.getElementById("dt-result-value");
  var rangeEl = document.getElementById("dt-result-range");

  if (!calcBtn) {
    return;
  }

  function readNumber(id) {
    var el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      return NaN;
    }
    return parseFloat(el.value);
  }

  function formatImperial(cm) {
    var totalInches = Math.round(cm / CM_PER_INCH);
    var feet = Math.floor(totalInches / 12);
    var inches = totalInches % 12;
    return feet + " ft " + inches + " in";
  }

  function formatHeight(cm) {
    if (unit === "imperial") {
      return formatImperial(cm);
    }
    return cm.toFixed(1) + " cm";
  }

  function getParentHeightCm(prefix) {
    if (unit === "metric") {
      return readNumber("dt-" + prefix + "-cm");
    }
    var ft = readNumber("dt-" + prefix + "-ft");
    var inch = readNumber("dt-" + prefix + "-in");
    if (isNaN(ft)) {
      return NaN;
    }
    if (isNaN(inch)) {
      inch = 0;
    }
    if (inch < 0 || inch >= 12) {
      return -1; // invalid inches, caught by the range check
    }
    return (ft * 12 + inch) * CM_PER_INCH;
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    resultEl.hidden = true;
  }

  function clearOutput() {
    errorEl.hidden = true;
    resultEl.hidden = true;
  }

  function setUnit(nextUnit) {
    unit = nextUnit;
    for (var i = 0; i < toggleButtons.length; i++) {
      var btn = toggleButtons[i];
      var active = btn.getAttribute("data-unit") === nextUnit;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    metricBlock.hidden = nextUnit !== "metric";
    imperialBlock.hidden = nextUnit !== "imperial";
    clearOutput();
  }

  function calculate() {
    var father = getParentHeightCm("father");
    var mother = getParentHeightCm("mother");

    if (isNaN(father) || isNaN(mother)) {
      showError("Please enter both parents' heights.");
      return;
    }
    if (father < 120 || father > 230 || mother < 120 || mother > 230) {
      showError("Please check the heights. Each should be between 120 and 230 cm (about 3 ft 11 in to 7 ft 7 in), with inches from 0 to 11.");
      return;
    }

    var sexInput = document.querySelector('input[name="dt-sex"]:checked');
    var sex = sexInput ? sexInput.value : "boy";
    var offset = sex === "boy" ? SEX_OFFSET_CM : -SEX_OFFSET_CM;
    var estimate = (father + mother + offset) / 2;

    valueEl.textContent = formatHeight(estimate);
    rangeEl.textContent = "Likely range: " + formatHeight(estimate - RANGE_CM) + " to " + formatHeight(estimate + RANGE_CM);

    errorEl.hidden = true;
    resultEl.hidden = false;
  }

  for (var i = 0; i < toggleButtons.length; i++) {
    toggleButtons[i].addEventListener("click", function () {
      setUnit(this.getAttribute("data-unit"));
    });
  }

  calcBtn.addEventListener("click", calculate);

  var inputs = document.querySelectorAll(".dt-calc input[type='number']");
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        calculate();
      }
    });
  }

  setUnit("metric");
})();
