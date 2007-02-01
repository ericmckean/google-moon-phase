/*
Copyright (C) 2007 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Image max size
var IMAGE_MAX_SIZE = 196;

// Records whether or not the gadget is expanded
var poppedOut = false;

function onOpen() {
  // Check once every 30 minutes
  view.setInterval(onTimer, 30 * 60 * 1000);
  // Initialize the gadget
  onTimer();
}

// Called when the timer goes off
function onTimer() {
  // Compute the moon phase each time timer is called
  var cal = new Date();
  // Base the computation off of UTC time, to the nearest hour
  var phase = computeMoonPhase(cal.getUTCFullYear(), 
                               cal.getUTCMonth() + 1,
                               cal.getUTCDate(),
                               cal.getUTCHours());
  var truncPhase = Math.floor(phase) % 30;

  // Find the text description of the current phase
  var desc;
  if (truncPhase === 0) {
    desc = STRING_MOON_DESC_NEW;
  } else if (truncPhase == 7) {
    desc = STRING_MOON_DESC_FIRST_QUARTER;
  } else if (truncPhase == 15) {
    desc = STRING_MOON_DESC_FULL;
  } else if (truncPhase == 23) {
    desc = STRING_MOON_DESC_THIRD_QUARTER;
  } else if (truncPhase > 0 && phase < 7) {
    desc = STRING_MOON_DESC_WAXING_CRESCENT;
  } else if (truncPhase > 7 && phase < 15) {
    desc = STRING_MOON_DESC_WAXING_GIBBOUS;
  } else if (truncPhase > 15 && phase < 23) {
    desc = STRING_MOON_DESC_WANING_GIBBOUS;
  } else {
    desc = STRING_MOON_DESC_WANING_CRESCENT;
  }

  // Set the image and text component appropriately
  moonImage.src = "pix/moon" + truncPhase + ".png";
  moonImage.tooltip = (Math.floor(phase * 100) / 100) + " " + STRING_DAYS_OLD;
  phaseAge.innerText = STRING_MOON_AGE_PREFIX + " " + moonImage.tooltip +
                       "\n" +
                       desc;
}

// Called when view is resized (recompute constituent basicElement sizes and
// locations)
function resizeView() {
  setDimensions(event.width, event.height);
}

// Open the browser whenever a user double clicks (expanded or collapsed)
function onDblClick() {
 var obj = new ActiveXObject("Shell.Application");
 obj.Open("http://stardate.org/nightsky/moon/");
}

// Show date age in title, when gadget is minimized
function onMinimize() {
  view.caption = STRING_MOON_SHORT + " - " + moonImage.tooltip;
}

// Only show the textual part (details) when popped out
function onPopout() {
  poppedOut = true;
  phaseAge.visible = true;
}

// Hide the textual part in restored mode, show regular title, and reset
// dimensions
function onRestore() {
  view.caption = GADGET_NAME;
  phaseAge.visible = false;
  //moonImage.enabled = true;
  poppedOut = false;
  setDimensions(view.width, view.height);
}

// Called whenever the sizes and/or locations of basicElements need to change
function setDimensions(width, height) {
  // Image is square, constrained by smallest dimension
  var sz = Math.min(width, height);

  // Make the image almost as large as the sz
  moonImage.width = Math.min(IMAGE_MAX_SIZE, sz * 0.9);
  moonImage.height = Math.min(IMAGE_MAX_SIZE, sz * 0.9);

  if (poppedOut) {
    // Align image on left, and set text location
    moonImage.x = 0;
    phaseAge.x = moonImage.width + 5;
    phaseAge.y = (height - phaseAge.height) / 2;
  } else {
    // Center image horizontally
    moonImage.x = (width - moonImage.width) * 0.5;
  }

  // Always center image vertically
  moonImage.y = (height - moonImage.height) * 0.5;
}

// Compute the moon phase.
// Code is based upon Bradley E. Schaefer''s well-known moon phase algorithm.
function computeMoonPhase(year, month, day, hours) {
  var MOON_PHASE_LENGTH = 29.530588853;

  // Convert the year into the format expected by the algorithm
  var transformedYear = year - Math.floor((12 - month) / 10);

  // Convert the month into the format expected by the algorithm
  var transformedMonth = month + 9;
  if (transformedMonth >= 12) {
    transformedMonth = transformedMonth - 12;
  }

  // Logic to compute moon phase as a fraction between 0 and 1
  var term1 = Math.floor(365.25 * (transformedYear + 4712));
  var term2 = Math.floor(30.6 * transformedMonth + 0.5);
  var term3 = Math.floor(Math.floor((transformedYear / 100) + 49) * 0.75) - 38;
  var intermediate = term1 + term2 + (day + (hours - 1) / 24) + 59;
  if (intermediate > 2299160) {
    intermediate = intermediate - term3;
  }
  var normalizedPhase = (intermediate - 2451550.1) / MOON_PHASE_LENGTH;
  normalizedPhase = normalizedPhase - Math.floor(normalizedPhase);
  if (normalizedPhase < 0) {
    normalizedPhase = normalizedPhase + 1;
  }

  // Return the result as a value between 0 and MOON_PHASE_LENGTH
  return normalizedPhase * MOON_PHASE_LENGTH;
}
