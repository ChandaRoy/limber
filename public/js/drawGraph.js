var chartType="VELOCITY";
//Chart type can be VELOCITY , CFD and RELEASE

// Common Values
var margin = {top: 20, right: 20, bottom: 250, left: 50},
winWidth = 600;
winHeight = 400;
// Common Values END

var createCfdChart = function(subObject,multiline,graphJSONData){

  var x = d3.scale.ordinal()
  .rangeRoundBands([0, winWidth], 0.2,0.1);

  var y = d3.scale.linear()
  .range([winHeight, 0]);

  var color = d3.scale.ordinal()
  .range(["#0000ff", "#1111ff"]);
  //var color=d3.scale.category30();

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(d3.format(".2s"));

  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
  d3.select("#modalStatusGraph").html("");

  var svg = d3.select("#modalStatusGraph").append("svg")
  .attr("width", winWidth + margin.left + margin.right)
  .attr("height", winHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  ;

  var  data=graphJSONData[subObject];

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "xAxs"; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.state = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.state[d.state.length - 1].y1;
    });

    x.domain(data.map(function(d) { return d.xAxs; }));
    y.domain([0,   Math.ceil(d3.max(data, function(d) { return (d.total); }))]);


    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + winHeight + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("dx", ".91em")
    .style("text-anchor", "end")
    .append("text");

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 5)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Value");

    var xAxs = svg.selectAll(".xAxs")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(d.xAxs) + ",0)"; });

    xAxs.selectAll("rect")
    .data(function(d) { return d.state; })
    .enter().append("rect")
    .attr("width", x.rangeBand()-30)
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); })
    .on("mouseover", function(d) {
      div.transition()
      .duration(200)
      .style("opacity", 0.9);
      div	.html(parseFloat(d.y1)-parseFloat(d.y0))
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    });
    ;
    if(stackedChart){
      var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
      .attr("x", winWidth - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

      legend.append("text")
      .attr("x", winWidth - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
    }
}

var createVelocityChart=function(subObject,stackedChart,graphJSONData){

  var x = d3.scale.ordinal()
  .rangeRoundBands([0, winWidth], 0.2,0.1);

  var y = d3.scale.linear()
  .range([winHeight, 0]);

  var color = d3.scale.ordinal()
  .range(["#f39c12", "#CA6924", "#F4D03F", "#E67E22", "#a05d56", "#F9BF3B", "#E29C45"]);
  //var color=d3.scale.category30();

  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickFormat(d3.format(".2s"));

  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
  d3.select("#modalStatusGraph").html("");

  var svg = d3.select("#modalStatusGraph").append("svg")
  .attr("width", winWidth + margin.left + margin.right)
  .attr("height", winHeight + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  ;

  var  data=graphJSONData[subObject];

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "xAxs"; }));

    data.forEach(function(d) {
      var y0 = 0;
      d.state = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
      d.total = d.state[d.state.length - 1].y1;
    });

    x.domain(data.map(function(d) { return d.xAxs; }));
    y.domain([0,   Math.ceil(d3.max(data, function(d) { return (d.total); }))]);


    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + winHeight + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("dx", ".91em")
    .style("text-anchor", "end")
    .append("text");

    svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 5)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Value");

    var xAxs = svg.selectAll(".xAxs")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(d.xAxs) + ",0)"; });

    xAxs.selectAll("rect")
    .data(function(d) { return d.state; })
    .enter().append("rect")
    .attr("width", x.rangeBand()-30)
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); })
    .on("mouseover", function(d) {
      div.transition()
      .duration(200)
      .style("opacity", 0.9);
      div	.html(parseFloat(d.y1)-parseFloat(d.y0))
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    });
    ;
    if(stackedChart){
      var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
      .attr("x", winWidth - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

      legend.append("text")
      .attr("x", winWidth - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
    }
}

//Chart type can be VELOCITY , CFD and RELEASE
function drawGraph(subObject,condition,ctype){
  $.getJSON( "/graph", function( data ) {
  if(ctype==="VELOCITY"){
    createVelocityChart(subObject,condition,data);
  }else if(ctype==="CFD"){
    createCfdChart(subObject,condition,data);
  }
  // else if(ctype==="RELEASE"){
  //   createReleaseChart(subObject,condition,data);
  // }
    // chartType=="Bar" ? createVelocityChart(subObject,condition,data):createLineGraph(subObject,condition,data);
  });
}

function drawReleaseGraph(){
  // console.log("inside release graph");
  // alert("inside release graph");
  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
          width = 660 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
          days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
          times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
          datasets = ["json/data.tsv", "json/data2.tsv"];

      var svg = d3.select("#modalStatusGraph").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      var heatmapChart = function(tsvFile) {
        d3.tsv(tsvFile,
        function(d) {
          return {
            day: +d.day,
            hour: +d.hour,
            value: +d.value
          };
        },
        function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var cards = svg.selectAll(".hour")
              .data(data, function(d) {return d.day+':'+d.hour;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return (d.hour - 1) * gridSize; })
              .attr("y", function(d) { return (d.day - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0]);

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          cards.select("title").text(function(d) { return d.value; });

          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

        });
      };

      heatmapChart(datasets[0]);

      var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
        .data(datasets);

      datasetpicker.enter()
        .append("input")
        .attr("value", function(d){ return "Dataset " + d })
        .attr("type", "button")
        .attr("class", "dataset-button")
        .on("click", function(d) {
          heatmapChart(d);
        });
}
