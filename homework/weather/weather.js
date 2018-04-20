/**
* weather.js
* Rebecca de Feijter - 10639918
* CS50x - Data Processing Javascript
*
* Creates a graph about the average daily temperature between 01/04/2017 and
* 31/03/2018 that is partly hardcoded and partly determined by the dataset.
* Graph includes x-axis, y-axis, tics, tic labels, axis labels, a graph title
* and datapoints.
*
* Length and position of y-axis are hardcoded as well as the length of the
* x-axis, the months in the year and the length of the tics. Temperatures are
* always displayed on the y-axis with intervals of 5 degrees.
*
* Y-value of the x-axis depends on dataset, as well as the calculation of the
* coordinates of the datapoints and the location and labels of the tics.
**/

// XMLHttpRequest (works with knmizonder.txt, not yet with knmimet.txt)
var knmi = "knmizonder.txt"
var knmiFile = new XMLHttpRequest();
knmiFile.onreadystatechange = function() {
  if (this.readyState === 4 && this.status === 200) {

      // call function containing graph-writing-code
      drawPrettyGraph(this.responseText)
  }
}
knmiFile.open("GET", knmi, true);
knmiFile.send();

// program can be run by calling this function
function drawPrettyGraph(rawData) {

  // get data for graph content (only when not using XMLHttpRequest)
  // let rawData = document.getElementById("rawdata")
  // rawData = rawData.value;

  // split dataset per row
  splitData = rawData.split("\n");

  // join all rows of data seperated by comma's
  splitData = splitData.join();

  // split dataset per comma (separate date and temperature)
  var doubleSplitData = splitData.split(',');
  var lengthDoubleSplitData = doubleSplitData.length;

  // trim away whitespace
  for (i = 0; i < lengthDoubleSplitData; i++)
  {
    doubleSplitData[i] = doubleSplitData[i].trim();

    // keep track of maximum and minimum temperature in data
    if (i % 2 == 0)
    {
      // assume first temperature as both maximum and minimum
      if (doubleSplitData[i + 1] == doubleSplitData[1]) {
        maxTemp = doubleSplitData[i + 1];
        minTemp = doubleSplitData[i + 1];
      }

      // adjust maximum or minimum when necessary
      else
      {
        if (parseInt(doubleSplitData[i + 1]) > maxTemp)
        {
          maxTemp = doubleSplitData[i + 1];
        }
        if (parseInt(doubleSplitData[i + 1]) < minTemp)
        {
          minTemp = doubleSplitData[i + 1];
        }
      }
    }
  }
  // not using the part below yet! (until "until here")

  // create array of datapoint objects
  var dataPointsArray = [];

  // create objects with date and temperature
  for (i = 0; i < lengthDoubleSplitData - 1; i += 2)
  {

    // adjust temperature format
    var temporaryString = doubleSplitData[i].slice(0,4) + "-" + doubleSplitData[i].slice(4,6) + "-" + doubleSplitData[i].slice(6,);

    var object = {

      // assign values to object
      date : new Date(temporaryString),
      temp : doubleSplitData[i + 1]
    }

    // append to array
    dataPointsArray.push(object);
  }

  // until here

  // create graph canvas
  var canvas = document.getElementById('weatherGraph');
  var context = canvas.getContext('2d');

  // make it pink and therefore amazing
  context.fillStyle = 'rgb(244, 194, 194)';
  context.fillRect(0, 0, 1000, 600);

  // hardcoded variables for graph
  var xCoordinateYAxis = 100;
  var yHigh = 100;
  var yLow = 500;
  var lengthYAxis = yLow - yHigh;
  var farEndXAxis = 900;
  var lengthOfTics = 5;
  var ticLabel = 0

  // variables for graph depending on dataset
  var numberOfDays = doubleSplitData.length / 2;
  var moduloDegreesTics = maxTemp % 50;
  var highestTic = maxTemp - moduloDegreesTics + 50;
  var numberOfTics = highestTic / 50;
  var positiveAxisFraction;
  var yCoordinateXAxis;
  var moduloDegreesMinTics = Math.abs(minTemp) % 50;
  var lowestTic = parseInt(minTemp) + parseInt(moduloDegreesMinTics) - 50;
  var numberOfMinTics = lowestTic / - 50;

  // drawing hardcoded y-axis
  context.beginPath();
  context.moveTo(xCoordinateYAxis, yHigh);
  context.lineTo(xCoordinateYAxis, yLow);
  context.stroke();

  // determining y-value of X-axis
  if (minTemp < 0)
  {
    positiveAxisFraction = (numberOfTics + numberOfMinTics) / numberOfTics;
    yCoordinateXAxis = yHigh + lengthYAxis / positiveAxisFraction;
  }
  else
  {
    yCoordinateXAxis = yLow;
  }

  // draw x-axis
  context.beginPath();
  context.moveTo(xCoordinateYAxis, yCoordinateXAxis);
  context.lineTo(farEndXAxis, yCoordinateXAxis);
  context.stroke();

  // drawing positive tics
  for (i = yCoordinateXAxis; i > yHigh - 1; i = i - (Math.abs(yHigh - yCoordinateXAxis) / numberOfTics))
  {
    context.beginPath();
    context.moveTo(xCoordinateYAxis, i);
    context.lineTo(xCoordinateYAxis - lengthOfTics, i);
    context.stroke();

    // tic text (temperatures)
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(ticLabel,xCoordinateYAxis - 45,i);
    ticLabel = ticLabel += 5
  }

  // drawing negative tics
  for (i = yCoordinateXAxis + (Math.abs(yHigh - yCoordinateXAxis) / numberOfTics); i < yLow + 1; i = i + (Math.abs(yCoordinateXAxis - yLow) / numberOfMinTics))
  {
    context.beginPath();
    context.moveTo(xCoordinateYAxis, i);
    context.lineTo(xCoordinateYAxis - lengthOfTics, i);
    context.stroke();

    // tic text (temperatures)
    if (i == yCoordinateXAxis + (Math.abs(yHigh - yCoordinateXAxis) / numberOfTics))
    {
      ticLabel = -5
    }
    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(ticLabel,xCoordinateYAxis - 45,i);
    ticLabel -= 5
  }


  // add graph title
  context.font = "30px Arial";
  context.fillText("Average daily temperature in De Bilt (01/04/2017-31/03/2018)", xCoordinateYAxis, yHigh * 3 / 5);

  // add rotated label for y-axis
  context.save();
  context.translate(0, 0);
  context.rotate(-Math.PI/2);
  context.font = "20px Arial";
  context.textAlign = "center";
  context.fillText("Temperature in degrees", -280 ,35);
  context.restore();

  // variables for recalculating position of data points
  var xValue = xCoordinateYAxis;
  var xInterval = (farEndXAxis - xCoordinateYAxis) / numberOfDays;

  // function that calculates coordinates of data point
  function recoordinate(temperature) {
    var recor;

    // location is based on relative distance to y-axis extremes
    if (temperature > 0)
    {
      recor = yCoordinateXAxis - (yCoordinateXAxis - yHigh) / (highestTic / temperature);
    }
    else if (temperature == 0)
    {
      recor = yCoordinateXAxis;
    }
    else
    {
      recor = yCoordinateXAxis + (yLow - yCoordinateXAxis) / (lowestTic / temperature);
    }
    return recor
  }

  // draw data points in graph
  context.beginPath();

  // start at first object's temperature
  context.moveTo(xValue, recoordinate(dataPointsArray[0].temp));
  xValue += xInterval;

  // itirate over objects' temperatures
  var lengthDataPointsArray = dataPointsArray.length;
  for (i = 1; i < lengthDataPointsArray; i++)
  {
    context.lineTo(xValue, recoordinate(dataPointsArray[i].temp));
    xValue += xInterval;
  }
  context.stroke();

  // variables for dividing x-axis into months
  var monthInterval = 800 / 12;
  var monthStart = xCoordinateYAxis + 40;
  var monthTicInterval = 800 / 12;
  var monthTicStart = xCoordinateYAxis + monthTicInterval
  var months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

  // draw tics on x-axis indicating months
  for (i = 0; i < months.length; i++)
  {
    context.beginPath();
    context.moveTo(monthTicStart, yCoordinateXAxis);
    context.lineTo(monthTicStart, yCoordinateXAxis + lengthOfTics)
    monthTicStart += monthTicInterval;
    context.stroke();
  }

  // draw rotated month names beneath x-axis
  context.save();
  context.translate(0,0);
  context.rotate(-Math.PI/2);
  context.font ="15px Arial";
  context.textalign = "left";
  for (i = 0; i < months.length; i++)
  {
    context.fillText(months[i], -550, monthStart);
    monthStart += monthInterval;
  }
  context.restore();

  // add label for x-axis
  context.font = "20px Arial";
  context.fillText("Months", xCoordinateAxis, yLow)
  // see beneath
}


// Room for improvement:
  // - handling missing data
    // assign missing data a value in order to not shift the graph
    // when that value is assigned the ligns to and from that point should not be visible

  // - 'Un-hardcode' the months on the x-axis
    // based on seconds-since-formula?

  // - XMLHTTPRequest
    // ensure usage of only rows with data in txt file

  // - label x-axis
    // // add label for x-axis
    // context.font = "20px Arial";
    // context.fillText("Months",(farEndXAxis - xCoordinateAxis) / 2, yLow + 50)
    // // so far not working: all other text in graph disappears when uncommented
