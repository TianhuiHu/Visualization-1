function init(){
 // whitespace on either side of the bars in units of MPG
    var binmargin = 5; 
    var numbins = 8;
    var margin = {top: 60, right: 50, bottom: 40, left: 60};
    var width = 1100 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;

        var direction ="",
        oldx =0,
        count=0,mousemovemethod = function(e) {
          if(e.pageX > oldx){
            direction ="right";
            numbins = 6;
            d3.select("svg").remove();
            d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     bar(csvdata,'SATCriticalReadingAvgScore','#critical');     
      });
          }
          else if(e.pageX < oldx){
            direction ="left";
            numbins = 10;
            d3.select("svg").remove();
            d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     bar(csvdata,'SATCriticalReadingAvgScore','#critical');     
      });
          }

          oldx = e.pageX;
        };

  
// Read in .csv data and make graph
d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
        //d3.selectAll("#critical").style('display', 'inline');
        //d3.selectAll("#math").style('display', 'none');
     bar(csvdata,'SATCriticalReadingAvgScore','#critical');
     /*bar(csvdata,'SATMathAvgScore','#math');
     bar(csvdata,'SATWritingAvgScore','#write');
     pie(csvdata,'SATCriticalReadingAvgScore','#piecritical');
     pie(csvdata,'SATMathAvgScore','#piemath');
     pie(csvdata,'SATWritingAvgScore','#piewrite');*/
     
});
function parser(d) {
    d.SATCriticalReadingAvgScore = +d.SATCriticalReadingAvgScore;
    d.SATMathAvgScore = +d.SATMathAvgScore;
    d.SATWritingAvgScore = +d.SATWritingAvgScore;
    return d;
}
/*function move() {
  d3.select("svg").remove();
   bar(csvdata,'SATCriticalReadingAvgScore','#critical',6);
    var list = document.getElementById(data_value.slice(1));
    var x_child = document.getElementsByClassName(data_value.slice(1));
    list.removeChild(x_child);
  }*/


function bar(csvdata,param,id) {
  document.getElementById("root").addEventListener("mousemove", mousemovemethod, false);
    var minbin = d3.min(csvdata, function(d) { return d[param]; });
    var maxbin = d3.max(csvdata, function(d) { return d[param]; });
    var binsize = (maxbin - minbin) / numbins;
   
    // Set the limits of the x axis
    var xmin = minbin - 1
    var xmax = maxbin + 1

    histdata = new Array(numbins);
    for (var i = 0; i < numbins; i++) {
    histdata[i] = { numfill: 0, meta: "",min:maxbin,max:minbin };
  }
     csvdata.forEach(function(d) {
    var bin = Math.floor((d[param] - minbin) / binsize);
    if ((bin.toString() != "NaN") && (bin < histdata.length)) {
      histdata[bin].numfill += 1;
      histdata[bin].meta += "<tr><td>" + d[param] +"</td>"
        /*"</td><td>" + d.Year + "</td><td>"+d.Rating + 
        "</td><td>" + 
        d.Time + " minutes</td>*/"</tr>";
        if(d[param] < histdata[bin].min){
            histdata[bin].min = d[param];
        }
        if(d[param] > histdata[bin].max){
            histdata[bin].max = d[param];
        }
    }
    }) ;
    console.log(id);
    console.log(maxbin);
    console.log(minbin);
    console.log(binsize);
  console.log(histdata);
    // This scale is for determining the widths of the histogram bars
    // Must start at 0 or else x(binsize a.k.a dx) will be negative
    var x = d3.scale.linear()
    .domain([0, (xmax - xmin)])
    .range([0, width]);
    console.log(x(binmargin));
    // Scale for the placement of the bars
    var x2 = d3.scale.linear()
    .domain([xmin, xmax])
    .range([0, width]);
  
    var y = d3.scale.linear()
    .domain([0, d3.max(histdata, function(d) { 
            return d.numfill; 
            })])
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x2)
    .orient("bottom");
    var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(10)
    .orient("left");

    /*var tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction('e')
    .offset([0, 20])
    .html(function(d) {
      return '<table id="tiptable">' + d.meta + "</table>";
  });*/
    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Count:</strong> <span style='color:white'>" + d.numfill +"</span>" + "<strong> Range:</strong> <span style='color:white'>"+"("+d.min+"-"+d.max+")"+ "</span>";
        
    })

    var color = d3.scale.category20();
    // put the graph in the "mpg" div
    var svg = d3.select("#critical").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on('click', piechart)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 
            margin.top + ")");
    svg.call(tip);



    // set up the bars
    var bar = svg.selectAll(".bar")
    .data(histdata)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d, i) { return "translate(" + 
         x2(i * binsize + minbin) + "," + y(d.numfill) + ")"; })
    .on('mouseenter', tip.show)
    .on("mouseover", function(d,i){
        d3.select(this)
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + 
         x2(i * binsize + minbin) + "," + (y(d.numfill)-10) + ")"; })
        .transition()
        .delay(1000)
        .attr("transform", function(d) { return "translate(" + 
         x2(i * binsize + minbin) + "," + (y(d.numfill)) + ")"; });})
    .on('mouseleave', tip.hide);

    // add rectangles of correct size at correct location
    bar.append("rect")
    .style("fill", function(d,i) { return color(i); })
    .attr("x", x(binmargin))
    .attr("width", x(binsize - 2 * binmargin))
    .attr("height", function(d) { return height - y(d.numfill); })
    .on("mouseover",  function(d){
        d3.select(this)
        .transition()
        .duration(1000)
        .attr("width", x(binsize - 2 * binmargin)+10)
        .attr("height", function(d) { return height - y(d.numfill)+10})
        .attr("fill","black")
        .transition()
        .delay(1000)
        .attr("width",x(binsize - 2 * binmargin))
        .attr("height", function(d) { return height - y(d.numfill)})
        .attr("fill","steelblue");
         });

    // add the x axis and x-label
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
    svg.append("text")
    .attr("class", "xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom-5)
    .text(xaxis_text);

    // add the y axis and y-label
    svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);
    svg.append("text")
    .attr("class", "ylabel")
    .attr("y", 0 - margin.left) // x and y switched due to rotation
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Number of Students");
/*function piechart(){
  d3.select("svg").remove();
  d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     pie(csvdata,'SATCriticalReadingAvgScore','#critical');
   });
}*/
    function piechart() {
      //console.log("here" + id);
      d3.select("svg").remove();
      if(param === "SATCriticalReadingAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       pie(csvdata,param,'#critical');
     });
      }
      if(param === "SATMathAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       pie(csvdata,param,'#critical');
     });
      }
      if(param === "SATWritingAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       pie(csvdata,param,'#critical');
     });
      }

    }

    function xaxis_text() {
      //console.log("here" + id);
      if(param === "SATCriticalReadingAvgScore"){
          return "SAT Critical Reading Avg Score";
      }
      if(param === "SATMathAvgScore"){
          return "SAT Math Avg Score";
      }
      if(param === "SATWritingAvgScore"){
          return "SAT Writing Avg Score";
      }

    }
}

d3.select("#data2")
        .on("click", BarGraph2);
d3.select("#data1")
        .on("click", BarGraph1);
d3.select("#data3")
        .on("click", BarGraph3);

function BarGraph1() {
  d3.select("svg").remove();
        d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     bar(csvdata,'SATCriticalReadingAvgScore','#critical');
   });
    };

function BarGraph2() {
  d3.select("svg").remove();
        d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     bar(csvdata,'SATMathAvgScore','#critical');
   });
 }

 function BarGraph3() {
        d3.select("svg").remove();
        d3.csv("SAT_Results.csv", parser,
       function(error, csvdata) {
     bar(csvdata,'SATWritingAvgScore','#critical');
   });
 }


 function pie(csvdata,param,id){
    //var width = 960,
    //height = 500,
    var radius = Math.min(width, height) / 2;
    var legendRectSize = 18;
    var legendSpacing = 4;
 //d3.selectAll("#critical").style('display', 'none');
 //d3.selectAll("#piecritical").style('display', 'inline');
//var color = d3.scale.ordinal()
    //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", //"#d0743c", "#ff8c00"]);
var color = d3.scale.category20();

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(1);
var arcOver = d3.svg.arc()
    .outerRadius(radius)
    .innerRadius(1);

var labelArc = d3.svg.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var pie = d3.layout.pie()
    .padAngle(.02)
    .sort(null)
    .value(function(d) { return d.numfill; });

var svg = d3.select(id).append("svg")
    .attr("width", width)
    .attr("height", height)
    .on('click',barchart)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var minbin = d3.min(csvdata, function(d) { return d[param]; });
  var maxbin = d3.max(csvdata, function(d) { return d[param]; });
  var binsize = (maxbin - minbin) / numbins;
 

    histdata = new Array(numbins);
    for (var i = 0; i < numbins; i++) {
    histdata[i] = { numfill: 0, meta: "",min:maxbin,max:minbin,range:"" };
  }
     csvdata.forEach(function(d) {
    var bin = Math.floor((d[param] - minbin) / binsize);
    if ((bin.toString() != "NaN") && (bin < histdata.length)) {
      histdata[bin].numfill += 1;
      histdata[bin].meta += "<tr><td>" + d[param] +"</td>"
        /*"</td><td>" + d.Year + "</td><td>"+d.Rating + 
        "</td><td>" + 
        d.Time + " minutes</td>*/"</tr>";
        if(d[param] < histdata[bin].min){
            histdata[bin].min = d[param];
        }
        if(d[param] > histdata[bin].max){
            histdata[bin].max = d[param];
        }
    }
    //histdata[bin].range = histdata[bin].min + "-"+histdata[bin].nax;
    }) ;
  console.log(histdata);
    
  var g = svg.selectAll(".arc")
      .data(pie(histdata))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d,i) { return color(i); })
      .on("mouseover", function(d) {
        d3.select(this).transition()
          .duration(1000)
          .attr("d", arcOver);
          d3.select(this)
               .transition()
               .duration(1000)
               .attr("d", arcOver);
      })
      .on("mouseout", function(d) {
        d3.select(this).transition()
          .duration(1000)
          .attr("d", arc);
      });
  g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { //console.log(d);
        return d.data.numfill; });

    var legend = svg.selectAll('.legend')
  .data(histdata)
  .enter()
  .append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  height * color.domain().length / 2;
    var horz = -2 * legendRectSize +300;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill',  function(d,i) { return color(i); })
  //.style('stroke', color);

legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - legendSpacing)
  .text(function(d) { return "("+d.min +"-"+d.max+")"; });


  function barchart() {
      //console.log("here" + id);
      d3.select("svg").remove();
      if(param === "SATCriticalReadingAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       bar(csvdata,param,'#critical');
     });
      }
      if(param === "SATMathAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       bar(csvdata,param,'#critical');
     });
      }
      if(param === "SATWritingAvgScore"){
          d3.csv("SAT_Results.csv", parser,
         function(error, csvdata) {
       bar(csvdata,param,'#critical');
     });
      }

    }

 }

}