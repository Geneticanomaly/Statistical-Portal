
var firstDragElement;
var firstRound;
var chart;
var startYear;
var endYear;
var areaCode;
var chartDataChecker = "Employment";


document.addEventListener('DOMContentLoaded', function() {

    const urlParam = new URLSearchParams(window.location.search);
    areaCode = urlParam.get("param")

    startYear = 1987;
    endYear = 2021;

    createHTMLSliderComponents(startYear, endYear);

    // Find the first .drag-element
    firstDragElement = document.querySelector('.drag-element');
    firstRound = true;
    if (firstDragElement) {
        // Add the "disabled" class to the first .drag-element
        firstDragElement.classList.add('disabled');
    }

    fetchChartData(areaCode);
});

function createHTMLSliderComponents(newMin, newMax) {

    const containerDiv = document.getElementById('myContainer');

    // Remove existing slider containers if they exist
    const existingSliderContainers = document.querySelectorAll('.slider-container, .slider-container_1');
    existingSliderContainers.forEach(container => {
        containerDiv.removeChild(container);
    });

    // Create the first slider container div with the class "slider-container" and set its style
    const sliderContainer1 = document.createElement('div');
    sliderContainer1.classList.add('slider-container');
    sliderContainer1.style.width = '40%';

    // Create the input element for the first slider with the appropriate attributes
    const slider1 = document.createElement('input');
    slider1.setAttribute('type', 'range');
    slider1.classList.add('slider');
    slider1.setAttribute('min', `${newMin}`);
    slider1.setAttribute('max', `${newMax}`);
    slider1.setAttribute('value', '2000');

    // Create the output element for the first slider with the class "tooltip"
    const tooltip1 = document.createElement('output');
    tooltip1.classList.add('tooltip');

    // Append the input and output elements to the first slider container
    sliderContainer1.appendChild(slider1);
    sliderContainer1.appendChild(tooltip1);

    // Create the second slider container div with the class "slider-container_1" and set its style
    const sliderContainer2 = document.createElement('div');
    sliderContainer2.classList.add('slider-container_1');
    sliderContainer2.style.width = '40%';

    // Create the input element for the second slider with the appropriate attributes
    const slider2 = document.createElement('input');
    slider2.setAttribute('type', 'range');
    slider2.classList.add('slider_1');
    slider2.setAttribute('min', `${newMin}`);
    slider2.setAttribute('max', `${newMax}`);
    slider2.setAttribute('value', '2021');

    // Create the output element for the second slider with the class "tooltip_1"
    const tooltip2 = document.createElement('output');
    tooltip2.classList.add('tooltip_1');

    // Append the input and output elements to the second slider container
    sliderContainer2.appendChild(slider2);
    sliderContainer2.appendChild(tooltip2);

    // Append the slider containers to the existing container div
    containerDiv.appendChild(sliderContainer1);
    containerDiv.appendChild(sliderContainer2);

    /* Reference: https://css-tricks.com/value-bubbles-for-range-inputs/ */
    const allRanges = document.querySelectorAll(".slider-container");
    allRanges.forEach(wrap => {
        const slider = wrap.querySelector(".slider");
        const tooltip = wrap.querySelector(".tooltip");
        const sliderChecker = true;

        slider.addEventListener("input", () => {
            setTooltip(slider, tooltip, sliderChecker);
        });
        setTooltip(slider, tooltip, sliderChecker);
    });

    const ranges = document.querySelectorAll(".slider-container_1");
        ranges.forEach(wrap => {
            const slider_1 = wrap.querySelector(".slider_1");
            const tooltip_1 = wrap.querySelector(".tooltip_1");
            const sliderChecker = false;
            
            slider_1.addEventListener("input", () => {
                setTooltip(slider_1, tooltip_1, sliderChecker);
            });
            setTooltip(slider_1, tooltip_1, sliderChecker);
    });
}

/* Reference: https://css-tricks.com/value-bubbles-for-range-inputs/ */

function setTooltip(slider, tooltip, sliderChecker) {
    const val = slider.value;
    const min = slider.min ? slider.min : 0;
    const max = slider.max ? slider.max : 100;
    const newVal = Number(((val - min) * 100) / (max - min));
    tooltip.innerHTML = val;

    tooltip.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;

    if (sliderChecker) {
        startYear = val;
    } else {
        endYear = val
    }
}

function fillChartData(employmentData, populationData, migrationData) {
    let chartData;

    if (chartDataChecker == "Employment") {
        let employmentArray = [];
        let loopAmount = Object.values(employmentData.dimension.Vuosi.category.label);
        let area = Object.values(employmentData.dimension.Alue.category.label);


        Object.values(area).forEach((item, index) => {
            let employmentValues = [];
            let unemploymentValues = [];
            for (let i = 0; i < loopAmount.length; i++) {
                employmentValues.push(employmentData.value[i + index]);
                unemploymentValues.push(employmentData.value[i + loopAmount.length + index]);
            }
            area[index] = {
                name: item,
                values: employmentValues, unemploymentValues
            }    
        })
        employmentArray = area;

        chartData = {
            name: area[0],
            labels: loopAmount,
            datasets: [
                { name: "Employed", values: employmentArray[0].values},
                { name: "Unemployed", values: employmentArray[0].unemploymentValues }
            ]
        }
    } else if (chartDataChecker == "Population") {
        let populationArray = [];
        let loopAmount = Object.values(populationData.dimension.Vuosi.category.label);
        let area = Object.values(populationData.dimension.Alue.category.label);

        Object.values(area).forEach((item, index) => {
            let populationValues = [];
            for (let i = 0; i < loopAmount.length; i++) {
                populationValues.push(populationData.value[i + index]);
            }
            area[index] = {
                name: item,
                values: populationValues
            }
        })
        populationArray = area;

        chartData = {
            name: area[0],
            labels: loopAmount,
            datasets: [
                { name: "Population", values: populationArray[0].values}
            ]
        }
    } else if (chartDataChecker == "Migration") {
        let migrationArray = [];
        let loopAmount = Object.values(migrationData.dimension.Vuosi.category.label);
        let area = Object.values(migrationData.dimension.Alue.category.label);

        Object.values(area).forEach((item, index) => {
            let migrationInValues = [];
            let migrationOutValues = [];
            for (let i = 0; i < loopAmount.length; i++) {
                migrationInValues.push(migrationData.value[2* i + index]);
                migrationOutValues.push(migrationData.value[2 * i + 1 + index]);
            }
            area[index] = {
                name: item,
                values: migrationInValues, migrationOutValues
            }    
        })
        migrationArray = area;

        chartData = {
            name: area[0],
            labels: loopAmount,
            datasets: [
                { name: "Migration In", values: migrationArray[0].values},
                { name: "Migration Out", values: migrationArray[0].migrationOutValues }
            ]
        }
    }

    return chartData
}

function buildChart(employmentData, populationData, migrationData) {

    const chartData = fillChartData(employmentData, populationData, migrationData);

    let title = "";
    let chartType = "";

    if (chartDataChecker == "Employment") {
        title = "Employment and unemployment data in ";
        chartType = "bar";
    } else if (chartDataChecker == "Population") {
        title = "Total population in ";
        chartType = "line";
    } else if (chartDataChecker == "Migration") {
        title = "In and out migration in ";
        chartType = "bar";
    }

    let chartHeight = window.innerHeight > 710 ? 450 : 400;

    chart = new frappe.Chart("#chart", { 
        title: title + chartData.name.name + " from "
         + chartData.labels[0] + "-" + chartData.labels[chartData.labels.length - 1],
        data: chartData,
        type: chartType,
        height: chartHeight,
        colors: ['#eb5146', '#63d0ff']
    })

}

async function fetchChartData(areaCode) {
    let employmentURL = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/tyokay/statfin_tyokay_pxt_115b.px";
    let populationURL = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/vaerak/statfin_vaerak_pxt_11ra.px";
    let migrationURL = "https://statfin.stat.fi:443/PxWeb/api/v1/en/StatFin/muutl/statfin_muutl_pxt_11a2.px";
    let yearsArray = []

    yearsArray = createYearArray();

    const employmentJSONQuery = getEmploymentJSONQuery(areaCode, yearsArray);
    const populationJSONQuery = getPopulationJSONQuery(areaCode, yearsArray);
    const migrationJSONQuery = getMigrationJSONQuery(areaCode, yearsArray);

    const res = await fetch(employmentURL, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(employmentJSONQuery)
    });
    if (!res.ok) {
        displayErrorMessage();
        return;
    }
    const employmentData = await res.json();

    const populationRes = await fetch(populationURL, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(populationJSONQuery)
    });
    if (!populationRes.ok) {
        displayErrorMessage();
        return;
    }
    const populationData = await populationRes.json();

    const migrationRes = await fetch(migrationURL, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(migrationJSONQuery)
    });
    if (!migrationRes.ok) {
        displayErrorMessage();
        return;
    }
    const migrationData = await migrationRes.json();

    buildChart(employmentData, populationData, migrationData);
}


function downloadChartImageSVG() {
    chart.export();
}

function downloadChartImagePNG() {

    const chartContainer = document.getElementById("chart");
  
    // Convert the chart container to an image using html2canvas
    html2canvas(chartContainer)
      .then(canvas => {
        // Create a link to download the image
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "chart.png";
        link.click();
      })
      .catch(error => console.error("Error capturing chart image:", error));
}

function createYearArray() {
    let yearArray = []
    let loopAmount = endYear - startYear;

    for (let i = 0; i < loopAmount + 1; i++) {
        yearArray.push(`${i + parseInt(startYear)}`);
    }
    return yearArray;
}



/* Reference: https://abdessalam.dev/blog/detect-device-type-javascript/ */

const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  };


function enableElement(element) {
    element.classList.remove('disabled');
    element.draggable = true;
}

let dragElements = document.getElementsByClassName("drag-element");
let dropBox = document.getElementById("chart");
let previouslyDisabledElement = null;


if (getDeviceType() == "mobile" || getDeviceType() == "tablet") { // Mobile device controller
    for (const item of dragElements) {
        item.addEventListener("touchstart", function(e) {
            let selected = e.target;
            var touchLocation = e.targetTouches[0];
                item.style.left = touchLocation.pageX + 'px';
                item.style.top = touchLocation.pageY + 'px';
            dropBox.addEventListener("touchmove", function(e) {
                e.preventDefault();
            });
    
            function touchEndHandler(event) {
                event.preventDefault();
            
                if (selected.textContent == "Population data") {
                    chartDataChecker = "Population";
                    startYear = 1990;
                    endYear = 2021;

                    // Go here only once, after page has loaded
                    if (firstRound) {
                        firstDragElement.classList.remove('disabled');
                        firstRound = false;
                    }
            
                    // Disable Population data and enable Employment data
                    selected.classList.add('disabled');
                    selected.draggable = false;
            
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                } else if (selected.textContent == "Employment data") {
                    if (chartDataChecker == "Employment") {
                        return;
                    }
                    chartDataChecker = "Employment";
                    startYear = 1987;
                    endYear = 2021;
            
                    // Disable Employment data and enable Population data
                    selected.classList.add('disabled');
                    selected.draggable = false;
            
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                } else if (selected.textContent == "Migration data") {
                    chartDataChecker = "Migration";
                    startYear = 1990;
                    endYear = 2021;

                    // Go here only once, after page has loaded
                    if (firstRound) {
                        firstDragElement.classList.remove('disabled');
                        firstRound = false;
                    }
            
                    // Disable Employment data and enable Population data
                    selected.classList.add('disabled');
                    selected.draggable = false;
            
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                }
            
                createHTMLSliderComponents(startYear, endYear);
                fetchChartData(areaCode);
            
                // Remove the touchend event listener once triggered
                // In order to avoid reloading the chart when touched
                dropBox.removeEventListener("touchend", touchEndHandler);
            }
            dropBox.addEventListener("touchend", touchEndHandler);
        });
    }
} else { // Desktop device controller
    for (const item of dragElements) {
        item.addEventListener("dragstart", function(e) {
            let selected = e.target;
            dropBox.addEventListener("dragover", function(e) {
                e.preventDefault();
            });
    
            dropBox.addEventListener("drop", function(e) {
                event.preventDefault();
                if (selected.textContent == "Population data") {
                    chartDataChecker = "Population";
                    startYear = 1990;
                    endYear = 2021;
    
                    // Go here only once, after page has loaded
                    if (firstRound) {
                        firstDragElement.classList.remove('disabled');
                        firstRound = false;
                    }

                    // Disable Population data and enable Employment data
                    selected.classList.add('disabled');
                    selected.draggable = false;
    
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                } else if (selected.textContent == "Employment data") {
                    if (chartDataChecker == "Employment") {
                        return;
                    }
                    chartDataChecker = "Employment";
                    startYear = 1987;
                    endYear = 2021;
    
                    // Disable Employment data and enable Population data
                    selected.classList.add('disabled');
                    selected.draggable = false;
    
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                } else if (selected.textContent == "Migration data") {
                    chartDataChecker = "Migration";
                    startYear = 1990;
                    endYear = 2021;
    
                    // Go here only once, after page has loaded
                    if (firstRound) {
                        firstDragElement.classList.remove('disabled');
                        firstRound = false;
                    }

                    // Disable Employment data and enable Population data
                    selected.classList.add('disabled');
                    selected.draggable = false;
    
                    if (previouslyDisabledElement) {
                        enableElement(previouslyDisabledElement);
                    }
                    previouslyDisabledElement = selected;
                }
                
    
                createHTMLSliderComponents(startYear, endYear);
                fetchChartData(areaCode);
            });
        });
    }
}


function displayErrorMessage() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = 'An error occurred! Try again.';
  
    setTimeout(() => {
        errorContainer.textContent = '';
    }, 3000);
}


const svgLink = document.getElementById("svg-link");

svgLink.addEventListener("click", function() {
    downloadChartImageSVG();
})

const pngLink = document.getElementById("png-link");

pngLink.addEventListener("click", function() {
    downloadChartImagePNG();
})

const searchBtn = document.getElementById("search");

searchBtn.addEventListener("click", function() {
    fetchChartData(areaCode)
})


