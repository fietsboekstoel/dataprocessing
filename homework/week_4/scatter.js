/** Rebecca de Feijter - 10639918
* Data Processing - Week 4 - Scatter plot
*
* Javascript code file processing data and drawing graph
*
* Creates a scatter plot from an imported JSON about mammal and bird species per
* country,and the amount of endangered species per country. Data points in the
* graph represent countries, their x-value represents the amount of known species
* in the country, y-value represents amount of endangered species, and data points
* are color coded according to ratio between those variables.
*
* Graph includes an x-axis, a y-axis, axis labels, a graph title, a legend and a
* description of the data.
*
* Graph is interactive; upon hovering over a data point, it will display its
* precise values, as well as the country name. By clicking the "Mammals" or
* "Birds" button, one can switch between data about both classes of animals.
**/

// ensure program is executed when window has loaded
window.onload = function() {

  // include data source API's
  var mammals = "https://stats.oecd.org/SDMX-JSON/data/WILD_LIFE/TOT_KNOWN+THREATENED+THREAT_PERCENT.MAMMAL.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA/all?&dimensionAtObservation=allDimensions"
  var birds = "https://stats.oecd.org/SDMX-JSON/data/WILD_LIFE/TOT_KNOWN+THREATENED+THREAT_PERCENT.BIRD.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA/all?&dimensionAtObservation=allDimensions"

  // ensure both data sets are loaded before continuing
  d3.queue()
    .defer(d3.request, mammals)
    .defer(d3.request, birds)
    .awaitAll(processData);

    // introduce global variables
    var dictArray = []
    var arrayBirds = []
    var arrayMammals = []

  // process data JSONs into right format for further use
  function processData(error, response) {

    // ensure no error has occurred
    if (error) throw error;

    // parse response JSON
    var mammalsJSON = JSON.parse(response[0].responseText)
    var birdsJSON = JSON.parse(response[1].responseText)

    // acquire country names from JSON
    var countries = mammalsJSON.structure.dimensions.observation[2].values
    var countryLength = countries.length

    // acquire variable values from JSON
    var mammalsReady = mammalsJSON.dataSets[0].observations
    var birdsReady = birdsJSON.dataSets[0].observations

    var numberOfVariables = 3

    var counterarray = []
    var counter = 0
    var counterM = 0
    var counterMa = []


    // create array including all three variable values per animal class
    for (i = 0; i < numberOfVariables; i++) {
      for (k = 0; k < countryLength; k++) {
        var key = i + ":" + 0 + ":" + k

        // ensure bird data has no missing data
        if (birdsReady[key]) {
              arrayBirds.push(birdsReady[key][0])
        }

        // raise error in case of missing data
        else {
          new Error("Missing data detected in bird data")
        }

        // ensure mammal data has no missing data
        if (mammalsReady[key]) {
          arrayMammals.push(mammalsReady[key][0])
        }

        // raise error in case of missing data
        else {
          new Error("Missing data detected in mammal data")
        }
      }
    }

    // convert data from array of values to array of dicts per country
    for (i = 0; i < countryLength; i++) {
      var countryDict = {
        "country": countries[i].name,
        "totalSpeciesMammals": arrayMammals[i],
        "threatenedSpeciesMammals": arrayMammals[i + 10],
        "percentageMammals": arrayMammals[i + 20],
        "totalSpeciesBirds": arrayBirds[i],
        "threatenedSpeciesBirds": arrayBirds[i + 10],
        "percentageBirds": arrayBirds[i + 20]
      }
      dictArray.push(countryDict)
    }

    // randomly choose either birds or mammals as first display
    if (Math.random() < 0.5) {
      makeGraph("Birds")
    }
    else {
      makeGraph("Mammals")
    }
  }

  // draw actual graph
  function makeGraph(selection){

    // add graph title depending on data (birds/mammals)
    d3.select("body")
      .append("h1")
      .attr("class", "title")
      .text(function() {
        if (selection == "Birds") {
          title = "Relation between total number of bird species and number of threatened bird species per country"
        }
        else {
          title = "Relation between total number of mammal species and number of threatened mammal species per country"
        }
        return title
      });

    // divide array of combined variables into seperate arrays per variable
    var arrayTotalBirds = arrayBirds.slice(0,10)
    var arrayThreatBirds = arrayBirds.slice(10,20)
    var arrayPercentageBirds = arrayBirds.slice(20,)

    var arrayTotalMammals = arrayMammals.slice(0,10)
    var arrayThreatMammals = arrayMammals.slice(10,20)
    var arrayPercentageMammals = arrayMammals.slice(20,)

    // determine highest and lowest value of x and y variables for scaling
    var minValueTotalBirds = Math.min.apply(Math, arrayTotalBirds) - 15
    var maxValueTotalBirds = Math.max.apply(Math, arrayTotalBirds) + 15

    var minValueThreatBirds = Math.min.apply(Math, arrayThreatBirds) - 15
    var maxValueThreatBirds = Math.max.apply(Math, arrayThreatBirds) + 15

    var minValueTotalMammals = Math.min.apply(Math, arrayTotalMammals) - 15
    var maxValueTotalMammals = Math.max.apply(Math, arrayTotalMammals) + 15

    var minValueThreatMammals = Math.min.apply(Math, arrayThreatMammals)
    var maxValueThreatMammals = Math.max.apply(Math, arrayThreatMammals) + 15

    // consider size of svg and margin to place axis labels in within svg
    var totalWidth = 1070;
    var totalHeight = 700;
    var margin = {left: 100, top: 10, right: 200, bottom: 150};

    // define variables for width and height of graph (rather than the svg)
    var graphWidth = totalWidth - margin.left - margin.right;
    var graphHeight = totalHeight - margin.top - margin.bottom;

    // create svg to draw on
    var svg = d3.select("body")
                .append("svg")
                .attr("class", "graph")
                .attr("width", totalWidth)
                .attr("height", totalHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // use the right minimal and maximal value based on data (birds/mammals)
    var yDomainSelection, xDomainSelection;
    if (selection == "Birds"){
      yDomainSelection = [maxValueThreatBirds, minValueThreatBirds]
      xDomainSelection = [minValueTotalBirds, maxValueTotalBirds]
    }
    else {
      yDomainSelection = [maxValueThreatMammals, minValueThreatMammals]
      xDomainSelection = [minValueTotalMammals, maxValueTotalMammals]
    }

    // functions for scaling x and y values from data to graph area
    var yScale = d3.scale.linear()
                         .domain(yDomainSelection)
                         .range([margin.top, totalHeight - margin.bottom]);

    var xScale = d3.scale.linear()
                         .domain(xDomainSelection)
                         .range([0, graphWidth])

   // create and draw y and x axis
   var yAxis = d3.svg.axis()
                     .scale(yScale)
                     .orient("left");
   svg.append("g")
      .attr("class", "axis")
      .call(yAxis);

   var xAxis = d3.svg.axis()
                     .scale(xScale)
                     .orient("bottom");
   svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (graphHeight + margin.top) + ")")
      .call(xAxis)

    // create and call tooltip to appear when hovering on data point
    var tooltip = d3.tip()
                    .attr('class', 'tooltip')
                    .html(function(d) {
                      var tooltipText = "<strong>Country: </strong><span>" + d.country + "</span>" + "<br>",
                      tooltipThreat = "<strong>Number of threatened species: </strong><span>" + d["threatenedSpecies" + selection] + "</span>" + "<br>",
                      tooltipTotal = "<strong>Total number of species: </strong><span>" + d["totalSpecies" + selection] + "</span>" + "<br>",
                      tooltipPerc = "<strong>Percentage threatened species: </strong><span>" + d["percentage" + selection] + "%</span>" + "<br>"

                      return tooltipText + tooltipThreat + tooltipTotal + tooltipPerc
                    });
    svg.call(tooltip);

    // draw dots/data points of scatter plot based on data (birds/mammals)
    svg.selectAll("circle")
       .data(dictArray)
       .enter()
       .append("circle")

       // add class of data point for color based on 3rd variable of percentage
       .attr("class", function(d) {
         if (d["percentage" + selection] >= 30) {
           return "high"
         }
         else if (d["percentage" + selection] >= 20 && d["percentage" + selection] < 30) {
           return "medium"
         }
         else {
           return "low"
         }
       })
       .attr("cx", function(d) {
          return xScale(d["totalSpecies" + selection]);
        })
       .attr("cy", function(d) {
          return yScale(d["threatenedSpecies" + selection]);
        })
       .attr("r", 7)
       .on('mouseover', tooltip.show)
       .on('mouseout', tooltip.hide);

    // add y-axis label
    svg.append("text")
       .attr("class", "axisLabel")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - graphHeight / 2)
       .attr("dy", "1em")
       .text("Number of threatened species");

    // add x-axis label
    svg.append("text")
       .attr("class", "axisLabel")
       .attr("y", totalHeight - 70)
       .attr("x", graphWidth / 2)
       .text("Total number of species");

     // add color legend to svg
    var legendX = graphWidth + 20

    // colored rectangle and text for high percentages
    svg.append("rect")
       .attr("class", "legend high")
       .attr("y", graphHeight / 3)
       .attr("x", legendX);

    svg.append("text")
       .attr("class", "legendText")
       .attr("y", graphHeight / 3 + 12)
       .attr("x", legendX + 35)
       .text(">30% threatened");

    // colored rectangle and text for medium percentages
    svg.append("rect")
       .attr("class", "legend medium")
       .attr("y", graphHeight / 3 + 20)
       .attr("x", legendX);

    svg.append("text")
       .attr("class", "legendText")
       .attr("y", graphHeight / 3 + 20 + 12)
       .attr("x", legendX + 35)
       .text("20-30% threatened");

    // colored rectangle and text for low percentages
    svg.append("rect")
         .attr("class", "legend low")
         .attr("y", graphHeight / 3 + 40)
         .attr("x", legendX);

    svg.append("text")
       .attr("class", "legendText")
       .attr("y", graphHeight / 3 + 40 + 12)
       .attr("x", legendX + 35)
       .text("0-20% threatened");

    // add personal info to page
    d3.select("body")
      .append("p")
      .attr("class", "info")
      .text("Rebecca de Feijter - 10639918 - Data Processing");

    // add info about dataset to page
    d3.select("body")
      .append("p")
      .attr("class", "info")
      .text("The graphs on this page show the amount of mammal and bird \
            species living in a set of ten countries, as well as how many of \
            those species are threatened. The percentages of threatened \
            species are also represented by the colors of the data points \
            (see legend). Upon hovering over a data point, the exact values \
            for the variables of that country as well as the country name, are \
            displayed. By clicking the Mammals-button or the Birds-button, \
            the graph will switch between data about those two classes of \
            animals. The data was aqcuired for this assignment via the website \
            of the Organisation for Economic Co-operation and Development.");

     // function for clearing the page
     function clearGraph() {
       d3.select("svg")
         .remove()
       d3.select("h1")
         .remove()
       d3.selectAll("p")
         .remove()
     }

     // clear page and draw new graph upon clicking either button
     document.getElementById("mammalButton").onclick = function() {
       clearGraph();
       makeGraph("Mammals");
     };
     document.getElementById("birdButton").onclick = function() {
       clearGraph();
       makeGraph("Birds");
     };

  };

};
