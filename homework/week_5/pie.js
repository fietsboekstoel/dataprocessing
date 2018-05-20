/** Rebecca de Feijter - 10639918
* Data Processing - Week 5/6 - Linked views
*
* Javascript code file helping linked.js to draw pie charts
*
* Bar graphs in linked.js are interactive; upon clicking on a bar graph
* component, a pie chart will appear, containing information about how many
* species are endangered. The pie charts display percentages of the total
* amount of species per country, as well as the absolute number of species,
* when hovering over a slice of the pie chart.
**/

function decideClass(whichClassString, birds, mammals, amphibians) {

    if (whichClassString == "birds") {
        whichClass = birds;
    }
    else if (whichClassString == "mammals") {
        whichClass = mammals;
    }
    else {
        whichClass = amphibians;
    }
    return whichClass
};


function determinePercentages(whichCountry, whichClass, numberOfVariables, numberOfCountries) {
    var totalSpecies, endangered, critically, vulnerable, doingFine;

    for (i = 0; i < numberOfVariables * numberOfCountries; i+=4) {
        if (whichClass[i].Country == whichCountry) {
            totalSpecies = whichClass[i].Value
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

    // combine absolute numbers and percentages in list of dicts
    pieDictArray = [
    {"label": "Not endangered", "number": doingFine, "percentage": doingFinePercent},
    {"label": "Vulnerable", "number": vulnerable, "percentage": vulnerablePercent},
    {"label": "Endangered", "number": endangered, "percentage": endangeredPercent},
    {"label": "Critically endangered", "number": critically, "percentage": criticallyPercent}];

    return [pieDictArray, totalSpecies]
};



function drawPie(svgPie, pieDictArray, pieColors, pieRadius, pieHeight, pieWidth, whichClassString, whichCountry) {

    var pie = d3.layout.pie()
                       .value(function(d){
                          return d.percentage;
                        });

    // create an arc generator function
    var arc = d3.svg.arc()
                    .outerRadius(pieRadius);

    // create and call tooltip to appear when hovering on data point
    var tooltipPie = d3.tip()
                       .attr("class", "tooltipPie")
                       .html(function(d) {
                          var tooltipTextValue = "<strong>Number of species: </strong><span>" + d.data.number + "</span>" + "<br>"

                          return tooltipTextValue
                        });
    svgPie.call(tooltipPie);

    // select draw parts/slices/paths, use arc generator to draw
    var arcs = svgPie.selectAll("g.slice")
                     .data(pie)
                     .enter()
                     .append("g")
                     .attr("class", "slice")
                     .on("mouseover", tooltipPie.show)
                     .on("mouseout", tooltipPie.hide)
                     .on("mousemove", function() {
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

    // add percentages as text
    arcs.append("text")
        .attr("transform", function(d){
            d.innerRadius = pieRadius * 1.5;
            d.outerRadius = pieRadius;
            return "translate(" + arc.centroid(d) + ")";
          })
        .attr("class", "percentages")
        .attr("text-anchor", "middle")
        .text( function(d, i) {
            return pieDictArray[i].percentage + "%";
        });

    // append pie chart title and description of total number of species
    svgPie.append("text")
          .attr("class", "pieTitle")
          .attr("y", -pieHeight*0.36)
          .attr("text-anchor", "middle")
          .text("Percentages of endangered " + whichClassString.slice(0, -1) + " species in " + whichCountry + ":");

     svgPie.append("text")
           .attr("class", "pieNumberInfo")
           .attr("y", pieHeight*0.36)
           .attr("text-anchor", "middle")
           .text("Total number of " + whichClassString.slice(0, -1) + " species in " + whichCountry + ": " + totalSpecies);

};



function drawLegend(svgPie, pieHeight, pieWidth) {

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

// imcomplete; does not suffice for drawing a new graph yet
function removePie() {

    d3.selectAll("g.slice")
      .remove()
    d3.selectAll("path")
      .remove()
    d3.select("text.pieTitle")
      .remove()
    d3.select("text.pieNumberInfo")
      .remove()
};
