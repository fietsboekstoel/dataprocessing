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

  // introduce general dictionaries per class of animals
  var mammals, birds, amphibians, classDict, numberOfCountries, svg;
  var countriesArray = [];
  var numberOfVariables = 4;

  // ensure both data sets are loaded before continuing
  d3.queue()
    .defer(d3.csv, "mammals.csv")
    .defer(d3.csv, "birds.csv")
    .defer(d3.csv, "amphibians.csv")
    .awaitAll(processData);

  // define certain variables needed for drawing plots
  // hier kan de tussenstap nog weg misschien (in classDict response[0] zetten)
  function processData(error, response) {
    if (error) throw error;
    mammals = response[0];
    birds = response[1];
    amphibians = response[2];

    // combine country names in array for drawing x-axis
    numberOfCountries = mammals.length / numberOfVariables;
    for (i = 0; i < numberOfCountries * numberOfVariables; i+=numberOfVariables) {
      // var countryName = mammals[i].Country
      countriesArray.push(mammals[i].Country)
    };



    classDict = []
    for (i = 0; i < numberOfCountries; i++) {
      var countryDict = {"country": mammals[i * 4].Country,
                         "mammals": mammals[i * 4].Value,
                         "birds" : birds[i * 4].Value,
                         "amphibians" : amphibians[i * 4].Value
                          }
      classDict.push(countryDict)
    };

    makeBarPlot(classDict);
    };


  function makeBarPlot(data) {

    // add graph title
    d3.select("#barSvg")
      .append("h1")
      .attr("class", "title")
      .text("Number of mammal, bird and amphibian species per country");

    // consider size of svg and margin to place axis labels in within svg
    // var totalWidth = 870;
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
    for (i = 0; i < numberOfCountries * numberOfVariables; i += numberOfVariables) {
      mammalValue = mammals[i].Value
      birdValue = birds[i].Value
      amphiValue = amphibians[i].Value
      maxValueArray.push(parseInt(mammalValue) + parseInt(birdValue) + parseInt(amphiValue))
    };
    var maxValue = Math.max.apply(Math, maxValueArray)


    // create svg to draw on
    svg = d3.select('#barSvg')
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
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(20);
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
                    .attr('class', 'tooltipBar')
                    .html(function(d) {
                      var tooltipTextClass = "<strong>Class: </strong><span>" + d.z + "</span>" + "<br>",
                      tooltipTextValue = "<strong>Number of species: </strong><span>" + d.y + "</span>" + "<br>" + "<br>",
                      tooltipExtra = "<strong>Click here to learn how many of these species are endangered!</strong>"

                      return tooltipTextClass + tooltipTextValue + tooltipExtra
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

    // Create groups for each series, rects for each segment
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
       .text("Total number of species");

    // add x-axis label
    svg.append("text")
       .attr("class", "axisLabel")
       .attr("y", totalHeight - 30)
       .attr("x", barPlotWidth / 2)
       .text("Countries");



      // add color legend to svg
     var legendX = barPlotWidth + 20

     // colored rectangle and text for high percentages
     svg.append("rect")
        .attr("class", "legend amphibian")
        .attr("y", barPlotHeight / 3)
        .attr("x", legendX);

     svg.append("text")
        .attr("class", "legendText")
        .attr("y", barPlotHeight / 3 + 12)
        .attr("x", legendX + 35)
        .text("Bird species");

     // colored rectangle and text for medium percentages
     svg.append("rect")
        .attr("class", "legend mammal")
        .attr("y", barPlotHeight / 3 + 20)
        .attr("x", legendX);

     svg.append("text")
        .attr("class", "legendText")
        .attr("y", barPlotHeight / 3 + 20 + 12)
        .attr("x", legendX + 35)
        .text("Mammal species");

     // colored rectangle and text for low percentages
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
            Development.");

    var rect = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.x); })
      .attr("y", function(d) { return yScale(d.y0 + d.y); })
      .attr("height", function(d) { return yScale(d.y0) - yScale(d.y0 + d.y); })
      .attr("width", xScale.rangeBand())
      .on('mouseover', tooltipBar.show)
      .on('mouseout', tooltipBar.hide)
      // hieronder moet kloppen om goede getallen voor pie te krijgen, nu altijd amphibians
      .on('click', function(d, i) {
        makePieChart(d.x , d.z)});

  };


  function makePieChart(whichCountry, whichClassString) {

    if (whichClassString == "birds") {
      whichClass = birds;
    }
    else if (whichClassString == "mammals") {
      whichClass = mammals;
    }
    else {
      whichClass = amphibians;
    };

    var totalSpecies, endangered, critically, vulnerable, doingFine;
    for (i = 0; i < numberOfVariables * numberOfCountries; i+=4) {

      if (whichClass[i].Country == whichCountry) {
        totalSpecies = whichClass[i].Value

        // dit worden de waardes in de pie (met totaal min de andere 3 als de rest)
        endangered = whichClass[i + 1].Value
        critically = whichClass[i + 2].Value
        vulnerable = whichClass[i + 3].Value
        doingFine = totalSpecies - endangered - critically - vulnerable;
      }
    }

    endangeredPercent = Math.round(endangered / totalSpecies * 1000) / 10;
    criticallyPercent = Math.round(critically / totalSpecies * 1000) / 10;
    vulnerablePercent = Math.round(vulnerable / totalSpecies * 1000) / 10;
    doingFinePercent = Math.round((100 - endangeredPercent - criticallyPercent - vulnerablePercent) * 10) / 10;


    var pieWidth =  d3.select("#barSvg")[0][0].clientWidth;
    var pieHeight = pieWidth;
    var pieRadius = pieWidth / 4;
    var pieColors = ["#e7298a", "#ce1256", "#980043", "#67001f"];

    pieDictArray = [
      {"label": "Not endangered", "number": doingFine, "percentage": doingFinePercent},
      {"label": "Vulnerable", "number": vulnerable, "percentage": vulnerablePercent},
      {"label": "Endangered", "number": endangered, "percentage": endangeredPercent},
      {"label": "Critically endangered", "number": critically, "percentage": criticallyPercent}];


    var svgPie = d3.select("#pieSvg")
                .append("svg")
                .data([pieDictArray])
                .attr("width", pieWidth)
                .attr("height", pieHeight)
                .attr("class", "pieSvg")
                .append("g")
                .attr("transform", "translate(" + pieWidth * 0.5 + "," + pieHeight * 0.4 + ")");


    var pie = d3.layout.pie()
                .value(function(d){
                  return d.percentage;
                });

    // Declare an arc generator function
    var arc = d3.svg.arc()
                    .outerRadius(pieRadius);

    // create and call tooltip to appear when hovering on data point
    var tooltipPie = d3.tip()
                    .attr('class', 'tooltipPie')
                    .html(function(d) {
                      var tooltipTextValue = "<strong>Number of species: </strong><span>" + d.data.number + "</span>" + "<br>"

                      return tooltipTextValue
                    });
    svgPie.call(tooltipPie);

    // Select paths, use arc generator to draw
    var arcs = svgPie.selectAll("g.slice")
                  .data(pie)
                  .enter()
                  .append("g")
                  .attr("class", "slice")
                  .on('mouseover', tooltipPie.show)
                  .on('mouseout', tooltipPie.hide)
                  .on('mousemove', function() {
                    mouseX = d3.event.clientX;
                    mouseY = d3.event.clientY;
                    tooltipPie.style("top", mouseY + "px");
                    tooltipPie.style("left", mouseX + "px");
                  });

    arcs.append("path")
        .attr("fill", function(d, i){
          return pieColors[i];
        })
        .attr("d", function (d) {
          return arc(d);
        });

    // Add the text
    arcs.append("text")
        .attr("transform", function(d){
            d.innerRadius = pieRadius * 1.5;
            d.outerRadius = pieRadius;
            return "translate(" + arc.centroid(d) + ")";
          })
        .attr("class", "percentages")
        .attr("text-anchor", "middle")
        .text( function(d, i) {
          return pieDictArray[i].percentage + '%';
        });

    svgPie.append("text")
       .attr("class", "pieTitle")
       .attr('y', -pieHeight*0.36)
       .attr("text-anchor", "middle")
       .text("Percentages of endangered " + whichClassString.slice(0, -1) + " species in " + whichCountry + ":");

   // total number of species toevoegen als text onder pie?
   svgPie.append("text")
      .attr("class", "pieNumberInfo")
      .attr('y', pieHeight*0.36)
      .attr("text-anchor", "middle")
      .text("Total number of " + whichClassString.slice(0, -1) + " species in " + whichCountry + ": " + totalSpecies);

   // add color legend to svg
   var legendY = pieHeight - 85

  // colored rectangle and text for vulnerable species
  svgPie.append("rect")
     .attr("class", "legend vulnerable")
     .attr("y", legendY/2)
     .attr("x", pieWidth * 0.1);

  svgPie.append("text")
     .attr("class", "legendText")
     .attr("y", legendY/2 + 12)
     .attr("x", pieWidth * 0.1 + 35)
     .text("= Vulnerable");

  // colored rectangle and text for endangered species
  svgPie.append("rect")
     .attr("class", "legend endangered")
     .attr("y", legendY/2 + 40)
     .attr("x", -pieWidth * 0.2);

  svgPie.append("text")
     .attr("class", "legendText")
     .attr("y", legendY/2 + 40 + 12)
     .attr("x", -pieWidth * 0.2 + 35)
     .text("= Endangered");

 // colored rectangle and text for critically endangered species
 svgPie.append("rect")
    .attr("class", "legend critically")
    .attr("y", legendY/2 + 40)
    .attr("x", pieWidth * 0.1);

 svgPie.append("text")
    .attr("class", "legendText")
    .attr("y", legendY/2 + 40 + 12)
    .attr("x", pieWidth * 0.1 + 35)
    .text("= Critically endangered");

 // colored rectangle and text for not endangered species
 svgPie.append("rect")
    .attr("class", "legend doingFine")
    .attr("y", legendY/2)
    .attr("x", -pieWidth * 0.2);

 svgPie.append("text")
    .attr("class", "legendText")
    .attr("y", legendY/2 + 12)
    .attr("x", -pieWidth * 0.2 + 35)
    .text("= Not endangered");


  };

     // // function for clearing the page
     // function clearGraph() {
     //   d3.select("svgPie")
     //     .remove()
     // }
  //
  //    // clear page and draw new graph upon clicking either button
  //    document.getElementById("mammalButton").onclick = function() {
  //      clearGraph();
  //      makeGraph("Mammals");
  //    };
  //    document.getElementById("birdButton").onclick = function() {
  //      clearGraph();
  //      makeGraph("Birds");
  //    };
  //
  // };

};
