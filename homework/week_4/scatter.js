// HEADER maken

//
window.onload = function() {



  // include data source API's
  var mammals = "http://stats.oecd.org/SDMX-JSON/data/WILD_LIFE/TOT_KNOWN+THREATENED+THREAT_PERCENT.MAMMAL.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA/all?&dimensionAtObservation=allDimensions"
  var birds = "http://stats.oecd.org/SDMX-JSON/data/WILD_LIFE/TOT_KNOWN+THREATENED+THREAT_PERCENT.BIRD.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA/all?&dimensionAtObservation=allDimensions"

  // ensure both data sets are loaded before continueing
  d3.queue()
    .defer(d3.request, mammals)
    .defer(d3.request, birds)
    .awaitAll(goGoGo);

  function goGoGo(error, response) {

    // ensure
    if (error) throw error;

    // console.log(response[0])

    // Use response
    var mammalsJSON = JSON.parse(response[0].responseText)
    var birdsJSON = JSON.parse(response[1].responseText)
    console.log(mammalsJSON)
    // console.log(birdsJSON)


    // ergens hiervoor ook nog de lijst met landen onthouden
    var countries = mammalsJSON.structure.dimensions.observation[2].values
    var countryLength = countries.length
    // console.log(countries)
    // console.log(countryLength)



    // console.log(mammalsJSON)
    // console.log(mammalsJSON.dataSets[0].observations)
    var mammalsReady = mammalsJSON.dataSets[0].observations
    var birdsReady = birdsJSON.dataSets[0].observations
    // console.log(mammalsReady)
    // console.log(birdsReady)
    // dit is nu een soort hele grote dict op zichzelf

    // dit werkt nog niet: zegt undefined
    // je wil eigenlijk de 1e van de array die als value in elke observatie zit
    // var totalSpeciesMammals = mammalsReady[0]
    // console.log(totalSpeciesMammals)
    // totalThreatMammals =
    // percentageThreatMammals =

    // object createn met de hierbovenstaande waarden als values bij geschikte dicts
    // console.log(totalSpeciesMammals)

    var arryBirds = []
    var arryMammals = []
    var counterarry = []
    var counter = 0
    var counterM = 0
    var counterMa = []


    // 10 landen
    for (i = 0; i < 3; i++) {
      for (k = 0; k < 10; k++) {
        var iets = i + ":" + 0 + ":" + k
        // console.log(iets);
        // console.log(birdsReady[iets])
        if (birdsReady[iets]) {
              arryBirds.push(birdsReady[iets][0])
        }
        else {
          counter += 1
          counterarry.push(iets)
        }
        if (mammalsReady[iets]) {
          arryMammals.push(mammalsReady[iets][0])
        }
        else {
          counterM += 1
          counterMa.push(iets)
        }
      }
    }
    // console.log(arryBirds)
    // console.log(arryMammals)
    arryLengthB = arryBirds.length
    arryLengthM = arryMammals.length
    // console.log(arryLengthB)
    // console.log(arryLengthM)
    // console.log(counterMa)
    // console.log(arryLength)
    // console.log(counter)
    // console.log(counterarry)

    var dictArry = []
    // console.log(dictArry)

    for (i = 0; i < countryLength; i++) {
      var countryDict = {
        "country": countries[i].name,
        "totalSpeciesMammals": arryMammals[i],
        "threatenedSpeciesMammals": arryMammals[i + 10],
        "percentageMammals": arryMammals[i + 20],
        "totalSpeciesBirds": arryBirds[i],
        "threatenedSpeciesBirds": arryBirds[i + 10],
        "percentageBirds": arryBirds[i + 20]
      }
      dictArry.push(countryDict)
    }

  console.log(dictArry)

  // hierbij nog selection invoeren based on button
//   makeGraph(dictArry);
// }
//
// // function makeGraph(dictArry, selection){
//

  var selection = "Mammals"

  // link to data source
  var link;
  d3.select("body")
    .append("p")
    .attr("class", "link")
    .text("Original dataset can be found here!");

  // add graph title
  var title;
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

  // get max and min values of variables for scaling
  var arryTotalBirds = arryBirds.slice(0,10)
  console.log(arryTotalBirds)
  var arryThreatBirds = arryBirds.slice(10,20)
  console.log(arryThreatBirds)
  var arryPercentageBirds = arryBirds.slice(20,)
  console.log(arryPercentageBirds)

  var minValueTotalBirds = Math.min.apply(Math, arryTotalBirds) - 15
  var maxValueTotalBirds = Math.max.apply(Math, arryTotalBirds) + 15

  var minValueThreatBirds = Math.min.apply(Math, arryThreatBirds)
  var maxValueThreatBirds = Math.max.apply(Math, arryThreatBirds) + 15

  // var minValuePercBirds = Math.min.apply(Math, arryPercentageBirds) - 20
  // var maxValuePercBirds = Math.max.apply(Math, arryPercentageBirds) + 20

  var arryTotalMammals = arryMammals.slice(0,10)
  console.log(arryTotalMammals)
  var arryThreatMammals = arryMammals.slice(10,20)
  console.log(arryThreatMammals)
  var arryPercentageMammals = arryMammals.slice(20,)
  console.log(arryPercentageMammals)

  var minValueTotalMammals = Math.min.apply(Math, arryTotalMammals) - 15
  var maxValueTotalMammals = Math.max.apply(Math, arryTotalMammals) + 15

  var minValueThreatMammals = Math.min.apply(Math, arryThreatMammals)
  var maxValueThreatMammals = Math.max.apply(Math, arryThreatMammals) + 15

  // var minValuePercMammals = Math.min.apply(Math, arryPercentageMammals)
  // var maxValuePercMammals = Math.max.apply(Math, arryPercentageMammals)


  console.log(minValueTotalBirds)
  console.log(maxValueTotalBirds)
  console.log(minValueThreatBirds)
  console.log(maxValueThreatBirds)
  // console.log(minValuePercBirds)
  // console.log(maxValuePercBirds)

  console.log(minValueTotalMammals)
  console.log(maxValueTotalMammals)
  console.log(minValueThreatMammals)
  console.log(maxValueThreatMammals)
  // console.log(minValuePercMammals)
  // console.log(maxValuePercMammals)

  // consider margin to place axis labels in within svg
  var totalWidth = 1070;
  var totalHeight = 700;
  var margin = {left: 100, top: 10, right: 200, bottom: 200};

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

  var yDomainSelection, xDomainSelection;
  if (selection == 'Birds'){
    yDomainSelection = [maxValueThreatBirds, minValueThreatBirds]
    xDomainSelection = [minValueTotalBirds, maxValueTotalBirds]
  }
  else {
    yDomainSelection = [maxValueThreatMammals, minValueThreatMammals]
    xDomainSelection = [minValueTotalMammals, maxValueTotalMammals]
  }

  // function for scaling y-values from data to graph area
  var yScale = d3.scale.linear()
                       .domain(yDomainSelection)
                       .range([margin.top, totalHeight - margin.bottom]);

  var xScale = d3.scale.linear()
                       .domain(xDomainSelection)
                       .range([0, graphWidth])

 // create and draw y-axis (nog niet te zien)
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
                  .attr()
                  .html(function(d) {
                    var tooltipText = "<strong>Country: </strong><span>" + d.country + "</span>" + "<br>",
                    tooltipThreat = "<strong>Number of threatened species: </strong><span>" + d["threatenedSpecies" + selection] + "</span>" + "<br>",
                    tooltipTotal = "<strong>Total number of species: </strong><span>" + d["totalSpecies" + selection] + "</span>" + "<br>",
                    tooltipPerc = "<strong>Percentage threatened species: </strong><span>" + d["percentage" + selection] + "%</span>" + "<br>"

                    return tooltipText + tooltipThreat + tooltipTotal + tooltipPerc
                  });
  svg.call(tooltip);

  console.log(dictArry[0]["totalSpecies" + selection])
  console.log(xScale(dictArry[0]["totalSpecies" + selection]))

  // draw bars of bar chart
  svg.selectAll("circle")
     .data(dictArry)
     .enter()
     .append("circle")
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
     .attr("r", 5)
     .on('mouseover', tooltip.show)
     .on('mouseout', tooltip.hide);

  // add y-axis label
  svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x", 0 - graphHeight / 2)
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .style("font-size", "25px")
     .text("Number of threatened species");

  // add x-axis label
  svg.append("text")
     .attr("y", totalHeight - 50)
     .attr("x", graphWidth / 2)
     .attr("text-anchor", "middle")
     .style("font-size", "25px")
     .text("Total number of species")

 // add personal info to page
 d3.select("body")
   .append("p")
   .attr("class", "info")
   .text("Rebecca de Feijter - 10639918 - Data Processing");

 // add info about dataset to page
 d3.select("body")
   .append("p")
   .attr("class", "info")
   .text("This graph shows the runtimes of the Lord of the Rings and The \
       Hobbit movies. Upon hovering over the bar for a movie or movie \
       series, other fun facts about the movies will display. \
       The data was aqcuired for this assignment via Kaggle. The data \
       is based on info from wikipedia pages about the movies.");

  // add color legend to svg
  var legendX = graphWidth + 10

  svg.append("rect")
    .attr("class", "legend high")
    .attr("y", graphHeight / 3)
    .attr("x", legendX);

  svg.append("text")
    .attr("class", "legendText")
    .attr("y", graphHeight / 3 + 12)
    .attr("x", legendX + 35)
    .text(">30% threatened");

  svg.append("rect")
    .attr("class", "legend medium")
    .attr("y", graphHeight / 3 + 20)
    .attr("x", legendX);

  svg.append("text")
    .attr("class", "legendText")
    .attr("y", graphHeight / 3 + 20 + 12)
    .attr("x", legendX + 35)
    .text("20-30% threatened");

  svg.append("rect")
      .attr("class", "legend low")
      .attr("y", graphHeight / 3 + 40)
      .attr("x", legendX);

  svg.append("text")
    .attr("class", "legendText")
    .attr("y", graphHeight / 3 + 40 + 12)
    .attr("x", legendX + 35)
    .text("0-20% threatened");
  };
};
