/** Rebecca de Feijter - 10639918
* Data Processing - Week 5/6 - Linked views
*
* Javascript code file processing data and drawing graphs with help of pie.js
*
* Creates a stacked bar graph from imported csv's about mammal, bird and
* amphibian species per country, and the amount of endangered species per
* country. Stacked bars in the graph represent countries, their height
* represents the total amount of known species in the country. Different animal
* classes contributing to that total are colored differently (see legend).
*
* Bar graph includes an x-axis, a y-axis, axis labels, a graph title, a legend
* and a description of the data.
*
* Graph is interactive; upon hovering over a component, it will display its
* precise values, as well as the animal class it concerns. By clicking the
* "Absolute number of species" or "Number of species per 1000 km2" button, one
* can switch between data that either takes country size into account or not.
* Upon clicking on a bar graph component, a pie chart will appear, containing
* information about how many species are endangered. The pie charts display
* percentages of the total amount of species per country, as well as the
* absolute number of species, when hovering over a slice of the pie chart.
**/

// ensure program is executed when window has loaded
window.onload = function() {

    // introduce necessary global variables
    var mammals, birds, amphibians, classDict, numberOfCountries, svg;
    var countriesArray = [];
    var numberOfVariables = 4;
    var svgPie, pieColors, pieHeight, pieWidth, pieRadius;

    // ensure all data sets are loaded before continuing
    d3.queue()
      .defer(d3.csv, "mammals.csv")
      .defer(d3.csv, "birds.csv")
      .defer(d3.csv, "amphibians.csv")
      .defer(d3.csv, "area.csv")
      .awaitAll(processData);

    function processData(error, response) {
        if (error) throw error;
        mammals = response[0];
        birds = response[1];
        amphibians = response[2];
        area = response[3]

        // combine country names in array for drawing x-axis
        numberOfCountries = mammals.length / numberOfVariables;
        for (i = 0; i < numberOfCountries * numberOfVariables; i+=numberOfVariables) {
            countriesArray.push(mammals[i].Country)
        };


        // combine totals of animal classes in dict
        classDict = []
        for (i = 0; i < numberOfCountries; i++) {
            var countryDict = {"country": mammals[i * 4].Country,
                               "mammals": mammals[i * 4].Value,
                               "birds": birds[i * 4].Value,
                               "amphibians": amphibians[i * 4].Value,
                               "area": area[i].area
                              }
            classDict.push(countryDict)
          };

          makeBarPlot(classDict, "areaNo");
    };


    function makeBarPlot(data, perArea) {

        // adjust values if "species per km2" button was chosen
        if (perArea == "areaYes") {
            for (i = 0; i < numberOfCountries; i++) {
                data[i].mammals = (data[i].mammals / data[i].area * 1000).toFixed(2)
                data[i].birds = (data[i].birds / data[i].area * 1000).toFixed(2)
                data[i].amphibians = (data[i].amphibians / data[i].area * 1000).toFixed(2)
            }
        };

        // add graph title
        d3.select("#barSvg")
          .append("h1")
          .attr("class", "title")
          .text("Number of mammal, bird and amphibian species per country");

        // consider size of svg and margin to place axis labels in within svg
        totalWidth = d3.select("#barSvg")[0][0].clientWidth;
        var totalHeight = 700;
        var margin = {left: 100, top: 10, right: 200, bottom: 150};

        // define variables for width and height of graph (rather than the svg)
        var barPlotWidth = totalWidth - margin.left - margin.right;
        var barPlotHeight = totalHeight - margin.top - margin.bottom;

        // determine padding and number of bars in graph
        var numberOfBars = numberOfCountries;
        var paddingWidth = 2;
        var barWidth = (barPlotWidth - paddingWidth * numberOfBars) / numberOfBars;

        // create array of all stacked values to determine max value
        var maxValueArray = [];
        for (i = 0; i < numberOfCountries; i++) {
            mammalValue = data[i].mammals
            birdValue = data[i].birds
            amphiValue = data[i].amphibians
            if (perArea == "areaYes"){
                maxValueArray.push(parseFloat(mammalValue) + parseFloat(birdValue) + parseFloat(amphiValue))
            }
            else {
                maxValueArray.push(parseInt(mammalValue) + parseInt(birdValue) + parseInt(amphiValue))
            }
        };
        var maxValue = Math.max.apply(Math, maxValueArray)


        // create svg to draw on
        svg = d3.select("#barSvg")
                .append("svg")
                .attr("class", "bar graph")
                .attr("width", totalWidth)
                .attr("height", totalHeight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // functions for scaling x and y values from data to graph area
        var yScale = d3.scale.linear()
                             .domain([maxValue, 0])
                             .range([margin.top, totalHeight - margin.bottom]);

        var xScale = d3.scale.ordinal()
                             .domain(countriesArray)
                             .rangeRoundBands([0, barPlotWidth]);

        // create and draw y-axis
        if (perArea == "areaYes") {
            var tickCount = 10
        }
        else {
            var tickCount = 20
        }
        var yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(tickCount);
        svg.append("g")
           .attr("class", "axis")
           .call(yAxis);

        // create and draw x-axis with rotated bar labels
        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom");
        svg.append("g")
           .attr("class", "axis")
           .attr("transform", "translate(0," + (barPlotHeight + margin.top) + ")")
           .call(xAxis)
           .selectAll("text")
           .attr("y", 0)
           .attr("x", 9)
           .attr("transform", "rotate(45)")
           .style("text-anchor", "start");

        // create and call tooltip to appear when hovering on data point
        var tooltipBar = d3.tip()
                        .attr("class", "tooltipBar")
                        .html(function(d) {
                            var tooltipTextClass = "<strong>Class: </strong><span>" + d.z + "</span>" + "<br>",
                            tooltipTextValue = "<strong>Number of species: </strong><span>" + d.y + "</span>" + "<br>" + "<br>",
                            tooltipExtra = "<strong>Click here to learn how many of these species are endangered!</strong>"

                            if (perArea == "areaYes") {
                                return tooltipTextClass + tooltipExtra
                            }
                            else {
                                return tooltipTextClass + tooltipTextValue + tooltipExtra
                            }
                        });
        svg.call(tooltipBar);


        // choose colors for rectangles
        var barColors = ["#df65b0", "#c994c7", "#d4b9da"]


        // Transpose the data into layers
        var dataset = d3.layout.stack()(["birds", "mammals", "amphibians"].map(function(animalClass) {
            return data.map(function(d) {
                return {x: d.country, y: +d[animalClass], z: animalClass};
            });
        }));

        // Create groups for each stacked bar
        var groups = svg.selectAll("g.speciesCount")
                        .data(dataset)
                        .enter()
                        .append("g")
                        .attr("class", "speciesCount")
                        .style("fill", function(d, i) { return barColors[i]; });

        // add y-axis label
        svg.append("text")
           .attr("class", "axisLabel")
           .attr("transform", "rotate(-90)")
           .attr("y", 0 - margin.left)
           .attr("x", 0 - barPlotHeight / 2)
           .attr("dy", "1em")
           .text(function() {
              if (perArea == "areaYes") {
                  return "Total number of species per 1000 km2"
              }
              else {
                  return "Total number of species"
              }
            });

        // add x-axis label
        svg.append("text")
           .attr("class", "axisLabel")
           .attr("y", totalHeight - 30)
           .attr("x", barPlotWidth / 2)
           .text("Countries");

        // add color legend to svg
        var legendX = barPlotWidth + 20

         // colored rectangle and text for amphibian data
         svg.append("rect")
            .attr("class", "legend amphibian")
            .attr("y", barPlotHeight / 3)
            .attr("x", legendX);

         svg.append("text")
            .attr("class", "legendText")
            .attr("y", barPlotHeight / 3 + 12)
            .attr("x", legendX + 35)
            .text("Bird species");

         // colored rectangle and text for mammal data
         svg.append("rect")
            .attr("class", "legend mammal")
            .attr("y", barPlotHeight / 3 + 20)
            .attr("x", legendX);

         svg.append("text")
            .attr("class", "legendText")
            .attr("y", barPlotHeight / 3 + 20 + 12)
            .attr("x", legendX + 35)
            .text("Mammal species");

         // colored rectangle and text for bird data
         svg.append("rect")
              .attr("class", "legend bird")
              .attr("y", barPlotHeight / 3 + 40)
              .attr("x", legendX);

         svg.append("text")
            .attr("class", "legendText")
            .attr("y", barPlotHeight / 3 + 40 + 12)
            .attr("x", legendX + 35)
            .text("Amphibian species");

        // add personal info to page
        d3.select("#barSvg")
          .append("p")
          .attr("class", "info")
          .text("Rebecca de Feijter - 10639918 - Data Processing");

        // add info about dataset to page
        d3.select("#barSvg")
          .append("p")
          .attr("class", "info")
          .text("The bar graph on this page shows the amount of bird, mammal and \
                amphibian species living in a set of ten countries. Upon clicking \
                on parts of the bar graph, a pie chart appears containing \
                information on how many of those species are vulnerable, \
                endangered and critically endangered. The number of bird species, \
                mammal species and amphibian species are represented by different \
                colors (see legend), and can be inspected by hovering over parts \
                of the bar graph. The data was aqcuired for this assignment via \
                the website of the Organisation for Economic Co-operation and \
                Development. One can choose between viewing the data either \
                considering country sizes or not, by clicking the according \
                buttons.");

        // create rects for each component of bars
        var rect = groups.selectAll("rect")
                         .data(function(d) { return d; })
                         .enter()
                         .append("rect")
                         .attr("x", function(d) { return xScale(d.x); })
                         .attr("y", function(d) { return yScale(d.y0 + d.y); })
                         .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y); })
                         .attr("width", xScale.rangeBand())
                         .on("mouseover", tooltipBar.show)
                         .on("mouseout", tooltipBar.hide)
                         .on("click", function(d, i) {
                            if (svgPie) {

                                // this would be updatePie instead of makePieChart if it worked properly
                                makePieChart(d.x, d.z)
                            }
                            else {
                                makePieChart(d.x , d.z)
                            }
                          });
    };

    // create pie chart with help of pie.js
    function makePieChart(whichCountry, whichClassString) {

        // isolate part of dataset (pie.js)
        whichClass = decideClass(whichClassString, birds, mammals, amphibians)

        // calculate percentages for isolated data (pie.js)
        pieDictArray = determinePercentages(whichCountry, whichClass, numberOfVariables, numberOfCountries)[0]
        totalSpecies = determinePercentages(whichCountry, whichClass, numberOfVariables, numberOfCountries)[1]

        // choose size and color of pie chart
        pieWidth =  d3.select("#barSvg")[0][0].clientWidth;
        pieHeight = pieWidth;
        pieRadius = pieWidth / 4;
        pieColors = ["#e7298a", "#ce1256", "#980043", "#67001f"];

        // create svg to draw pie chart on
        svgPie = d3.select("#pieSvg")
                   .append("svg")
                   .data([pieDictArray])
                   .attr("width", pieWidth)
                   .attr("height", pieHeight)
                   .attr("class", "pieSvg")
                   .append("g")
                   .attr("transform", "translate(" + pieWidth * 0.5 + "," + pieHeight * 0.4 + ")");

        // drawing pie chart and legend (pie.js)
        drawPie(svgPie, pieDictArray, pieColors, pieRadius, pieHeight, pieWidth, whichClassString, whichCountry)
        drawLegend(svgPie, pieHeight, pieWidth)
  };

    // function for updating pie chart instead of creating new one (incomplete)
    function updatePie(svgPie, whichCountry, whichClassString) {

        // isolate part of dataset (pie.js)
        whichClass = decideClass(whichClassString, birds, mammals, amphibians)

        // create new pie chart (when complete, should be drawPie pie.js)
        removePie()
        makePieChart(whichCountry, whichClassString)
        pieDictArray = determinePercentages(whichCountry, whichClass, numberOfVariables, numberOfCountries)[0]
        totalSpecies = determinePercentages(whichCountry, whichClass, numberOfVariables, numberOfCountries)[1]
        drawPie(svgPie, pieDictArray, pieColors, pieRadius, pieHeight, pieWidth, whichClassString, whichCountry)

    };

    // draw new bar graph upon clicking either button (not removing previous one yet)
    document.getElementById("areaYesButton").onclick = function() {
        makeBarPlot(classDict, "areaYes");
    };
    document.getElementById("areaNoButton").onclick = function() {
        makeBarPlot(classDict, "areaNo");
    };

};
