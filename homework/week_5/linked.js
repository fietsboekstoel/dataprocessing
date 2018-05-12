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
  var mammals, birds, amphibians, numberOfCountries;
  var countriesArray = [];
  var numberOfVariables = 4;

  // ensure both data sets are loaded before continuing
  d3.queue()
    .defer(d3.csv, "mammals.csv")
    .defer(d3.csv, "birds.csv")
    .defer(d3.csv, "amphibians.csv")
    .awaitAll(processData);

  // define certain variables needed for drawing plots
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
    makeBarPlot();
  };


  function makeBarPlot() {

    // stacked bar plot gaan schrijven op svg

    // add graph title
    d3.select("body")
      .append("h1")
      .attr("class", "title")
      .text("Number of mammal, bird and amphibian species per country");

    // consider size of svg and margin to place axis labels in within svg
    var totalWidth = 1270;
    var totalHeight = 700;
    var margin = {left: 100, top: 10, right: 400, bottom: 150};

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
    var svg = d3.select("body")
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
    var tooltip = d3.tip()
                    .attr('class', 'tooltip')
                    .html(function(d) {
                      var tooltipTextClass = "<strong>Class: </strong><span>" + d.Species + "</span>" + "<br>",
                      tooltipTextValue = "<strong>Number of species: </strong><span>" + d.Value + "</span>" + "<br>"

                      return tooltipTextClass + tooltipTextValue
                    });
    svg.call(tooltip);


    // choose colors for rectangles
    var barColors = ["#f1eef6", "#d4b9da", "#c994c7"]
    var pieColors = ["#df65b0", "#dd1c77", "#980043"]

    var birdTotalValuesArray = []

    // draw bird bars of bar chart
    svg.selectAll("rect")
       .data(birds)
       .enter()
       .append("rect")
       .attr("y", function(d) {
         if (d.IUCN == "TOT_KNOWN") {
           birdTotalValuesArray.push(yScale(d.Value))
           return yScale(d.Value)
         }
       })
       .attr("width", barWidth)
       .attr("height", function(d) {
         if (d.IUCN == "TOT_KNOWN") {
           return margin.top + barPlotHeight - yScale(d.Value)
           }
         })
       .attr("x", function(d, i) {return xScale(d.Country)})
       .attr("fill", barColors[0])
       .on('mouseover', tooltip.show)
       .on('mouseout', tooltip.hide)
       .on('click', function(d) {
         makePieChart(d.Country , "birds")
       });

    // ANDERE DELEN VAN DE STACKED BAR MAKEN

    //  // draw mammal bars of bar chart
    // svg.data(mammals)
    //    .enter()
    //    .append("rect")
    //    .attr("y", function(d, i) {
    //      if (d.IUCN == "TOT_KNOWN") {
    //        return yScale(d.Value)
    //      }
    //    })
    //    .attr("width", barWidth)
    //    .attr("height", function(d) {
    //      if (d.IUCN == "TOT_KNOWN") {
    //        return margin.top + barPlotHeight - yScale(d.Value) - birdTotalValuesArray[i]
    //        }
    //      })
    //    .attr("x", function(d, i) {return xScale(d.Country)})
    //    .attr("fill", barColors[1])
    //    .on('mouseover', tooltip.show)
    //    .on('mouseout', tooltip.hide);

    // // Create groups for each series, rects for each segment
    // var groups = svg.selectAll("g.cost")
    //   .data(countriesArray)
    //   .enter()
    //   .append("g")
    //   .attr("class", "cost")
    //   .style("fill", function(d, i) { return barColors[i]; });
    //
    // var rect = groups.selectAll("rect")
    //   .data(function(d) { return d; })
    //   .enter()
    //   .append("rect")
    //   .attr("x", function(d) { return x(d.x); })
    //   .attr("y", function(d) { return y(d.y0 + d.y); })
    //   .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    //   .attr("width", x.rangeBand())
    //   .on("mouseover", function() { tooltip.style("display", null); })
    //   .on("mouseout", function() { tooltip.style("display", "none"); })
    //   .on("mousemove", function(d) {
    //     var xPosition = d3.mouse(this)[0] - 15;
    //     var yPosition = d3.mouse(this)[1] - 25;
    //     tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
    //     tooltip.select("text").text(d.y);
  // });


  };

  function makePieChart(whichCountry, whichClass) {
    var totalSpecies, endangered, critically, vulnerable;
    console.log("dit klopt")
    console.log(whichCountry)
    for (i = 0; i < numberOfVariables * numberOfCountries; i+=4) {
      // console.log(whichClass + "[i].Country")
      console.log(birds[i].Country)
      console.log(typeof(birds[i].Country))
      console.log(typeof(whichCountry))

      if (whichClass + "[i].Country" == whichCountry) {
        console.log("ja")
        totalSpecies = whichClass + "[i].Value"

        // dit worden de waardes in de pie (met totaal min de andere 3 als de rest)
        endangered = whichClass + "[i + 1].Value"
        critically = whichClass + "[i + 2].Value"
        vulnerable = whichClass + "[i + 3].Value"
      }
      else {
        console.log("nee")
      }
    }
    console.log(vulnerable)
  };


  //
  //   // draw dots/data points of scatter plot based on data (birds/mammals)
  //   svg.selectAll("circle")
  //      .data(dictArray)
  //      .enter()
  //      .append("circle")
  //
  //      // add class of data point for color based on 3rd variable of percentage
  //      .attr("class", function(d) {
  //        if (d["percentage" + selection] >= 30) {
  //          return "high"
  //        }
  //        else if (d["percentage" + selection] >= 20 && d["percentage" + selection] < 30) {
  //          return "medium"
  //        }
  //        else {
  //          return "low"
  //        }
  //      })
  //      .attr("cx", function(d) {
  //         return xScale(d["totalSpecies" + selection]);
  //       })
  //      .attr("cy", function(d) {
  //         return yScale(d["threatenedSpecies" + selection]);
  //       })
  //      .attr("r", 7)
  //      .on('mouseover', tooltip.show)
  //      .on('mouseout', tooltip.hide);
  //
  //   // add y-axis label
  //   svg.append("text")
  //      .attr("class", "axisLabel")
  //      .attr("transform", "rotate(-90)")
  //      .attr("y", 0 - margin.left)
  //      .attr("x", 0 - graphHeight / 2)
  //      .attr("dy", "1em")
  //      .text("Number of threatened species");
  //
  //   // add x-axis label
  //   svg.append("text")
  //      .attr("class", "axisLabel")
  //      .attr("y", totalHeight - 70)
  //      .attr("x", graphWidth / 2)
  //      .text("Total number of species");
  //
  //    // add color legend to svg
  //   var legendX = graphWidth + 20
  //
  //   // colored rectangle and text for high percentages
  //   svg.append("rect")
  //      .attr("class", "legend high")
  //      .attr("y", graphHeight / 3)
  //      .attr("x", legendX);
  //
  //   svg.append("text")
  //      .attr("class", "legendText")
  //      .attr("y", graphHeight / 3 + 12)
  //      .attr("x", legendX + 35)
  //      .text(">30% threatened");
  //
  //   // colored rectangle and text for medium percentages
  //   svg.append("rect")
  //      .attr("class", "legend medium")
  //      .attr("y", graphHeight / 3 + 20)
  //      .attr("x", legendX);
  //
  //   svg.append("text")
  //      .attr("class", "legendText")
  //      .attr("y", graphHeight / 3 + 20 + 12)
  //      .attr("x", legendX + 35)
  //      .text("20-30% threatened");
  //
  //   // colored rectangle and text for low percentages
  //   svg.append("rect")
  //        .attr("class", "legend low")
  //        .attr("y", graphHeight / 3 + 40)
  //        .attr("x", legendX);
  //
  //   svg.append("text")
  //      .attr("class", "legendText")
  //      .attr("y", graphHeight / 3 + 40 + 12)
  //      .attr("x", legendX + 35)
  //      .text("0-20% threatened");
  //
  //   // add personal info to page
  //   d3.select("body")
  //     .append("p")
  //     .attr("class", "info")
  //     .text("Rebecca de Feijter - 10639918 - Data Processing");
  //
  //   // add info about dataset to page
  //   d3.select("body")
  //     .append("p")
  //     .attr("class", "info")
  //     .text("The graphs on this page show the amount of mammal and bird \
  //           species living in a set of ten countries, as well as how many of \
  //           those species are threatened. The percentages of threatened \
  //           species are also represented by the colors of the data points \
  //           (see legend). Upon hovering over a data point, the exact values \
  //           for the variables of that country as well as the country name, are \
  //           displayed. By clicking the Mammals-button or the Birds-button, \
  //           the graph will switch between data about those two classes of \
  //           animals. The data was aqcuired for this assignment via the website \
  //           of the Organisation for Economic Co-operation and Development.");
  //
  //    // function for clearing the page
  //    function clearGraph() {
  //      d3.select("svg")
  //        .remove()
  //      d3.select("h1")
  //        .remove()
  //      d3.selectAll("p")
  //        .remove()
  //    }
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
