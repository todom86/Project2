var svgWidth = 800;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 20,
    bottom: 160,
    left: 160
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

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis
      .transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis
      .transition()
      .duration(1000)
      .call(leftAxis);
    
    return yAxis
}

function renderRect(rectangles, newXScale, newYScale, stateInfo, barGroup) {
      
    rectangles.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    var rectangles = barGroup.selectAll("rect")
        .data(stateInfo, d => JSON.stringify(d))
        .enter()
        .append("rect")
          .attr("x", d => newXScale(d.category))
          .attr("y", height)
          .attr("width", newXScale.bandwidth())
          .attr("height", 0)
          .attr("class", "bars");
    
    rectangles.transition()
        .delay((d,i) => 1000 + i*50)
        .duration(1000)
        .attr("y", d => newYScale(d.percent))
        .attr("height", d => height - newYScale(d.percent));

    // console.log(rectangles);
    
    return rectangles
}

function renderRectText(rectText, newXScale, newYScale, stateInfo, barGroup) {

    // rectText
    //   .data(stateInfo)
    //   .transition()
    //   .duration(500)
    //   .delay((d,i) => i*100)
    //   .attr("y", d => newYScale(d.percent)-2)
    //   .text(d => format(d.percent) + "%");

    // return rectText   
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
            .text(d => format(d.percent) + "%")
            .attr("class", "percentText");
    
    rectText.transition()
        .delay((d,i) => 1000 + i*50)
        .duration(1000)
        .attr("y", d => newYScale(d.percent)-5);

    // console.log(rectText);
    
    return rectText
}

function updateSpider(stateInfo) {

    stateInfo.push(stateInfo[0]);

    var info = [{
        type: 'scatterpolar',
        r: stateInfo.map(d => d.percent),
        theta: stateInfo.map(d => d.category),
        fill: 'toself'
        }];
        
    var layout = {
        polar: {
        radialaxis: {
            visible: true,
            range: [0, d3.max(stateInfo.map(d => d.percent))]
        }
        },
        showlegend: false
    };
    
    Plotly.newPlot("SpiderChart", info, layout);
}
    
var url = 'http://localhost:5000/data'
var format = d3.format(".2f");

d3.json(url).then((data) => {
    
    // console.log(data);

    var stateList = Array.from(new Set(data.map(row => row.state).sort()));
    var sexList = Array.from(new Set(data.map(row => row.sex).sort()));
    var ageList = Array.from(new Set(data.map(row => row.age_group).sort()));
    var generationList = Array.from(new Set(data.map(row => row.generation).sort()));
    var incomeList = Array.from(new Set(data.map(row => row.income).sort()));
    var partyList = Array.from(new Set(data.map(row => row.party).sort()));
    var religionList = Array.from(new Set(data.map(row => row.religion).sort()));
    var ideoList = Array.from(new Set(data.map(row => row.ideo).sort()));

    var categoryArray = ['Religion', 'Sex', 'Age Group', 'Generation', 'Income', 'Party', 'Ideology'];

    // console.log(stateList);
    // console.log(sexList);
    // console.log(ageList);
    // console.log(generationList);
    // console.log(incomeList);
    // console.log(partyList);
    // console.log(religionList);
    // console.log(ideoList);

    var chosenXAxis = 'religion';
    var chosenState = 'Alabama';
    var chosenCategory = religionList;

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

    var stateInfo = getStateInfo(data, chosenState, chosenXAxis, chosenCategory);

    var xBandScale = xScale(stateInfo);
    
    var yLinearScale = yScale(stateInfo);
    
    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    var barGroup = chartGroup.append("g");
    
    var rectangles = barGroup.selectAll("rect")
        .data(stateInfo)
        .enter()
        .append("rect")
            .attr("x", d => xBandScale(d.category))
            .attr("y", height)
            .attr("width", xBandScale.bandwidth())
            .attr("height", 0)
            .attr("class", "bars");
    
    rectangles.transition()
        .delay((d,i) => i*50)
        .duration(1000)
        .attr("y", d => yLinearScale(d.percent))
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

    updateSpider(stateInfo);
            
    d3.select("#selectState").on("change", function() {
        
        chosenState = d3.select("#selectState").node().value;
        // chosenXAxis = 'religion';

        console.log(chosenState);

        stateInfo = getStateInfo(data, chosenState, chosenXAxis, chosenCategory);

        xBandScale = xScale(stateInfo, chosenXAxis);

        // xAxis = renderXAxis(xBandScale, xAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        rectangles = renderRect(rectangles, xBandScale, yLinearScale, stateInfo, barGroup);

        rectText = renderRectText(rectText, xBandScale, yLinearScale, stateInfo, barGroup);

        updateSpider(stateInfo);
    });
    
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

        xAxis = renderXAxis(xBandScale, xAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        rectangles = renderRect(rectangles, xBandScale, yLinearScale, stateInfo, barGroup);

        rectText = renderRectText(rectText, xBandScale, yLinearScale, stateInfo, barGroup);

        updateSpider(stateInfo);
    });

});