// Prep SVG area
var svgWidth = 600;
var svgHeight = 600;

var margin = {
    top: 110,
    right: 10,
    bottom: 180,
    left: 25
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
    .select("#BarChart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Function to get needed data by state
function getStateInfo(data, state, chosenXAxis, chosenCategory) {
    var stateInfo = [];

    st = data.filter((d) => {
        return d.state === state;
    });
    // console.log(st);

    var totalWeight = d3.sum(st.map(d => d.weight));
    // console.log(totalWeight);

    chosenCategory.forEach((item) => {
        var x = 0;
        var selected = st.filter((d) => {
            return d[chosenXAxis] === item;
        });
        // console.log(selected);
        for (i in selected) {
            x += selected[i].weight
        };
            stateInfo.push({
                "percent" : (x / totalWeight)*100,
                "category" : item 
            });
    });
    console.log(stateInfo);
    return stateInfo
}


// Functions to render selected chart
function xScale(stateInfo) {
    var xBandScale = d3.scaleBand()
        .domain(stateInfo.map(d => d.category))
        .range([0, width])
        .padding(0.2);
    
    return xBandScale
}

function yScale(stateInfo) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateInfo.map(d => d.percent))])
        .range([height, 0]);
    
    return yLinearScale
}

function renderXAxis(newXScale, xAxis, chartGroup) {

    chartGroup.select(".x.axis").remove();

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis = chartGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .transition()
            .duration(1000);

    return xAxis
}

// function renderYAxis(newYScale, yAxis, chartGroup) {

//     chartGroup.select(".y.axis").remove();

//     var leftAxis = d3.axisLeft(newYScale);

//     yAxis = chartGroup.append("g")
//         .attr("class", "y axis")
//         .call(leftAxis)
//         .transition()
//         .duration(1000);

//     return yAxis
// }

function renderRect(rectangles, newXScale, newYScale, stateInfo, barGroup) {
      
    rectangles.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", height)
        .attr("width", 0)
        .attr("height", 0)
        .remove();

    var rectangles = barGroup.selectAll("rect")
        .data(stateInfo, d => JSON.stringify(d))
        .enter()
        .append("rect")
          .attr("x", d => newXScale(d.category))
          .attr("y", height)
          .attr("width", 0)
          .attr("height", 0)
          .attr("class", "bars");
    
    rectangles.transition()
        .delay((d,i) => 1000 + i*50)
        .duration(1000)
        .attr("y", d => newYScale(d.percent))
        .attr("width", newXScale.bandwidth())
        .attr("height", d => height - newYScale(d.percent));

    // console.log(rectangles);
    
    return rectangles
}

function renderRectText(rectText, newXScale, newYScale, stateInfo, barGroup) {
   
    var format = d3.format(".2f"); 
    
    rectText.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    var rectText = barGroup.selectAll("text")
        .data(stateInfo, d => JSON.stringify(d))
        .enter()
        .append("text")
            .attr("x", d => newXScale(d.category))
            .attr("y", height)
            .text("")
            .attr("class", "percentText");
    
    rectText.transition()
        .delay((d,i) => 1000 + i*50)
        .duration(1000)
        .attr("y", d => newYScale(d.percent)-5)
        .text(d => format(d.percent) + "%");

    // console.log(rectText);
    
    return rectText
}

// Create spider graph based on selected data
function updateSpider(stateInfo) {

    // stateInfo.push(stateInfo[0]);

    // var info = [{
    //     type: 'scatterpolar',
    //     r: stateInfo.map(d => d.percent),
    //     theta: stateInfo.map(d => d.category),
    //     fill: 'toself'
    //     }];
        
    // var layout = {
    //     polar: {
    //     radialaxis: {
    //         visible: true,
    //         range: [0, d3.max(stateInfo.map(d => d.percent))]
    //     }
    //     },
    //     showlegend: false
    // };

    var info = [{
        type: 'pie',
        values: stateInfo.map(d => d.percent),
        labels: stateInfo.map(d => d.category),
        textinfo: "label+percent",
        textposition: "outside",
        automargin: true
    }];

    var layout = {
        height: 400,
        width: 400,
        margin: {"t": 0, "b": 0, "l": 0, "r": 0},
        showlegend: false
    };
    
    Plotly.newPlot("pieChart", info, layout);
}
    
var url = 'http://localhost:5000/data'
var format = d3.format(".2f");

d3.json(url).then((data) => {
    
    // console.log(data);

    // Getting unique values from data
    var stateList = Array.from(new Set(data.map(row => row.state).sort()));
    var sexList = Array.from(new Set(data.map(row => row.sex).sort()));
    var ageList = Array.from(new Set(data.map(row => row.age_group).sort()));
    // var generationList = Array.from(new Set(data.map(row => row.generation).sort()));
    var generationList = ["Greatest generation", "Silent Generation", "Baby Boomers",
            "Generation X", "Millennials", "Don't know/refused"];
    // var incomeList = Array.from(new Set(data.map(row => row.income).sort()));
    var incomeList = ["Less than $10,000","10 to under $20,000","20 to under $30,000",
            "30 to under $40,000","40 to under $50,000","50 to under $75,000","75 to under $100,000",
            "100 to under $150,000","$150,000 or more"];
    // var partyList = Array.from(new Set(data.map(row => row.party).sort()));
    var partyList = ["Democrat","Republican","Independent","No preference","Other party", "Don't know/Refused"];
    var religionList = Array.from(new Set(data.map(row => row.religion).sort()));
    // var ideoList = Array.from(new Set(data.map(row => row.ideo).sort()));
    var ideoList = ["Very liberal","Liberal","Moderate","Conservative","Very conservative", "Don't know/Refused"];

    // Array to hold category values to display in dropdown menu
    var categoryArray = ['Ideology', 'Age Group', 'Generation', 'Income', 'Party', 'Religion', 'Sex'];

    // console.log(stateList);
    // console.log(sexList);
    // console.log(ageList);
    // console.log(generationList);
    // console.log(incomeList);
    // console.log(partyList);
    // console.log(religionList);
    // console.log(ideoList);

    // Initial values
    var chosenXAxis = 'ideo';
    var chosenState = 'Alabama';
    var chosenCategory = ideoList;

    // Append data to dropdowns
    var StateDropdown = d3.select("#selectState");
    var categoryDropdown = d3.select("#selectCategory");

    categoryArray.map((d) => {
        categoryDropdown
            .append("option")
            .text(d)
            .property("value", d);
    })

    stateList.map((d) => {
        StateDropdown
            .append("option")
            .text(d)
            .property("value", d);
    });

    // Render initial bar chart
    var stateInfo = getStateInfo(data, chosenState, chosenXAxis, chosenCategory);

    var xBandScale = xScale(stateInfo);
    
    var yLinearScale = yScale(stateInfo);
    
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    // console.log(xAxis);

    // var yAxis = chartGroup.append("g")
    //     .attr("class", "y axis")
    //     .call(leftAxis);

    var barGroup = chartGroup.append("g");
    
    var rectangles = barGroup.selectAll("rect")
        .data(stateInfo)
        .enter()
        .append("rect")
            .attr("x", d => xBandScale(d.category))
            .attr("y", height)
            .attr("width", 0)
            .attr("height", 0)
            .attr("class", "bars");
    
    rectangles.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", d => yLinearScale(d.percent))
        .attr("width", xBandScale.bandwidth())
        .attr("height", d => height - yLinearScale(d.percent));

    var rectText = barGroup.selectAll("text")
        .data(stateInfo)
        .enter()
        .append("text")
            .attr("x", d => xBandScale(d.category))
            .attr("y", height)
            .text(d => format(d.percent) + "%")
            .attr("class", "percentText");

    rectText.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", d => yLinearScale(d.percent)-5);

    // Initial Spider Graph
    updateSpider(stateInfo);
            
    // Update charts based on selected state
    d3.select("#selectState").on("change", function() {
        
        chosenState = d3.select("#selectState").node().value;
        // chosenXAxis = 'religion';

        console.log(chosenState);

        stateInfo = getStateInfo(data, chosenState, chosenXAxis, chosenCategory);

        xBandScale = xScale(stateInfo, chosenXAxis);

        xAxis = renderXAxis(xBandScale, xAxis, chartGroup);

        // yAxis = renderYAxis(yLinearScale, yAxis, chartGroup);

        rectangles = renderRect(rectangles, xBandScale, yLinearScale, stateInfo, barGroup);

        rectText = renderRectText(rectText, xBandScale, yLinearScale, stateInfo, barGroup);

        updateSpider(stateInfo);
    });
    
    // Update charts based on selected category
    d3.select("#selectCategory").on("change", function() {
        
        newCategory = d3.select("#selectCategory").node().value;
        
        console.log(chosenCategory);

        // ['Religion', 'Sex', 'Age Group', 'Generation', 'Income', 'Party', 'Ideology']
        if (newCategory === 'Religion') {
            chosenCategory = religionList;
            chosenXAxis = 'religion';
        } else if (newCategory === 'Sex') {
            chosenCategory = sexList;
            chosenXAxis = 'sex';
        } else if (newCategory === 'Age Group') {
            chosenCategory = ageList;
            chosenXAxis = 'age_group';
        } else if (newCategory === 'Generation') {
            chosenCategory = generationList;
            chosenXAxis = 'generation';
        } else if (newCategory === 'Income') {
            chosenCategory = incomeList;
            chosenXAxis = 'income';
        } else if (newCategory === 'Party') {
            chosenCategory = partyList;
            chosenXAxis = 'party';
        } else {
            chosenCategory = ideoList;
            chosenXAxis = 'ideo';
        };

        console.log(chosenXAxis);

        stateInfo = getStateInfo(data, chosenState, chosenXAxis, chosenCategory);

        xBandScale = xScale(stateInfo, chosenXAxis);

        xAxis = renderXAxis(xBandScale, xAxis, chartGroup);

        // yAxis = renderYAxis(yLinearScale, yAxis, chartGroup);

        rectangles = renderRect(rectangles, xBandScale, yLinearScale, stateInfo, barGroup);

        rectText = renderRectText(rectText, xBandScale, yLinearScale, stateInfo, barGroup);

        updateSpider(stateInfo);
    });

});