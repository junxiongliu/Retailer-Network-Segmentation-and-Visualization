var RetailerGraph = {
	show : function(retailer_name,competitors){
		
		$("#chartContainer").empty();
		
		d3.select("#chartContainer")
		  .append("text")
		  .text("Focal Retailer: "+retailer_name)
		  .attr("id","focalretailer")
		  .attr("focal",retailer_name)
		  .style("font-size",20)
		  .style("font-family", "sans-serif")
		  .style("font-weight", "bold");
		
		var retailer_list = [retailer_name];
		for(i in competitors){
			if(competitors[i]!=retailer_name){
				retailer_list.push(competitors[i]);
			}
		}

	    var width = 600;
	    var height = 175;
	    // line chart
	    var svg1 = dimple.newSvg("#chartContainer", width, height);
	    d3.csv("/data/data.csv", function (data) {

	      data = dimple.filterData(data, "RETAILER_NAME", retailer_list);
	      
	      var myChart1 = new dimple.chart(svg1, data);
	      myChart1.setBounds(110, 60, width*0.5, height*0.45);
	      
	      var x = myChart1.addCategoryAxis("x", "month");
	      x.aggregate = dimple.aggregateMethod.avg;
	      x.title = "Month";
	      
	      var y = myChart1.addMeasureAxis("y", "total_sales");
	      y.title = "Sales Amount ($)";

	      var s = myChart1.addSeries("RETAILER_NAME", dimple.plot.line);
	      s.addOrderRule(retailer_list);
	      s.interpolation = "cardinal";
	      var myLegend = myChart1.addLegend(50, 30, 0.8*width, 20, "left");

	      myChart1.defaultColors = [
	          new dimple.color("#93DF7C", "#93DF7C", 1), // yellowish green
	          new dimple.color("#35D8C1", "#35D8C1", 1), // green
	          new dimple.color("#70C2EA", "#70C2EA", 1), // blue
	          new dimple.color("#F5D455", "#F5D455", 1), // yellow
	          new dimple.color("#CE9ED7", "#CE9ED7", 1), // purple
	          new dimple.color("#F58195", "#F58195", 1), // red
	      ];

	      svg1.append("text")
	         .attr("x", width*0.4)
	         .attr("y", 20)
	         .style("text-anchor", "middle")
	         .style("font-family", "sans-serif")
	         .style("font-weight", "bold")
	         .style("font-size", 15)
	         .text("Monthly Sales Trends");

	      myChart1.draw();

	      //clear current legends
	      myChart1.legends = [];

	      // Get a unique list of retailers values to use when filtering
	        var filterValues = dimple.getUniqueValues(data, "RETAILER_NAME");
	        // Get all the rectangles from our now orphaned legend
	        myLegend.shapes.selectAll("rect")
	          // Add a click event to each rectangle
	          .on("click", function (e) {
	            // This indicates whether the item is already visible or not
	            var hide = false;
	            var newFilters = [];
	            // If the filters contain the clicked shape hide it
	            filterValues.forEach(function (f) {
	              if (f === e.aggField.slice(-1)[0]) {
	                hide = true;
	              } else {
	                newFilters.push(f);
	              }
	            });
	            // Hide the shape or show it
	            if (hide) {
	              d3.select(this).style("opacity", 0.2);
	            } else {
	              newFilters.push(e.aggField.slice(-1)[0]);
	              d3.select(this).style("opacity", 0.8);
	            }
	            // Update the filters
	            filterValues = newFilters;
	            // Filter the data
	            myChart1.data = dimple.filterData(data, "RETAILER_NAME", filterValues);
	            // Passing a duration parameter makes the chart animate. Without it there is no transition
	            myChart1.draw(800);
	          });
	    });


	    //time-series bubble chart
	    var svg = dimple.newSvg("#chartContainer", width, height);
	    d3.csv("/data/data.csv", function (data) {
	      data = dimple.filterData(data, "RETAILER_NAME", retailer_list);

	      var series,
	        // Set a background and foreground chart
	        charts = [
	          new dimple.chart(svg, null),
	          new dimple.chart(svg, data)
	        ],

	        lastMonth = null,
	        retailer = dimple.getUniqueValues(data, "RETAILER_NAME");

	        charts[0].defaultColors = [
	                new dimple.color("#F5D455", "#CDA042", 1), // yellow
	                new dimple.color("#35D8C1", "#2FA68B", 1), // green
	                new dimple.color("#70C2EA", "#4995B0", 1), // blue
	                new dimple.color("#93DF7C", "#7EAA55", 1), // yellowish green
	                new dimple.color("#CE9ED7", "#9578A4", 1), // purple
	                new dimple.color("#F58195", "#B65F72", 1), // red
	        ];
	        charts[1].defaultColors = [
	                new dimple.color("#F5D455", "#CDA042", 1), // yellow
	                new dimple.color("#35D8C1", "#2FA68B", 1), // green
	                new dimple.color("#70C2EA", "#4995B0", 1), // blue
	                new dimple.color("#93DF7C", "#7EAA55", 1), // yellowish green
	                new dimple.color("#CE9ED7", "#9578A4", 1), // purple
	                new dimple.color("#F58195", "#B65F72", 1), // red
	        ];

	        // Define 2 nearly identical charts.  It's essential
	        // for this that the max and minimum values are fixed
	        // and unmoving otherwise the background chart will get
	        // out of sync with the foreground the background chart's
	        // axes are hidden and it's colors are faded.  Both have
	        // their borders set to white, which looks better on this chart
	        charts.forEach(function (chart, i) {
	          var x, y;
	          chart.setBounds(110, 60, width*0.5, height*0.45);
	          x = chart.addMeasureAxis("x", "total_sales");
	          x.overrideMax = 35000000;
	          x.title = "Sales Amount ($)";
	          x.hidden = (i === 0);
	          y = chart.addMeasureAxis("y", "total_count");
	          y.overrideMax = 80000;
	          y.title = "Order Amount";
	          y.hidden = (i === 0);
	          z = chart.addMeasureAxis("z", "total_sales");
	          z.title = "Sales Amount ($)";
	          z.overrideMax = 2500000;
	          // Ensure the same colors for every owner in both charts
	          // differing by opacity
	          retailer.forEach(function (retailer, k) {
	            chart.assignColor(
	              retailer,
	              charts[0].defaultColors[k].fill,
	              "white",
	              (i === 0 ? 0.3 : 1));
	            }, this);
	          }, this);

	          // Define a storyboard on the main chart, this will iterate
	          // all dates and redraw for each, the callback will build the
	          // the background chart
	          charts[1].setStoryboard("month", function (d) {
	            // Use the last date variable to manage the previous tick's data
	            if (lastMonth !== null) {
	              // Pull the previous data
	              var lastData = dimple.filterData(data, "month", lastMonth);
	              // Add a series to the background chart to display old position
	              var lastSeries = charts[0].addSeries("RETAILER_NAME", dimple.plot.bubble);
	              // Average suits these measures better
	              lastSeries.aggregate = dimple.aggregateMethod.sum;
	              // Give each series its own data at different periods
	              lastSeries.data = lastData;
	              // Draw the background chart
	              charts[0].draw();
	              // Class all shapes as .historic
	              lastSeries.shapes.classed("historic", true);
	                // Reduce all opacity and remove once opacity drops below 5%
	                d3.selectAll(".historic")
	                  .each(function () {
	                    var shape = d3.select(this),
	                        opacity = shape.style("opacity") - 0.02;
	                    shape.style("opacity", opacity);
	                  });
	                }
	                lastMonth = d;
	            });

	            // Add the primary series to the main chart
	            series = charts[1].addSeries("RETAILER_NAME", dimple.plot.bubble)
	            series.addOrderRule(retailer_list);
	            series.aggregate = dimple.aggregateMethod.sum;
	            // Draw the main chart
	            charts[1].addLegend(50, 30, 0.8*width, 20, "left");
	            svg.append("text")
	                 .attr("x", width*0.4)
	                 .attr("y", 20)
	                 .style("text-anchor", "middle")
	                 .style("font-family", "sans-serif")
	                 .style("font-weight", "bold")
	                 .style("font-size", 15)
	                 .text("Sales and Orders Trends by Month");
	            charts[1].draw();

	            // Add some border weight to the main series so it separates a bit from
	            // the former period shadows
	            d3.selectAll("circle").style("stroke-width", 2);

	        });

	    // stacked and group bar
	    var svg3 = dimple.newSvg("#chartContainer", width, height);
	    d3.csv("/data/data.csv", function (data) {
	      data = dimple.filterData(data, "RETAILER_NAME", retailer_list);
	      var myChart3 = new dimple.chart(svg3, data);
	      myChart3.setBounds(110, 60, width*0.5, height*0.45)
	      var y= myChart3.addCategoryAxis("y", ["RETAILER_NAME", "IS_CROSS_SELL"]);
	      y.addOrderRule(retailer_list);
	      y.title = "Retailer Name";
	      var x = myChart3.addMeasureAxis("x", "total_sales");
	      x.title = "Sales Amount ($)";
	      myChart3.addSeries("IS_CROSS_SELL", dimple.plot.bar);
	      var myLegend = myChart3.addLegend(130, 30, width*0.5, 20, "right");
	      myChart3.defaultColors = [
	          // new dimple.color("#93DF7C", "#93DF7C", 1), // yellowish green
	          new dimple.color("#35D8C1", "#35D8C1", 1), // green
	          // new dimple.color("#70C2EA", "#70C2EA", 1), // blue
	          new dimple.color("#F5D455", "#F5D455", 1), // yellow
	          new dimple.color("#CE9ED7", "#CE9ED7", 1), // purple
	          new dimple.color("#F58195", "#F58195", 1), // red
	      ];
	      svg3.append("text")
	                 .attr("x", width*0.4)
	                 .attr("y", 20)
	                 .style("text-anchor", "middle")
	                 .style("font-family", "sans-serif")
	                 .style("font-weight", "bold")
	                 .style("font-size", 15)
	                 .text("Sales by Cross-Sell");
	      myChart3.draw();

	      //clear current legends
	      myChart3.legends = [];

	      // Get a unique list of values to use when filtering
	        var filterValues = dimple.getUniqueValues(data, "IS_CROSS_SELL");
	        // Get all the rectangles from our now orphaned legend
	        myLegend.shapes.selectAll("rect")
	          // Add a click event to each rectangle
	          .on("click", function (e) {
	            // This indicates whether the item is already visible or not
	            var hide = false;
	            var newFilters = [];
	            // If the filters contain the clicked shape hide it
	            filterValues.forEach(function (f) {
	              if (f === e.aggField.slice(-1)[0]) {
	                hide = true;
	              } else {
	                newFilters.push(f);
	              }
	            });
	            // Hide the shape or show it
	            if (hide) {
	              d3.select(this).style("opacity", 0.2);
	            } else {
	              newFilters.push(e.aggField.slice(-1)[0]);
	              d3.select(this).style("opacity", 0.8);
	            }
	            // Update the filters
	            filterValues = newFilters;
	            // Filter the data
	            myChart3.data = dimple.filterData(data, "IS_CROSS_SELL", filterValues);
	            // Passing a duration parameter makes the chart animate. Without it there is no transition
	            myChart3.draw(800);
	          });
	    });

	    var svg4 = dimple.newSvg("#chartContainer", width, height);
	    d3.csv("/data/data_agg.csv", function (data) {
	      data = dimple.filterData(data, "RETAILER_NAME", retailer_list);
	      var myChart4 = new dimple.chart(svg4, data);
	      myChart4.setBounds(110, 60, width*0.5, height*0.45)
	      var x = myChart4.addMeasureAxis("x", "num_visit_cust");
	      x.title = "Order Amount";
	      var y = myChart4.addCategoryAxis("y", "RETAILER_NAME");
	      y.addOrderRule(retailer_list);
	      y.title = "Retailer Name";
	      myChart4.addSeries("visit_type", dimple.plot.bar);
	      var myLegend = myChart4.addLegend(130, 30, width*0.5, 20, "right");
	      myChart4.defaultColors = [
	          // new dimple.color("#93DF7C", "#93DF7C", 1), // yellowish green
	          new dimple.color("#35D8C1", "#35D8C1", 1), // green
	          // new dimple.color("#70C2EA", "#70C2EA", 1), // blue
	          new dimple.color("#F5D455", "#F5D455", 1), // yellow
	          new dimple.color("#CE9ED7", "#CE9ED7", 1), // purple
	          new dimple.color("#F58195", "#F58195", 1), // red
	      ];
	      svg4.append("text")
	                 .attr("x", width*0.4)
	                 .attr("y", 20)
	                 .style("text-anchor", "middle")
	                 .style("font-family", "sans-serif")
	                 .style("font-weight", "bold")
	                 .style("font-size", 15)
	                 .text("Order Amount by Visit Type");
	      myChart4.draw();

	      //clear current legends
	      myChart4.legends = [];

	      // Get a unique list of values to use when filtering
	        var filterValues = dimple.getUniqueValues(data, "visit_type");
	        // Get all the rectangles from our now orphaned legend
	        myLegend.shapes.selectAll("rect")
	          // Add a click event to each rectangle
	          .on("click", function (e) {
	            // This indicates whether the item is already visible or not
	            var hide = false;
	            var newFilters = [];
	            // If the filters contain the clicked shape hide it
	            filterValues.forEach(function (f) {
	              if (f === e.aggField.slice(-1)[0]) {
	                hide = true;
	              } else {
	                newFilters.push(f);
	              }
	            });
	            // Hide the shape or show it
	            if (hide) {
	              d3.select(this).style("opacity", 0.2);
	            } else {
	              newFilters.push(e.aggField.slice(-1)[0]);
	              d3.select(this).style("opacity", 0.8);
	            }
	            // Update the filters
	            filterValues = newFilters;
	            // Filter the data
	            myChart4.data = dimple.filterData(data, "visit_type", filterValues);
	            // Passing a duration parameter makes the chart animate. Without it there is no transition
	            myChart4.draw(800);
	          });
	    });
	}
	
}