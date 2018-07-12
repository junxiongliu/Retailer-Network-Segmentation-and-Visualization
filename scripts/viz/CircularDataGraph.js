'use strict'
// var svg_network,links_network,nodes_network,nodename_network;

var ClusterLabels = {
    init: function(price_ranges, categories, salesRange, threshold) {
        
        $('.checkbox_cluster').prop('checked', true);
        $('.cluster_label').each(function() {
            var color = CircularGraphMetaData.color[+$(this).attr('value')];
            $(this).css("color", color); 
        });

        // // Deprecated
        // $('.checkbox_cluster').change(function() {
        //     var clusters = new Set();
        //     $('input[class="checkbox_cluster"]:checked').each(function() {
        //         clusters.add(+this.value);
        //     });
        //     console.log(clusters);
        //     CircularGraph.update(clusters, price_ranges, categories, salesRange, threshold);
        // });

        // // Deprecated
        // $('.cluster_label').hover(
        //     function(){ 
        //         var color = CircularGraphMetaData.color[+$(this).attr('value')];
        //         $(this).css("color", color); 
        //     }, 
        //     function(){ 
        //         var checkbox = $(this).siblings('.checkbox_cluster').first();
        //         if (!checkbox.is(':checked')) {
        //             $(this).css("color", "#000000");
        //         }
        //     }
        // );

        // // Deprecated
        // $('.checkbox_cluster').click(function() {
        //     var label = $(this).siblings('.cluster_label').first();
        //     if ($(this).is(':checked')) {
        //         $(this).attr('checked', 'checked');
        //         var color = CircularGraphMetaData.color[+$(this).attr('value')];
        //         label.css("color", color); 
        //     } else {
        //         $(this).removeAttr('checked');
        //         label.css("color", "#000000");
        //     }
        // });
        $('.cluster_label').click(function() {
            var checkbox = $(this).siblings('.checkbox_cluster').first();
            if (checkbox.is(':checked')) {
                checkbox.removeAttr('checked');
                // $(this).css("color", "#000000");
            } else {
                checkbox.attr('checked', 'checked');
                // var color = CircularGraphMetaData.color[+$(this).attr('value')];
                // $(this).css("color", color); 
            }
        });
    }
}

var CircularGraphMetaData = {
    amountThreshold: 20000,
    // width: 750,
    // height: 930,
    width: 750,
    height: 680,
    radius: 200,
    color: {"1":"#CE9ED7","2":"#70C2EA","3":"#35D8C1","4":"#93DF7C","5":"#F5D455"}
};

var CircularGraphData = {
    nodedata: null,
    linkdata: null
};

var CircularGraph = {

    filteredNodeData: function(nodedata, clusters, price_ranges, categories, salesRange) {
        return nodedata.filter(function(d) { 
            return clusters.has(+d.RETAILER_CLUSTER_NUMBER) && price_ranges.has(d.RETAILER_PRICE_RANGE) && categories.has(d.RETAILER_CATEGORY) && d.RETAILER_TOTAL_SALES>=salesRange[0] && d.RETAILER_TOTAL_SALES <= salesRange[1]; 
        });
    },

    filteredLinkData: function(linkdata,threshold) {
        return linkdata.filter(function(d) { 
            return (+d.value) > threshold && $("#node"+d.target).length > 0 && $("#node"+d.source).length > 0;
        });
    },

    init: function(nodesDataFile, linksDataFile, price_ranges, categories, salesRange, threshold) {
        var width = CircularGraphMetaData.width, height = CircularGraphMetaData.height;
        var svg_network = d3.select("#networkContainer").append("svg").attr("width",width).attr("height",height);
        var links_network = svg_network.append("g").attr("class", "links").selectAll("path");
        var nodes_network = svg_network.append("g").attr("class", "nodes").selectAll("circle");
        var nodename_network = svg_network.append("g").attr("class", "nodenames")
            .attr("transform","translate("+width/2+","+height/2+")")
            .selectAll("text");
        
        d3.csv(linksDataFile, function(error1, linkdata) {
            d3.csv(nodesDataFile,function(error2,nodedata){
            
                if (error1 | error2) throw error;
                
                CircularGraphData.nodedata = nodedata;
                CircularGraphData.linkdata = linkdata;

                CircularGraph.display(CircularGraphData.nodedata,linkdata, threshold);
                ClusterLabels.init(price_ranges, categories, salesRange, threshold);  
            });
        });
    },

    update: function(clusters, price_ranges, categories, salesRange, threshold) {
        var nodedata = CircularGraph.filteredNodeData(CircularGraphData.nodedata, clusters, price_ranges, categories, salesRange);
        CircularGraph.display(nodedata, CircularGraphData.linkdata,threshold);
    },

    display: function(nodedata, linkdata, threshold) {
		// $("#networkContainer .links").empty();
		// $("#networkContainer .nodes").empty();
		// $("#networkContainer .nodenames").empty();
        nodedata.sort(function(x, y){
            return d3.descending(y['RETAILER_NAME'], x['RETAILER_NAME']);
        })
		
		nodedata.sort(function(x, y){
            return d3.descending(x['RETAILER_CLUSTER_NUMBER'], y['RETAILER_CLUSTER_NUMBER']);
        })
        
        var width = CircularGraphMetaData.width, height = CircularGraphMetaData.height;
        var amountThreshold = CircularGraphMetaData.amountThreshold;
        var radius = CircularGraphMetaData.radius;
        var color = CircularGraphMetaData.color;

        var num_nodes = nodedata.length;
        var unit_angle = 2*Math.PI/num_nodes;			
        var x1,x2,y1,y2;

        var svg = d3.select("#networkContainer").select("svg");
        var links_network = svg.select(".links").selectAll("path");
        var nodes_network = svg.select(".nodes").selectAll("circle");
        var nodename_network = svg.select(".nodenames").selectAll("text");

        nodes_network = nodes_network.data(nodedata)
            .attr("id",function(d){return "node"+d.id;})
            .attr("r", 3.5)
            .attr("fill", function(d) { return color[d.RETAILER_CLUSTER_NUMBER]; })
            .attr("cx",function(d,i){return width/2 + radius * Math.sin(i*unit_angle);})
            .attr("cy",function(d,i){return height/2 - radius * Math.cos(i*unit_angle);});
		
        nodes_network.enter()
            .append("circle")
            .attr("class","node")
            .attr("id",function(d){return "node"+d.id;})
            .attr("r", 3.5)
            .attr("fill", function(d) { return color[d.RETAILER_CLUSTER_NUMBER]; })
            .attr("opacity",0.9)
            .attr("cx",function(d,i){return width/2 + radius * Math.sin(i*unit_angle);})
            .attr("cy",function(d,i){return height/2 - radius * Math.cos(i*unit_angle);})
            .on("mouseover", CircularGraph.mouseovered_node)
            .on("mouseout", CircularGraph.mouseouted_node)
			.on("click", CircularGraph.clicked);
		
        nodes_network.exit().remove();

        nodename_network = nodename_network.data(nodedata)
            .text(function(d){return d.RETAILER_NAME;})
            .attr("transform", function(d,i) { return "rotate(" + (i*unit_angle*180/Math.PI < 180 ? (i*unit_angle*180/Math.PI-89) :(i*unit_angle*180/Math.PI-91)) 
                                                + ")translate("+(radius+15)+",0)" 
                                                + (i*unit_angle*180/Math.PI < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function(d,i) { return i*unit_angle*180/Math.PI < 180 ? "start" : "end"; });

        nodename_network.enter()
            .append("text")
            .attr("class","unchosen text")
            .text(function(d){return d.RETAILER_NAME;})
            .attr("transform", function(d,i) { return "rotate(" + (i*unit_angle*180/Math.PI < 180 ? (i*unit_angle*180/Math.PI-89) :(i*unit_angle*180/Math.PI-91)) 
                                                + ")translate("+(radius+15)+",0)" 
                                                + (i*unit_angle*180/Math.PI < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function(d,i) { return i*unit_angle*180/Math.PI < 180 ? "start" : "end"; })
            .attr("font-size","12px")
            .on("mouseover", CircularGraph.mouseovered_name)
            .on("mouseout", CircularGraph.mouseouted_name)
			.on("click", CircularGraph.clicked);

        nodename_network.exit().remove();
		
		linkdata = CircularGraph.filteredLinkData(linkdata,threshold);
		
        links_network = links_network.data(linkdata)
            //.style("stroke", "steelblue")
            //.attr("stroke-width",0.1)
            .attr("d",function(d){x1 = d3.select("#node"+d.target).attr("cx"); y1 = d3.select("#node"+d.target).attr("cy");
                                x2= d3.select("#node"+d.source).attr("cx"); y2 = d3.select("#node"+d.source).attr("cy");
                                return "M"+x1+","+y1+" Q " +width/2+","+height/2+" "+x2+","+y2;});

        links_network.enter()
            .append("path")
            .attr("class","unchosen path")
            //.style("stroke", "steelblue")
            //.attr("stroke-width",0.1)
            .attr("fill","transparent")
            .attr("d",function(d){x1 = d3.select("#node"+d.target).attr("cx"); y1 = d3.select("#node"+d.target).attr("cy");
                                x2= d3.select("#node"+d.source).attr("cx"); y2 = d3.select("#node"+d.source).attr("cy");
                                return "M"+x1+","+y1+" Q " +width/2+","+height/2+" "+x2+","+y2;});
		console.log(links_network);
        links_network.exit().remove();
    },

    mouseovered_node: function(d) {
        d3.select(this).attr("fill","red");
        var id = d3.select(this).attr("id").substring(4);
        var links = d3.select("#networkContainer").select("svg").select(".links").selectAll("path");
        // links = links.attr("class",function(l){return (+l.source == id || +l.target == id) ? "chosen path":"unchosen path"});
        var nodename = d3.select("#networkContainer").select("svg").select(".nodenames").selectAll("text");
        nodename = nodename.attr("class",function(l){return +l.id == id ? "chosen text":"unchosen text"});
        links.each(function(l) {
            if (+l.target == id) {
                d3.select(this).attr("class", "chosen path");
                nodename.each(function(d) {
                    if (+d.id == +l.source) {
                        d3.select(this).attr("class", "chosen text");
                    }
                });
            } else {
                d3.select(this).attr("class", "unchosen path");
            }
        });
    },
    
    mouseouted_node: function(d) {
        var id = d3.select(this).attr("id").substring(4);
        d3.select(this).attr("fill",function(d) { return CircularGraphMetaData.color[d.RETAILER_CLUSTER_NUMBER]; });
        var links = d3.select("#networkContainer").select("svg").select(".links").selectAll("path");
        // links = links.attr("class","unchosen path");
        links.each(function(l) {
            d3.select(this).attr("class","unchosen path");
        });
        var nodename = d3.select("#networkContainer").select("svg").select(".nodenames").selectAll("text");
        nodename = nodename.attr("class","unchosen text");
    },

    mouseovered_name: function(d) {
        d3.select(this).attr("class","text chosen");
        var id = +d3.select(this).datum().id;
        d3.select("#node"+id).attr("fill","red");
        var nodename = d3.select("#networkContainer").select("svg").select(".nodenames").selectAll("text");
        var links = d3.select("#networkContainer").select("svg").select(".links").selectAll("path");
        // links = links.attr("class",function(l){return (+l.source == id || +l.target == id) ? "chosen path":"unchosen path"});
        // d3.select("#node"+id).attr("fill","red");
        links.each(function(l) {
            if (+l.target == id) {
                d3.select(this).attr("class", "chosen path");
                nodename.each(function(d) {
                    if (+d.id == +l.source) {
                        d3.select(this).attr("class", "chosen text");
                    }
                });
            } else {
                d3.select(this).attr("class", "unchosen path");
            }
        });
    },

    mouseouted_name: function(d) {
        d3.select(this).attr("class","unchosen");
        var id = +d3.select(this).datum().id;
        d3.select("#node"+id).attr("fill",function(l){return CircularGraphMetaData.color[l.RETAILER_CLUSTER_NUMBER];});
        var nodename = d3.select("#networkContainer").select("svg").select(".nodenames").selectAll("text");
        nodename = nodename.attr("class","unchosen text");
        var links = d3.select("#networkContainer").select("svg").select(".links").selectAll("path");
        // links = links.attr("class","unchosen path");
        // d3.select("#node"+id).attr("fill",function(l){return CircularGraphMetaData.color[l.RETAILER_CLUSTER_NUMBER];});
        links.each(function(l) {
            d3.select(this).attr("class","unchosen path");
        });
    },
	
	clicked: function(d){
		var retailer_name = d.RETAILER_NAME;
		var competitors = $('select#select_competitors').val();
		if(competitors.length == 0){
			competitors = ["retailer 112", "retailer 96", "retailer 20"];
		};
		RetailerGraph.show(retailer_name,competitors);
	}
	
		
};